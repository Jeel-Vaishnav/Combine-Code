import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { patchTaskSchema } from "@/types/zodSchemas";
import { logActivity } from "@/lib/activity";
import { getSocketIO } from "@/lib/socketServer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        column: true,
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                color: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        subtasks: {
          orderBy: { position: "asc" },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                color: true,
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Organize threaded comments
    const topLevelComments: any[] = [];
    const commentMap = new Map<string, any>();

    task.comments.forEach((c) => {
      const commentObj = {
        id: c.id,
        taskId: c.taskId,
        authorId: c.authorId,
        author: c.author,
        parentId: c.parentId,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        replies: [],
      };
      commentMap.set(c.id, commentObj);
    });

    task.comments.forEach((c) => {
      const commentObj = commentMap.get(c.id);
      if (c.parentId && commentMap.has(c.parentId)) {
        commentMap.get(c.parentId).replies.push(commentObj);
      } else {
        topLevelComments.push(commentObj);
      }
    });

    const formattedTask = {
      id: task.id,
      projectId: task.projectId,
      columnId: task.columnId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      position: task.position,
      version: task.version,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignees: task.assignees.map((a) => ({
        userId: a.userId,
        user: a.user,
      })),
      tags: task.tags.map((t) => ({
        tagId: t.tagId,
        tag: t.tag,
      })),
      subtasks: task.subtasks.map((s) => ({
        id: s.id,
        taskId: s.taskId,
        title: s.title,
        isCompleted: s.isCompleted,
        position: s.position,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      attachments: task.attachments.map((att) => ({
        id: att.id,
        taskId: att.taskId,
        name: att.name,
        url: att.url,
        size: att.size,
        mimeType: att.mimeType,
        createdAt: att.createdAt.toISOString(),
      })),
      comments: topLevelComments,
      activities: task.activities.map((act) => ({
        id: act.id,
        projectId: act.projectId,
        taskId: act.taskId,
        userId: act.userId,
        user: act.user,
        action: act.action,
        details: act.details,
        createdAt: act.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(formattedTask);
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

/**
 * PATCH /api/tasks/[id]
 * Implements Tier 1 (Field-Level Patching) & Tier 2 (Optimistic Concurrency Control)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = patchTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      clientVersion,
      title,
      description,
      priority,
      dueDate,
      columnId,
      assigneeIds,
      tagIds,
      forceOverwrite,
      modifiedByUserId,
    } = parsed.data;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        column: true,
        assignees: { include: { user: true } },
        tags: { include: { tag: true } },
        subtasks: true,
        _count: { select: { comments: true, attachments: true } },
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const isContestedFieldModified = title !== undefined || description !== undefined;

    // TIER 2: Optimistic Locking with Monotonic Version Counter
    // If modifying contested fields without forceOverwrite, version match is enforced
    if (isContestedFieldModified && clientVersion !== undefined && !forceOverwrite) {
      // Execute atomic update: WHERE id = :id AND version = :clientVersion
      const updateResult = await prisma.task.updateMany({
        where: {
          id,
          version: clientVersion,
        },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(priority !== undefined && { priority }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(columnId !== undefined && { columnId }),
          version: { increment: 1 },
        },
      });

      // If affected rows === 0, check whether this is a genuine 2-person collision or 1 person saving
      if (updateResult.count === 0) {
        // Fetch current version from DB to provide 3-way diff context
        const currentDbTask = await prisma.task.findUnique({
          where: { id },
          include: {
            assignees: { include: { user: true } },
            tags: { include: { tag: true } },
            subtasks: true,
            _count: { select: { comments: true, attachments: true } },
          },
        });

        // Check who made the last change
        const lastLog = await prisma.activityLog.findFirst({
          where: { taskId: id },
          orderBy: { createdAt: "desc" },
        });

        // Determine if this is an explicit simulation or genuine multi-user conflict
        const isExplicitSimulation = clientVersion === -1;
        const isSameUser = Boolean(
          modifiedByUserId &&
          lastLog?.userId &&
          lastLog.userId === modifiedByUserId
        );
        const noPriorEditor = !lastLog || !lastLog.userId;

        // If it's the SAME person saving or no prior editor, and not an explicit simulation test,
        // apply the update cleanly without throwing a false 409 conflict
        if (!isExplicitSimulation && (isSameUser || noPriorEditor)) {
          await prisma.task.update({
            where: { id },
            data: {
              ...(title !== undefined && { title }),
              ...(description !== undefined && { description }),
              ...(priority !== undefined && { priority }),
              ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
              ...(columnId !== undefined && { columnId }),
              version: { increment: 1 },
            },
          });
        } else {
          // Genuine concurrent collision between 2 DIFFERENT people!
          const formattedCurrent = currentDbTask
            ? {
                id: currentDbTask.id,
                projectId: currentDbTask.projectId,
                columnId: currentDbTask.columnId,
                title: currentDbTask.title,
                description: currentDbTask.description,
                priority: currentDbTask.priority,
                dueDate: currentDbTask.dueDate ? currentDbTask.dueDate.toISOString() : null,
                position: currentDbTask.position,
                version: currentDbTask.version,
                createdAt: currentDbTask.createdAt.toISOString(),
                updatedAt: currentDbTask.updatedAt.toISOString(),
                assignees: currentDbTask.assignees.map((a) => ({
                  userId: a.userId,
                  user: a.user,
                })),
                tags: currentDbTask.tags.map((t) => ({
                  tagId: t.tagId,
                  tag: t.tag,
                })),
                subtasks: currentDbTask.subtasks.map((s) => ({
                  ...s,
                  createdAt: s.createdAt.toISOString(),
                  updatedAt: s.updatedAt.toISOString(),
                })),
                commentsCount: currentDbTask._count.comments,
                attachmentsCount: currentDbTask._count.attachments,
              }
            : null;

          console.warn(
            `⚔️ [OCC Conflict] Task ${id} contested between 2 users. Client version: ${clientVersion}, Current DB version: ${currentDbTask?.version}`
          );

          return NextResponse.json(
            {
              error: "CONFLICT",
              message:
                "A concurrent update conflict occurred. Another team member modified this task while you were editing.",
              currentVersion: formattedCurrent,
              yourAttempt: {
                title,
                description,
                priority,
                dueDate,
                clientVersion,
              },
            },
            { status: 409 }
          );
        }
      }
    } else {
      // TIER 1: Atomic Field-Level Patching
      // Non-contested updates or explicit forceOverwrite from Tier 3 resolution
      await prisma.task.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(priority !== undefined && { priority }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(columnId !== undefined && { columnId }),
          version: { increment: 1 },
        },
      });
    }

    // Sync Assignees if provided
    if (assigneeIds !== undefined) {
      await prisma.taskAssignee.deleteMany({ where: { taskId: id } });
      if (assigneeIds.length > 0) {
        await prisma.taskAssignee.createMany({
          data: assigneeIds.map((userId) => ({ taskId: id, userId })),
        });
      }
    }

    // Sync Tags if provided
    if (tagIds !== undefined) {
      await prisma.taskTag.deleteMany({ where: { taskId: id } });
      if (tagIds.length > 0) {
        await prisma.taskTag.createMany({
          data: tagIds.map((tagId) => ({ taskId: id, tagId })),
        });
      }
    }

    // Fetch the updated task with fresh relations
    const updatedTask = await prisma.task.findUniqueOrThrow({
      where: { id },
      include: {
        column: true,
        assignees: { include: { user: true } },
        tags: { include: { tag: true } },
        subtasks: true,
        _count: { select: { comments: true, attachments: true } },
      },
    });

    const formattedTask = {
      id: updatedTask.id,
      projectId: updatedTask.projectId,
      columnId: updatedTask.columnId,
      title: updatedTask.title,
      description: updatedTask.description,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : null,
      position: updatedTask.position,
      version: updatedTask.version,
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
      assignees: updatedTask.assignees.map((a) => ({
        userId: a.userId,
        user: a.user,
      })),
      tags: updatedTask.tags.map((t) => ({
        tagId: t.tagId,
        tag: t.tag,
      })),
      subtasks: updatedTask.subtasks.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      commentsCount: updatedTask._count.comments,
      attachmentsCount: updatedTask._count.attachments,
    };

    // Determine actor
    const actorId = modifiedByUserId || updatedTask.assignees[0]?.userId || "usr_aarav";
    const actionName = forceOverwrite
      ? "CONFLICT_RESOLVED"
      : columnId && columnId !== existingTask.columnId
      ? "TASK_MOVED"
      : "TASK_UPDATED";

    await logActivity({
      projectId: updatedTask.projectId,
      taskId: updatedTask.id,
      userId: actorId,
      action: actionName,
      details: {
        title: updatedTask.title,
        changes: Object.keys(body).filter((k) => k !== "clientVersion" && k !== "modifiedByUserId"),
        version: updatedTask.version,
      },
    });

    // Broadcast real-time update to project room
    const io = getSocketIO();
    if (io) {
      io.to(`project:${updatedTask.projectId}`).emit("task:updated", {
        taskId: updatedTask.id,
        task: formattedTask as any,
        changes: body,
      });
    }

    return NextResponse.json(formattedTask);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true, title: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    // Broadcast deletion
    const io = getSocketIO();
    if (io) {
      io.to(`project:${task.projectId}`).emit("task:deleted", { taskId: id });
    }

    return NextResponse.json({ success: true, taskId: id });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
