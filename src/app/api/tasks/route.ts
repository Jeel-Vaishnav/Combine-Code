import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTaskSchema } from "@/types/zodSchemas";
import { logActivity } from "@/lib/activity";
import { getSocketIO } from "@/lib/socketServer";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = createTaskSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      projectId,
      columnId,
      title,
      description = "",
      priority = "MEDIUM",
      dueDate,
      assigneeIds = [],
      tagIds = [],
      position,
    } = parsed.data;

    // Determine position: if not provided, place at the bottom of the column
    let taskPosition = position;
    if (taskPosition === undefined) {
      const lastTask = await prisma.task.findFirst({
        where: { columnId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      taskPosition = lastTask ? lastTask.position + 1000.0 : 1000.0;
    }

    const newTask = await prisma.task.create({
      data: {
        projectId,
        columnId,
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        position: taskPosition,
        version: 1,
        assignees: {
          create: assigneeIds.map((userId) => ({ userId })),
        },
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
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
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        subtasks: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    const formattedTask = {
      id: newTask.id,
      projectId: newTask.projectId,
      columnId: newTask.columnId,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : null,
      position: newTask.position,
      version: newTask.version,
      createdAt: newTask.createdAt.toISOString(),
      updatedAt: newTask.updatedAt.toISOString(),
      assignees: newTask.assignees.map((a) => ({
        userId: a.userId,
        user: a.user,
      })),
      tags: newTask.tags.map((t) => ({
        tagId: t.tagId,
        tag: t.tag,
      })),
      subtasks: newTask.subtasks.map((s) => ({
        id: s.id,
        taskId: s.taskId,
        title: s.title,
        isCompleted: s.isCompleted,
        position: s.position,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      commentsCount: newTask._count.comments,
      attachmentsCount: newTask._count.attachments,
    };

    // Log activity
    const firstAssignee = assigneeIds[0];
    const systemUser = await prisma.user.findFirst();
    const actorId = firstAssignee || systemUser?.id || "usr_aarav";

    await logActivity({
      projectId,
      taskId: newTask.id,
      userId: actorId,
      action: "TASK_CREATED",
      details: { title: newTask.title, column: newTask.column.name },
    });

    // Real-time broadcast
    const io = getSocketIO();
    if (io) {
      io.to(`project:${projectId}`).emit("task:created", {
        task: formattedTask as any,
      });
    }

    return NextResponse.json(formattedTask, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
