import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { moveTaskSchema } from "@/types/zodSchemas";
import { calculateFractionalPosition } from "@/lib/fractionalIndex";
import { logActivity } from "@/lib/activity";
import { getSocketIO } from "@/lib/socketServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = moveTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { targetColumnId, prevPosition, nextPosition, targetPosition, userId } = parsed.data;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        column: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Determine target position via fractional indexing
    const newPosition =
      targetPosition !== undefined
        ? targetPosition
        : calculateFractionalPosition(prevPosition, nextPosition);

    const sourceColumnId = existingTask.columnId;
    const isColumnChange = sourceColumnId !== targetColumnId;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        columnId: targetColumnId,
        position: newPosition,
        version: { increment: 1 },
      },
      include: {
        column: true,
      },
    });

    const actorId = userId || "usr_aarav";
    await logActivity({
      projectId: updatedTask.projectId,
      taskId: updatedTask.id,
      userId: actorId,
      action: "TASK_MOVED",
      details: {
        taskTitle: updatedTask.title,
        fromColumn: existingTask.column.name,
        toColumn: updatedTask.column.name,
        isColumnChange,
        newPosition,
        version: updatedTask.version,
      },
    });

    // Real-time broadcast
    const io = getSocketIO();
    if (io) {
      io.to(`project:${updatedTask.projectId}`).emit("task:moved", {
        taskId: id,
        sourceColumnId,
        targetColumnId,
        position: newPosition,
        version: updatedTask.version,
        userId: actorId,
      });
    }

    return NextResponse.json({
      taskId: id,
      sourceColumnId,
      targetColumnId,
      position: newPosition,
      version: updatedTask.version,
    });
  } catch (error) {
    console.error("POST /api/tasks/[id]/move error:", error);
    return NextResponse.json({ error: "Failed to move task" }, { status: 500 });
  }
}
