import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  validateId,
  validateRequiredString,
  validateOptionalString,
  validatePassword,
  sanitizeString,
} from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const idErr = validateId(id);
  if (idErr) {
    return Response.json({ error: idErr }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: id! },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ user });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name: rawName, bio: rawBio, avatarUrl, currentPassword, newPassword } = body;

    const idErr = validateId(id);
    if (idErr) {
      return Response.json({ error: idErr }, { status: 400 });
    }

    const data: Record<string, string | null> = {};

    if (rawName !== undefined) {
      const nameErr = validateRequiredString(rawName, "Name");
      if (nameErr) return Response.json({ error: nameErr }, { status: 400 });
      data.name = sanitizeString(rawName, 100);
    }

    if (rawBio !== undefined) {
      const bioErr = validateOptionalString(rawBio, "Bio", 500);
      if (bioErr) return Response.json({ error: bioErr }, { status: 400 });
      data.bio = rawBio ? sanitizeString(rawBio, 500) : null;
    }

    if (avatarUrl !== undefined) {
      const urlErr = validateOptionalString(avatarUrl, "Avatar URL", 2048);
      if (urlErr) return Response.json({ error: urlErr }, { status: 400 });
      data.avatarUrl = avatarUrl || null;
    }

    // Password change
    if (currentPassword !== undefined || newPassword !== undefined) {
      if (!currentPassword || !newPassword) {
        return Response.json({ error: "Both current and new password are required" }, { status: 400 });
      }

      const passErr = validatePassword(newPassword);
      if (passErr) return Response.json({ error: passErr }, { status: 400 });

      const user = await prisma.user.findUnique({ where: { id }, select: { passwordHash: true } });
      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return Response.json({ error: "Current password is incorrect" }, { status: 403 });
      }

      data.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(data).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return Response.json({ user });
  } catch (err) {
    console.error("Profile update error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
