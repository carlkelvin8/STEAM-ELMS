import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken, setSessionCookie } from "@/lib/auth";
import { validateEmail, validatePassword, normalizeEmail } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail, password } = body;

    const emailErr = validateEmail(rawEmail);
    if (emailErr) {
      return Response.json({ error: emailErr }, { status: 400 });
    }

    const passErr = validatePassword(password);
    if (passErr) {
      return Response.json({ error: passErr }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createToken({
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const response = Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, token },
    });

    response.headers.set("Set-Cookie", setSessionCookie(token));

    return response;
  } catch (err) {
    console.error("Login error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
