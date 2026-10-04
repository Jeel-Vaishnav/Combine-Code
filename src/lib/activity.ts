import { prisma } from "./db";
import { getSocketIO } from "./socketServer";

export interface LogActivityParams {
  projectId: string;
  taskId?: string | null;
  userId: string;
  action: string;
  details: Record<string, unknown>;
}

export async function logActivity({
  projectId,
  taskId,
  userId,
  action,
  details,
}: LogActivityParams) {
  try {
    const activity = await prisma.activityLog.create({
      data: {
        projectId,
        taskId: taskId || null,
        userId,
        action,
        details: JSON.stringify(details),
      },
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
    });

    // Broadcast to real-time project room if socket server is active
    const io = getSocketIO();
    if (io) {
      io.to(`project:${projectId}`).emit("activity:logged", {
        activity: {
          id: activity.id,
          projectId: activity.projectId,
          taskId: activity.taskId,
          userId: activity.userId,
          user: activity.user,
          action: activity.action,
          details: activity.details,
          createdAt: activity.createdAt.toISOString(),
        },
      });
    }

    return activity;
  } catch (err) {
    console.error("Failed to log activity:", err);
    return null;
  }
}
