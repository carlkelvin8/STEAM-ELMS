import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "User ID required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
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
  const { id, name, bio, avatarUrl } = await request.json();

  if (!id) {
    return Response.json({ error: "User ID required" }, { status: 400 });
  }

  const data: Record<string, string | null> = {};
  if (name !== undefined) data.name = name;
  if (bio !== undefined) data.bio = bio;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

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
}
