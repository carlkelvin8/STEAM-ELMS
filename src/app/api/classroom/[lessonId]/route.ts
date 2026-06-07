import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        select: {
          title: true,
          course: { select: { id: true, title: true } },
        },
      },
      vrContent: {
        select: { id: true, format: true, url: true, settings: true },
      },
    },
  });

  if (!lesson) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  return Response.json({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    videoUrl: lesson.videoUrl,
    courseTitle: lesson.module.course.title,
    courseId: lesson.module.course.id,
    moduleTitle: lesson.module.title,
    vrContent: lesson.vrContent,
  });
}
