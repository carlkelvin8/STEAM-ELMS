import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            include: { lessons: { select: { id: true, title: true, type: true, duration: true } } },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const allLessonIds = enrollments.flatMap((e) =>
    e.course.modules.flatMap((m) => m.lessons.flatMap((l) => l.id))
  );

  const progressRecords = await prisma.progress.findMany({
    where: { userId, lessonId: { in: allLessonIds } },
    orderBy: { completedAt: "desc" },
  });

  const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));

  const submissions = await prisma.submission.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    take: 20,
  });

  const totalLessons = allLessonIds.length;
  const completedLessons = progressRecords.filter((p) => p.status === "COMPLETED").length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const quizScores = submissions.filter((s) => s.score !== null);
  const quizAverage =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, s) => a + (s.score ?? 0), 0) / quizScores.length)
      : 0;

  const courseProgress = enrollments.map((e) => {
    const courseLessons = e.course.modules.flatMap((m) => m.lessons);
    const completed = courseLessons.filter((l) => progressMap.get(l.id)?.status === "COMPLETED").length;
    return {
      courseId: e.course.id,
      courseTitle: e.course.title,
      totalLessons: courseLessons.length,
      completedLessons: completed,
      progress: e.progress,
    };
  });

  const recentActivity = progressRecords
    .filter((p) => p.status === "COMPLETED" && p.completedAt)
    .slice(0, 10)
    .map((p) => {
      const enrollment = enrollments.find((e) =>
        e.course.modules.some((m) => m.lessons.some((l) => l.id === p.lessonId))
      );
      const lessonInfo = enrollment?.course.modules
        .flatMap((m) => m.lessons)
        .find((l) => l.id === p.lessonId);
      return {
        lessonId: p.lessonId,
        lessonTitle: lessonInfo?.title ?? "Unknown",
        courseTitle: enrollment?.course.title ?? "Unknown",
        completedAt: p.completedAt,
      };
    });

  return Response.json({
    user: { name: user.name, email: user.email, role: user.role, memberSince: user.createdAt },
    stats: {
      totalEnrolled: enrollments.length,
      totalLessons,
      completedLessons,
      overallProgress,
      quizAverage,
      quizAttempts: quizScores.length,
    },
    courseProgress,
    quizPerformance: quizScores.map((s) => ({
      score: s.score,
      submittedAt: s.submittedAt,
    })),
    recentActivity,
  });
}
