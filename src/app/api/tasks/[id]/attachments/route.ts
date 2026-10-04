import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAttachmentSchema } from "@/types/zodSchemas";
import { getSocketIO } from "@/lib/socketServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = createAttachmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, url, size, mimeType } = parsed.data;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const attachment = await prisma.attachment.create({
      data: {
        taskId: id,
        name,
        url,
        size,
        mimeType,
      },
    });

    const io = getSocketIO();
    if (io) {
      io.to(`project:${task.projectId}`).emit("task:updated", {
        taskId: id,
        task: {} as any,
        changes: { attachmentAdded: attachment },
      });
    }

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks/[id]/attachments error:", error);
    return NextResponse.json({ error: "Failed to create attachment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) {
      return NextResponse.json({ error: "attachmentId is required" }, { status: 400 });
    }

    await prisma.attachment.delete({
      where: { id: attachmentId },
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
          changes: { attachmentDeleted: attachmentId },
        });
      }
    }

    return NextResponse.json({ success: true, attachmentId });
  } catch (error) {
    console.error("DELETE /api/tasks/[id]/attachments error:", error);
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}

