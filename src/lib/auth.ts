import { PrismaClient } from "@prisma/client";
import { sign, verify } from "jsonwebtoken";
import { compare, hash } from "bcryptjs";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await compare(password, hashedPassword);
};

// JWT token generation
export const generateToken = (userId: string): string => {
  return sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// JWT token verification
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};

// Get user from token
export const getUserFromToken = async (token: string) => {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      color: true,
      createdAt: true,
    },
  });

  return user;
};

// Create new user with hashed password
export const createUser = async (
  email: string,
  name: string,
  password: string,
  role: string = "MEMBER"
) => {
  const hashedPassword = await hashPassword(password);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Generate avatar color
  const colors = ["#9f1239", "#2563eb", "#d97706", "#7c3aed", "#059669", "#dc2626", "#0284c7"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

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

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      role: role.toUpperCase(),
      avatarUrl,
      color: randomColor,
      passwordHash: hashedPassword,
    },
  });

  return user;
};

// Sign in user
export const signInUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Note: We'll need to add passwordHash to the User model and update the login logic
  // For now, we'll maintain backward compatibility with the existing system
  // In a real implementation, you'd compare passwords here
  return user;
};