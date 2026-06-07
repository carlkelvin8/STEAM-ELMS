import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const otherUserId = searchParams.get("otherUserId");
  const courseId = searchParams.get("courseId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  // Get messages between two users
  if (otherUserId) {
    const where: Record<string, unknown> = {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    };
    if (courseId) where.courseId = courseId;

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return Response.json(messages);
  }

  // Get all conversations for a user
  const sent = await prisma.message.findMany({
    where: { senderId: userId },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });

  const received = await prisma.message.findMany({
    where: { receiverId: userId },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  const otherIds = new Set([
    ...sent.map(m => m.receiverId),
    ...received.map(m => m.senderId),
  ]);

  const conversations = await Promise.all(
    Array.from(otherIds).map(async (otherId) => {
      const [lastMessage, unreadCount, otherUser] = await Promise.all([
        prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherId },
              { senderId: otherId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
          select: { message: true, createdAt: true, senderId: true },
        }),
        prisma.message.count({
          where: { senderId: otherId, receiverId: userId, read: false },
        }),
        prisma.user.findUnique({
          where: { id: otherId },
          select: { id: true, name: true, role: true, avatarUrl: true },
        }),
      ]);

      return {
        user: otherUser,
        lastMessage: lastMessage?.message ?? null,
        lastMessageAt: lastMessage?.createdAt?.toISOString() ?? null,
        lastMessageFromMe: lastMessage?.senderId === userId,
        unreadCount,
      };
    })
  );

  conversations.sort((a, b) => {
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return Response.json(conversations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { senderId, receiverId, courseId, message } = body;

  if (!senderId || !receiverId || !message?.trim()) {
    return Response.json({ error: "senderId, receiverId, and message are required" }, { status: 400 });
  }

  const msg = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      courseId: courseId || null,
      message: message.trim(),
    },
    include: {
      sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
    },
  });

  return Response.json(msg, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { userId, otherUserId } = body;

  if (!userId || !otherUserId) {
    return Response.json({ error: "userId and otherUserId are required" }, { status: 400 });
  }

  await prisma.message.updateMany({
    where: { senderId: otherUserId, receiverId: userId, read: false },
    data: { read: true },
  });

  return Response.json({ success: true });
}
