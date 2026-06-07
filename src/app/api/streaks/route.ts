import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const progress = await prisma.progress.findMany({
    where: { userId, status: "COMPLETED", completedAt: { not: null } },
    select: { completedAt: true },
    orderBy: { completedAt: "desc" },
  });

  const dates = new Set<string>();
  for (const p of progress) {
    if (p.completedAt) {
      dates.add(p.completedAt.toISOString().slice(0, 10));
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  let currentStreak = 0;
  if (dates.has(todayStr)) {
    currentStreak = 1;
    for (let i = 1; ; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (dates.has(key)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (dates.has(yesterdayStr)) {
      currentStreak = 1;
      for (let i = 2; ; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (dates.has(key)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  const sorted = [...dates].sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  const totalDaysActive = dates.size;

  return Response.json({
    currentStreak,
    longestStreak,
    totalDaysActive,
    todayCompleted: dates.has(todayStr),
    dailyActivity: Array.from(dates).map((date) => ({ date, count: 1 })),
  });
}
