import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSubtaskSchema } from "@/types/zodSchemas";
import { getSocketIO } from "@/lib/socketServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = createSubtaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, position } = parsed.data;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let subtaskPosition = position;
    if (subtaskPosition === undefined) {
      const lastSubtask = await prisma.subtask.findFirst({
        where: { taskId: id },
        orderBy: { position: "desc" },
      });
      subtaskPosition = lastSubtask ? lastSubtask.position + 1 : 1;
    }

    const subtask = await prisma.subtask.create({
      data: {
        taskId: id,
        title,
        position: subtaskPosition,
        isCompleted: false,
      },
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks/[id]/subtasks error:", error);
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { subtaskId, isCompleted, title } = body;

    if (!subtaskId) {
      return NextResponse.json({ error: "subtaskId is required" }, { status: 400 });
    }

    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        ...(isCompleted !== undefined && { isCompleted }),
        ...(title !== undefined && { title }),
      },
    });

    const task = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (task) {
      const io = getSocketIO();
      if (io) {
        io.to(`project:${task.projectId}`).emit("task:updated", {
          taskId: id,
          task: {} as any,
          changes: { subtaskUpdated: updated },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/tasks/[id]/subtasks error:", error);
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const subtaskId = searchParams.get("subtaskId");

    if (!subtaskId) {
      return NextResponse.json({ error: "subtaskId is required" }, { status: 400 });
    }

    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    const task = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (task) {
      const io = getSocketIO();
      if (io) {
        io.to(`project:${task.projectId}`).emit("task:updated", {
          taskId: id,
          task: {} as any,
          changes: { subtaskDeleted: subtaskId },
        });
      }
    }

    return NextResponse.json({ success: true, subtaskId });
  } catch (error) {
    console.error("DELETE /api/tasks/[id]/subtasks error:", error);
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
  }
}

