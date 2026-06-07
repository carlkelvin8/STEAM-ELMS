import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");
  const courseId = searchParams.get("courseId");

  const where: Record<string, unknown> = {};
  if (lessonId) where.lessonId = lessonId;
  if (courseId) where.courseId = courseId;

  const posters = await prisma.aRPoster.findMany({
    where,
    include: {
      lesson: { select: { id: true, title: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(posters);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const poster = await prisma.aRPoster.create({
    data: {
      title: body.title,
      description: body.description,
      format: body.format ?? "AR_POSTER",
      config: body.config,
      imageUrl: body.imageUrl,
      lessonId: body.lessonId,
      courseId: body.courseId,
    },
  });

  return Response.json(poster, { status: 201 });
}
