import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

async function checkPerfectQuizAchievement(userId: string) {
  const perfectCount = await prisma.submission.count({
    where: { userId, score: 100 },
  });
  const achievements = await prisma.achievement.findMany({ where: { metric: "perfect_quizzes" } });
  for (const a of achievements) {
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: a.id } },
    });
    const newProgress = Math.min(perfectCount, a.threshold);
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
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
    select: { id: true, text: true, options: true, order: true },
  });

  return Response.json(questions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, lessonId, answers } = body;

  if (!userId || !lessonId || !answers) {
    return Response.json({ error: "userId, lessonId, and answers are required" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
  });

  let score = 0;
  for (const q of questions) {
    const userAnswer = answers[q.id];
    if (userAnswer === q.answer) {
      score++;
    }
  }

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  await prisma.submission.create({
    data: {
      userId,
      lessonId,
      score: percentage,
      feedback: `You scored ${score}/${total} (${percentage}%)`,
    },
  });

  if (percentage === 100) {
    checkPerfectQuizAchievement(userId);
  }

  return Response.json({ score, total, percentage, feedback: `You scored ${score}/${total} (${percentage}%)` });
}
