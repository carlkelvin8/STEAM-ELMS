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
  const body = await request.json();

  const progress = await prisma.progress.upsert({
    where: {
      userId_lessonId: {
        userId: body.userId,
        lessonId: body.lessonId,
      },
    },
    update: {
      status: body.status,
      score: body.score,
      completedAt: body.status === "COMPLETED" ? new Date() : null,
    },
    create: {
      userId: body.userId,
      lessonId: body.lessonId,
      status: body.status,
      score: body.score,
      completedAt: body.status === "COMPLETED" ? new Date() : null,
    },
  });

  if (body.status === "COMPLETED") {
    await updateEnrollmentProgress(body.userId, body.lessonId);
    // Fire-and-forget achievement checks
    checkAchievementMetric(body.userId, "lessons_completed");
    checkAchievementMetric(body.userId, "courses_completed");
  }

  return Response.json(progress, { status: 201 });
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
