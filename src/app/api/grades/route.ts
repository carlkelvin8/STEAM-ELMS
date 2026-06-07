import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const courseId = searchParams.get("courseId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                select: { id: true, title: true, type: true },
              },
            },
          },
        },
      },
    },
  });

  const result = [];

  for (const enrollment of enrollments) {
    const lessonIds = enrollment.course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id)
    );

    const progressRecords = await prisma.progress.findMany({
      where: { userId, lessonId: { in: lessonIds } },
    });

    const submissions = await prisma.submission.findMany({
      where: { userId, lessonId: { in: lessonIds } },
    });

    const scoredProgress = progressRecords.filter((p) => p.score != null);
    const scoredSubmissions = submissions.filter((s) => s.score != null);

    const allScores = [
      ...scoredProgress.map((p) => p.score!),
      ...scoredSubmissions.map((s) => s.score!),
    ];

    const average =
      allScores.length > 0
        ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100) / 100
        : null;

    const maxPossibleScore = 100;
    const percentage = average != null ? Math.round((average / maxPossibleScore) * 100) : null;

    let letterGrade = null;
    if (percentage != null) {
      if (percentage >= 90) letterGrade = "A";
      else if (percentage >= 80) letterGrade = "B";
      else if (percentage >= 70) letterGrade = "C";
      else if (percentage >= 60) letterGrade = "D";
      else letterGrade = "F";
    }

    const lessonDetails = await Promise.all(
      lessonIds.map(async (id) => {
        const progress = progressRecords.find((p) => p.lessonId === id);
        const lessonSubmissions = submissions.filter((s) => s.lessonId === id);
        const lessonScores = [
          ...(progress?.score != null ? [progress.score] : []),
          ...lessonSubmissions.filter((s) => s.score != null).map((s) => s.score!),
        ];
        const avg =
          lessonScores.length > 0
            ? Math.round((lessonScores.reduce((a, b) => a + b, 0) / lessonScores.length) * 100) / 100
            : null;
        const lesson = enrollment.course.modules
          .flatMap((m) => m.lessons)
          .find((l) => l.id === id);
        return {
          lessonId: id,
          title: lesson?.title ?? "Unknown",
          type: lesson?.type ?? "UNKNOWN",
          score: avg,
          status: progress?.status ?? "NOT_STARTED",
        };
      })
    );

    result.push({
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.title,
      enrollmentProgress: enrollment.progress,
      completed: enrollment.completed,
      averageScore: average,
      percentage,
      letterGrade,
      totalLessons: lessonIds.length,
      completedLessons: progressRecords.filter((p) => p.status === "COMPLETED").length,
      lessons: lessonDetails,
    });
  }

  if (courseId) {
    const course = result.find((r) => r.courseId === courseId);
    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }
    return Response.json(course);
  }

  return Response.json(result);
}
