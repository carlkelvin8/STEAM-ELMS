import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return Response.json({ error: "User ID required" }, { status: 400 });
  }

  const achievements = await prisma.achievement.findMany({
    orderBy: { category: "asc" },
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
  });

  const uaMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

  const result = achievements.map((a) => {
    const ua = uaMap.get(a.id);
    return {
      ...a,
      progress: ua?.progress ?? 0,
      unlocked: ua?.unlocked ?? false,
      unlockedAt: ua?.unlockedAt ?? null,
    };
  });

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const { userId, metric, value } = await request.json();
  if (!userId || !metric || value === undefined) {
    return Response.json({ error: "userId, metric, and value required" }, { status: 400 });
  }

  const achievements = await prisma.achievement.findMany({
    where: { metric },
  });

  const results: { id: string; title: string; unlocked: boolean; progress: number }[] = [];

  for (const a of achievements) {
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: a.id } },
    });

    const newProgress = Math.min(value, a.threshold);
    const wasUnlocked = existing?.unlocked ?? false;
    const newUnlocked = newProgress >= a.threshold;

    const ua = await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: a.id } },
      update: {
        progress: newProgress,
        unlocked: newUnlocked || wasUnlocked,
        unlockedAt: newUnlocked && !wasUnlocked ? new Date() : undefined,
      },
      create: {
        userId,
        achievementId: a.id,
        progress: newProgress,
        unlocked: newUnlocked,
        unlockedAt: newUnlocked ? new Date() : null,
      },
    });

    results.push({
      id: a.id,
      title: a.title,
      unlocked: ua.unlocked,
      progress: ua.progress,
    });
  }

  return Response.json({ checked: results.length, results });
}
