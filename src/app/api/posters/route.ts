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
  try {
    const body = await request.json();

    if (typeof body.title !== "string" || !body.title.trim()) {
      return Response.json({ error: "title is required" }, { status: 400 });
    }
    if (typeof body.config !== "string" || !body.config.trim()) {
      return Response.json({ error: "config is required" }, { status: 400 });
    }

    const VALID_FORMATS = ["VR_SCENE", "AR_POSTER", "360_VIDEO", "MODEL_VIEWER"];
    const format = body.format && VALID_FORMATS.includes(body.format) ? body.format : "AR_POSTER";

    const poster = await prisma.aRPoster.create({
      data: {
        title: body.title.trim().slice(0, 200),
        description: body.description && typeof body.description === "string" ? body.description.trim().slice(0, 2000) : null,
        format,
        config: body.config,
        imageUrl: body.imageUrl && typeof body.imageUrl === "string" ? body.imageUrl : null,
        lessonId: body.lessonId && typeof body.lessonId === "string" ? body.lessonId : null,
        courseId: body.courseId && typeof body.courseId === "string" ? body.courseId : null,
      },
    });

    return Response.json(poster, { status: 201 });
  } catch (err) {
    console.error("Poster create error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
