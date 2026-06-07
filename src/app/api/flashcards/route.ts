import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

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
              lessons: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  const lessonIds = enrollments.flatMap((e) =>
    e.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  );

  const questions = await prisma.question.findMany({
    where: { lessonId: { in: lessonIds } },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: { select: { id: true, title: true, courseId: true } },
        },
      },
    },
    orderBy: [{ lessonId: "asc" }, { order: "asc" }],
  });

  const courseMap = new Map(enrollments.map((e) => [e.course.id, e.course.title]));

  const grouped = questions.reduce<Record<string, { courseTitle: string; lessonTitle: string; questions: { id: string; text: string; options: string[]; answer: string }[] }>>((acc, q) => {
    const courseId = q.lesson.module.courseId;
    const courseTitle = courseMap.get(courseId) ?? "Unknown";
    const lessonTitle = q.lesson.title;
    const key = `${courseId}::${q.lesson.id}`;
    if (!acc[key]) {
      acc[key] = { courseTitle, lessonTitle, questions: [] };
    }
    let parsedOptions: string[] = [];
    try {
      parsedOptions = JSON.parse(q.options ?? "[]");
    } catch {
      parsedOptions = [];
    }
    acc[key].questions.push({
      id: q.id,
      text: q.text,
      options: parsedOptions,
      answer: q.answer ?? "",
    });
    return acc;
  }, {});

  return Response.json(Object.values(grouped));
}
