import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/projects/[id]/requests
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requests = await prisma.projectJoinRequest.findMany({
      where: {
        projectId: id,
        status: "PENDING",
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ error: "Failed to fetch join requests" }, { status: 500 });
  }
}

// PATCH /api/projects/[id]/requests
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { requestId, action, assignedRole = "MEMBER" } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: "requestId and action are required" }, { status: 400 });
    }

    const request = await prisma.projectJoinRequest.findUnique({
      where: { id: requestId },
      include: { user: true, project: true },
    });

    if (!request || request.projectId !== id) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      // 1. Update request status
      await prisma.projectJoinRequest.update({
        where: { id: requestId },
        data: {
          status: "ACCEPTED",
          assignedRole: assignedRole.toUpperCase(),
        },
      });

      // 2. Add user to ProjectMember with selected role
      const member = await prisma.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: id,
            userId: request.userId,
          },
        },
        create: {
          projectId: id,
          userId: request.userId,
          role: assignedRole.toUpperCase(),
        },
        update: {
          role: assignedRole.toUpperCase(),
        },
      });

      // Also update user's workspace-wide role if lead/admin
      if (assignedRole.toUpperCase() === "LEAD" || assignedRole.toUpperCase() === "ADMIN") {
        await prisma.user.update({
          where: { id: request.userId },
          data: { role: assignedRole.toUpperCase() },
        });
      }

      return NextResponse.json({
        success: true,
        member,
        message: `Accepted ${request.user.name} as ${assignedRole.toUpperCase()}!`,
      });
    } else if (action === "DECLINE") {
      await prisma.projectJoinRequest.update({
        where: { id: requestId },
        data: { status: "DECLINED" },
      });

      return NextResponse.json({
        success: true,
        message: `Declined join request from ${request.user.name}.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Handle join request error:", error);
    return NextResponse.json({ error: "Failed to update join request" }, { status: 500 });
  }
}
