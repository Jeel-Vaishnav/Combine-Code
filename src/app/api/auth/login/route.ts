import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find existing user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password (for existing users without passwordHash, fall back to old behavior)
    const isValidPassword = user.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : true; // Backward compatibility for users created before password system

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

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
      message: "Logged in successfully!"
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}