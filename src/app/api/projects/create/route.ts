import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function generateProjectCode(projectName: string): string {
  const prefix = projectName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase() || "PRJ";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomChar = crypto.randomBytes(2).toString("hex").toUpperCase().substring(0, 3);
  return `${prefix}-${randomNum}-${randomChar}`;
}

// POST /api/projects/create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, userId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
    const code = generateProjectCode(cleanName);

    // Get or create default workspace
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Algothon Workspace",
          slug: "algothon-workspace",
        },
      });
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: cleanName,
        slug,
        code,
        ownerId: userId || null,
        description: description || `Collaborative workspace for ${cleanName}`,
        columns: {
          create: [
            { name: "Backlog", key: "backlog", order: 1000, color: "#64748b" },
            { name: "To Do", key: "todo", order: 2000, color: "#3b82f6" },
            { name: "In Progress", key: "in_progress", order: 3000, color: "#f59e0b" },
            { name: "Review", key: "review", order: 4000, color: "#8b5cf6" },
            { name: "Done", key: "done", order: 5000, color: "#10b981", isDone: true },
          ],
        },
      },
      include: {
        columns: true,
      },
    });

    // If userId provided, add as OWNER member
    if (userId) {
      try {
        await prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId,
            role: "OWNER",
          },
        });
      } catch (err) {
        console.error("Could not create project owner member:", err);
      }
    }

    return NextResponse.json({
      project,
      code,
      message: `Project "${project.name}" created with code ${code}!`,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
