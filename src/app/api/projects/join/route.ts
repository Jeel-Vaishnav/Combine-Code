import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/projects/join
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId, note } = body;

    if (!code || !userId) {
      return NextResponse.json({ error: "Project code and user ID are required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Find project by code or id or slug
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { code: cleanCode },
          { id: cleanCode.toLowerCase() },
          { slug: cleanCode.toLowerCase() },
        ],
      },
      include: {
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "No project found with code: " + cleanCode }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = project.members.find((m) => m.userId === userId);
    if (existingMember) {
      return NextResponse.json({
        message: "You are already a member of this project.",
        project,
        alreadyMember: true,
      });
    }

    // Check if join request is already pending
    const existingRequest = await prisma.projectJoinRequest.findFirst({
      where: {
        projectId: project.id,
        userId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({
        message: "A join request is already pending review with the project creator.",
        project,
        isPending: true,
      });
    }

    // Create join request
    const joinRequest = await prisma.projectJoinRequest.create({
      data: {
        projectId: project.id,
        userId,
        note: note || "Requesting access to collaborate.",
        status: "PENDING",
        assignedRole: "MEMBER",
      },
      include: {
        user: true,
        project: true,
      },
    });

    return NextResponse.json({
      success: true,
      joinRequest,
      project: { id: project.id, name: project.name, code: project.code },
      message: `Join request sent to the creator of "${project.name}"!`,
    });
  } catch (error) {
    console.error("Join project error:", error);
    return NextResponse.json({ error: "Failed to send join request" }, { status: 500 });
  }
}
