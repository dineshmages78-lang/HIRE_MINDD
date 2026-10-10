import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "agentic-placement-system-super-secret-key-32chars";
const COOKIE_NAME = "placement_session";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<"STUDENT" | "ADMIN" | "RECRUITER">;
  studentProfileId?: string;
  adminProfileId?: string;
  recruiterProfileId?: string;
  companyId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, passwordPlain: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      roles: { include: { role: true } },
      student: true,
      admin: true,
      recruiter: true,
    },
  });

  if (!user) return null;

  const valid = await verifyPassword(passwordPlain, user.passwordHash);
  if (!valid) return null;

  const roles = user.roles.map((r) => r.role.name as "STUDENT" | "ADMIN" | "RECRUITER");

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles,
    studentProfileId: user.student?.id,
    adminProfileId: user.admin?.id,
    recruiterProfileId: user.recruiter?.id,
    companyId: user.recruiter?.companyId,
  };
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}
