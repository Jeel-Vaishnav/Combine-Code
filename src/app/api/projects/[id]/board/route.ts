import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        targetDate: true,
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { position: "asc" },
              include: {
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
                subtasks: {
                  orderBy: { position: "asc" },
                  select: {
                    id: true,
                    taskId: true,
                    title: true,
                    isCompleted: true,
                    position: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    attachments: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Transform tasks to match TaskItem interface
    const formattedColumns = project.columns.map((column) => ({
      id: column.id,
      projectId: column.projectId,
      name: column.name,
      key: column.key,
      order: column.order,
      color: column.color,
      isDone: column.isDone,
      tasks: column.tasks.map((task) => ({
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
          ...s,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })),
        commentsCount: task._count.comments,
        attachmentsCount: task._count.attachments,
      })),
    }));

    return NextResponse.json({
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      slug: project.slug,
      description: project.description,
      status: project.status,
      targetDate: project.targetDate ? project.targetDate.toISOString() : null,
      columns: formattedColumns,
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/board error:", error);
    return NextResponse.json({ error: "Failed to fetch project board" }, { status: 500 });
  }
}
