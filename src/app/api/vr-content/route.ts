import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const content = await prisma.vRContent.findMany({
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: {
            select: { id: true, title: true, courseId: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(content);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lessonId, title, description, format, url, thumbnailUrl, settings } = body;

  if (!lessonId || !title || !url) {
    return Response.json({ error: "lessonId, title, and url are required" }, { status: 400 });
  }

  const existing = await prisma.vRContent.findUnique({ where: { lessonId } });
  if (existing) {
    return Response.json({ error: "Lesson already has VR content" }, { status: 409 });
  }

  const content = await prisma.vRContent.create({
    data: {
      lessonId,
      title,
      description: description ?? null,
      format: format ?? "VR_SCENE",
      url,
      thumbnailUrl: thumbnailUrl ?? null,
      settings: settings ?? null,
    },
  });

  return Response.json(content, { status: 201 });
}
