import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { differenceInHours, isPast } from "date-fns";

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
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              include: {
                assignees: {
                  include: {
                    user: true,
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

    const allTasks = project.columns.flatMap((c) => c.tasks);
    const totalTasks = allTasks.length;

    // A task is completed if it belongs to an isDone column
    const doneColumnIds = new Set(
      project.columns.filter((c) => c.isDone).map((c) => c.id)
    );
    const completedTasks = allTasks.filter((t) => doneColumnIds.has(t.columnId)).length;
    const progressPercentage =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const now = new Date();
    let overdueTasks = 0;
    let dueSoonTasks = 0;
    let onTrackTasks = 0;

    const priorityBreakdown = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    allTasks.forEach((task) => {
      // Priority count
      const p = task.priority as keyof typeof priorityBreakdown;
      if (priorityBreakdown[p] !== undefined) {
        priorityBreakdown[p]++;
      }

      // Deadline calculation (only for non-completed tasks)
      if (!doneColumnIds.has(task.columnId) && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (isPast(dueDate) && dueDate.getTime() < now.getTime()) {
          overdueTasks++;
        } else {
          const diffHours = differenceInHours(dueDate, now);
          if (diffHours <= 24) {
            dueSoonTasks++;
          } else {
            onTrackTasks++;
          }
        }
      }
    });

    const columnBreakdown = project.columns.map((col) => ({
      columnId: col.id,
      name: col.name,
      color: col.color,
      count: col.tasks.length,
      percentage: totalTasks === 0 ? 0 : Math.round((col.tasks.length / totalTasks) * 100),
    }));

    // Workload allocation per user
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        color: true,
      },
    });

    const workloadMap = new Map<
      string,
      {
        user: (typeof users)[0];
        taskCount: number;
        completedCount: number;
        urgentCount: number;
      }
    >();

    users.forEach((user) => {
      workloadMap.set(user.id, {
        user,
        taskCount: 0,
        completedCount: 0,
        urgentCount: 0,
      });
    });

    allTasks.forEach((task) => {
      const isCompleted = doneColumnIds.has(task.columnId);
      const isUrgent = task.priority === "URGENT";

      task.assignees.forEach((assignee) => {
        const entry = workloadMap.get(assignee.userId);
        if (entry) {
          entry.taskCount++;
          if (isCompleted) entry.completedCount++;
          if (isUrgent) entry.urgentCount++;
        }
      });
    });

    const workloadAllocation = Array.from(workloadMap.values()).filter(
      (w) => w.taskCount > 0
    );

    return NextResponse.json({
      totalTasks,
      completedTasks,
      progressPercentage,
      overdueTasks,
      dueSoonTasks,
      onTrackTasks,
      priorityBreakdown,
      columnBreakdown,
      workloadAllocation,
    });
  } catch (error) {
    console.error("GET /api/projects/[id]/progress error:", error);
    return NextResponse.json({ error: "Failed to calculate progress" }, { status: 500 });
  }
}
