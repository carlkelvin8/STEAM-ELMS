import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

async function checkAchievementMetric(userId: string, metric: string) {
  let value = 0;
  switch (metric) {
    case "lessons_completed":
      value = await prisma.progress.count({ where: { userId, status: "COMPLETED" } });
      break;
    case "courses_completed":
      value = await prisma.enrollment.count({ where: { userId, completed: true } });
      break;
    case "notes_created":
      value = await prisma.note.count({ where: { userId } });
      break;
    default:
      return;
  }
  const achievements = await prisma.achievement.findMany({ where: { metric } });
  for (const a of achievements) {
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: a.id } },
    });
    const newProgress = Math.min(value, a.threshold);
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

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (lessonId) where.lessonId = lessonId;

  const progress = await prisma.progress.findMany({
    where,
    include: {
      lesson: { select: { title: true, type: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  return Response.json(progress);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, lessonId, status, score } = body;

    if (typeof userId !== "string" || !userId.trim()) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }
    if (typeof lessonId !== "string" || !lessonId.trim()) {
      return Response.json({ error: "lessonId is required" }, { status: 400 });
    }

    const VALID_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
    if (typeof status !== "string" || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    if (score !== undefined && score !== null) {
      if (typeof score !== "number" || isNaN(score) || score < 0 || score > 100) {
        return Response.json({ error: "Score must be a number between 0 and 100" }, { status: 400 });
      }
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        status,
        score: score ?? undefined,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        status,
        score: score ?? undefined,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    if (status === "COMPLETED") {
      await updateEnrollmentProgress(userId, lessonId);
      checkAchievementMetric(userId, "lessons_completed");
      checkAchievementMetric(userId, "courses_completed");
    }

    return Response.json(progress, { status: 201 });
  } catch (err) {
    console.error("Progress error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function updateEnrollmentProgress(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: { select: { id: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) return;

  const course = lesson.module.course;
  const allLessonIds = course.modules.flatMap((m) =>
    m.lessons.map((l) => l.id)
  );
  const totalLessons = allLessonIds.length;

  const completedLessons = await prisma.progress.count({
    where: {
      userId,
      lessonId: { in: allLessonIds },
      status: "COMPLETED",
    },
  });

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  await prisma.enrollment.updateMany({
    where: { userId, courseId: course.id },
    data: {
      progress: progressPercent,
      completed: progressPercent >= 100,
      completedAt: progressPercent >= 100 ? new Date() : undefined,
    },
  });
}
