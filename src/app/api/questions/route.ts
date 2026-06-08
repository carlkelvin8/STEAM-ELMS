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
  try {
    const body = await request.json();
    const { userId, lessonId, answers } = body;

    if (typeof userId !== "string" || !userId.trim()) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }
    if (typeof lessonId !== "string" || !lessonId.trim()) {
      return Response.json({ error: "lessonId is required" }, { status: 400 });
    }
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return Response.json({ error: "answers must be an object mapping question IDs to answers" }, { status: 400 });
    }

    for (const [qId, val] of Object.entries(answers)) {
      if (typeof qId !== "string" || typeof val !== "string") {
        return Response.json({ error: "Each answer must be a string value" }, { status: 400 });
      }
    }

    const questions = await prisma.question.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
    });

    if (questions.length === 0) {
      return Response.json({ error: "No questions found for this lesson" }, { status: 404 });
    }

    let score = 0;
    for (const q of questions) {
      const userAnswer = answers[q.id];
      if (userAnswer === q.answer) {
        score++;
      }
    }

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

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
  } catch (err) {
    console.error("Questions error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
