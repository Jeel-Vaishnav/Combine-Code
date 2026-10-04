import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let workspace = await prisma.workspace.findFirst();

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Algothon Workspace",
          slug: "algothon-workspace",
          description: "Main Collaborative Engineering Workspace",
        },
      });
    }

    if (!userId) {
      return NextResponse.json({
        ...workspace,
        projects: [],
      });
    }

    // Only return projects that belong to this specific user (created by user or user is a member)
    const userProjects = await prisma.project.findMany({
      where: {
        workspaceId: workspace.id,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        ownerId: true,
        description: true,
        status: true,
        members: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                color: true,
              }
            },
            role: true,
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ...workspace,
      projects: userProjects,
    });
  } catch (error) {
    console.error("GET /api/workspaces error:", error);
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
  }
}
