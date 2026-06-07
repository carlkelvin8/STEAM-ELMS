import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

async function checkNotesAchievement(userId: string) {
  const count = await prisma.note.count({ where: { userId } });
  const achievements = await prisma.achievement.findMany({ where: { metric: "notes_created" } });
  for (const a of achievements) {
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: a.id } },
    });
    const newProgress = Math.min(count, a.threshold);
    const wasUnlocked = existing?.unlocked ?? false;
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: a.id } },
      update: { progress: newProgress, unlocked: newProgress >= a.threshold || wasUnlocked, unlockedAt: newProgress >= a.threshold && !wasUnlocked ? new Date() : undefined },
      create: { userId, achievementId: a.id, progress: newProgress, unlocked: newProgress >= a.threshold, unlockedAt: newProgress >= a.threshold ? new Date() : null },
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const lessonId = searchParams.get("lessonId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { userId };
  if (lessonId) where.lessonId = lessonId;

  const notes = await prisma.note.findMany({
    where,
    include: {
      lesson: { select: { id: true, title: true, module: { select: { courseId: true, course: { select: { title: true } } } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json(notes);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("userId");

  if (!id || !userId) {
    return Response.json({ error: "Note id and userId are required" }, { status: 400 });
  }

  const note = await prisma.note.findFirst({ where: { id, userId } });
  if (!note) {
    return Response.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });
  return Response.json({ success: true });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, lessonId, content: rawContent } = body;

  if (!userId || !lessonId || !rawContent?.trim()) {
    return Response.json({ error: "userId, lessonId, and content are required" }, { status: 400 });
  }

  const existing = await prisma.note.findFirst({
    where: { userId, lessonId },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    const updated = await prisma.note.update({
      where: { id: existing.id },
      data: { content: rawContent.trim() },
    });
    checkNotesAchievement(userId);
    return Response.json(updated);
  }

  const note = await prisma.note.create({
    data: { userId, lessonId, content: rawContent.trim() },
  });

  checkNotesAchievement(userId);
  return Response.json(note, { status: 201 });
}
