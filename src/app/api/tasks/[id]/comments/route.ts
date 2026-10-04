import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCommentSchema } from "@/types/zodSchemas";
import { logActivity } from "@/lib/activity";
import { getSocketIO } from "@/lib/socketServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { content, authorId, parentId } = parsed.data;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true, title: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        taskId: id,
        authorId,
        parentId: parentId || null,
        content,
      },
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
    });

    const formattedComment = {
      id: comment.id,
      taskId: comment.taskId,
      authorId: comment.authorId,
      author: comment.author,
      parentId: comment.parentId,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      replies: [],
    };

    await logActivity({
      projectId: task.projectId,
      taskId: task.id,
      userId: authorId,
      action: "COMMENT_ADDED",
      details: {
        taskTitle: task.title,
        snippet: content.slice(0, 60),
        isReply: !!parentId,
      },
    });

    // Real-time broadcast
    const io = getSocketIO();
    if (io) {
      io.to(`project:${task.projectId}`).emit("comment:added", {
        taskId: id,
        comment: formattedComment,
      });
    }

    return NextResponse.json(formattedComment, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks/[id]/comments error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
