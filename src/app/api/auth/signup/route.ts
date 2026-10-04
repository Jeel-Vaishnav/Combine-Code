import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = "MEMBER" } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      return NextResponse.json({ user, message: "User already exists. Logging in..." }, { status: 200 });
    }

    // Generate avatar color
    const colors = ["#9f1239", "#2563eb", "#d97706", "#7c3aed", "#059669", "#dc2626", "#0284c7"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`;

    // Ensure base workspace exists
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

    // Create new user with hashed password
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        role: role.toUpperCase(),
        avatarUrl,
        color: randomColor,
        passwordHash: hashedPassword,
      },
    });

    // Generate JWT token
    const token = await new Promise<string>((resolve, reject) => {
      const { sign } = require("jsonwebtoken");
      const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
      sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" }, (err: Error | null, token: string | undefined) => {
        if (err) reject(err);
        else resolve(token!);
      });
    });

    // Return user info (without password) and token
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: "Account created successfully!"
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 });
  }
}