import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken, setSessionCookie } from "@/lib/auth";
import {
  validateEmail,
  validatePassword,
  validateRequiredString,
  validateRole,
  normalizeEmail,
  sanitizeString,
} from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name: rawName, email: rawEmail, password, role } = body;

    const nameErr = validateRequiredString(rawName, "Name");
    if (nameErr) {
      return Response.json({ error: nameErr }, { status: 400 });
    }

    const emailErr = validateEmail(rawEmail);
    if (emailErr) {
      return Response.json({ error: emailErr }, { status: 400 });
    }

    const passErr = validatePassword(password);
    if (passErr) {
      return Response.json({ error: passErr }, { status: 400 });
    }

    const roleErr = validateRole(role);
    if (roleErr) {
      return Response.json({ error: roleErr }, { status: 400 });
    }

    const name = sanitizeString(rawName, 100);
    const email = normalizeEmail(rawEmail);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: role === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT" },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = await createToken({
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const response = Response.json(
      { user: { ...user, token } },
      { status: 201 }
    );

    response.headers.set("Set-Cookie", setSessionCookie(token));

    return response;
  } catch (err) {
    console.error("Register error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
