import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get("instructorId");
  const courseId = searchParams.get("courseId");

  if (!instructorId) {
    return Response.json({ error: "instructorId is required" }, { status: 400 });
  }

  const courseFilter = courseId ? { id: courseId } : {};
  const courses = await prisma.course.findMany({
    where: { instructorId, ...courseFilter },
    select: {
      id: true,
      title: true,
      enrollments: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  const result = [];

  for (const course of courses) {
    const courseData: {
      courseId: string;
      courseTitle: string;
      students: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string | null;
        averageScore: number | null;
        percentage: number | null;
        letterGrade: string | null;
        completedLessons: number;
        totalLessons: number;
        enrollmentProgress: number;
      }[];
    } = {
      courseId: course.id,
      courseTitle: course.title,
      students: [],
    };

    const lessonIds = (
      await prisma.lesson.findMany({
        where: { module: { courseId: course.id } },
        select: { id: true },
      })
    ).map((l) => l.id);

    for (const enrollment of course.enrollments) {
      const progressRecords = await prisma.progress.findMany({
        where: { userId: enrollment.userId, lessonId: { in: lessonIds } },
      });

      const submissions = await prisma.submission.findMany({
        where: { userId: enrollment.userId, lessonId: { in: lessonIds } },
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

      const percentage = average != null ? Math.round((average / 100) * 100) : null;

      let letterGrade = null;
      if (percentage != null) {
        if (percentage >= 90) letterGrade = "A";
        else if (percentage >= 80) letterGrade = "B";
        else if (percentage >= 70) letterGrade = "C";
        else if (percentage >= 60) letterGrade = "D";
        else letterGrade = "F";
      }

      courseData.students.push({
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
        avatarUrl: enrollment.user.avatarUrl,
        averageScore: average,
        percentage,
        letterGrade,
        completedLessons: progressRecords.filter((p) => p.status === "COMPLETED").length,
        totalLessons: lessonIds.length,
        enrollmentProgress: enrollment.progress,
      });
    }

    courseData.students.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
    result.push(courseData);
  }

  return Response.json(result);
}
