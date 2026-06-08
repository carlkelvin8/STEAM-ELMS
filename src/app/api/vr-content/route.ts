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
  try {
    const body = await request.json();
    const { lessonId, title: rawTitle, description, format, url, thumbnailUrl, settings } = body;

    if (typeof lessonId !== "string" || !lessonId.trim()) {
      return Response.json({ error: "lessonId is required" }, { status: 400 });
    }
    if (typeof rawTitle !== "string" || !rawTitle.trim()) {
      return Response.json({ error: "title is required" }, { status: 400 });
    }
    if (typeof url !== "string" || !url.trim()) {
      return Response.json({ error: "url is required" }, { status: 400 });
    }

    const title = rawTitle.trim().slice(0, 200);

    try { new URL(url); } catch { return Response.json({ error: "Invalid URL format" }, { status: 400 }); }

    const VALID_FORMATS = ["VR_SCENE", "AR_POSTER", "360_VIDEO", "MODEL_VIEWER"];
    const vrFormat = format && VALID_FORMATS.includes(format) ? format : "VR_SCENE";

    const existing = await prisma.vRContent.findUnique({ where: { lessonId } });
    if (existing) {
      return Response.json({ error: "Lesson already has VR content" }, { status: 409 });
    }

    const content = await prisma.vRContent.create({
      data: {
        lessonId,
        title,
        description: description && typeof description === "string" ? description.trim().slice(0, 1000) : null,
        format: vrFormat,
        url,
        thumbnailUrl: thumbnailUrl && typeof thumbnailUrl === "string" ? thumbnailUrl : null,
        settings: settings && typeof settings === "string" ? settings : null,
      },
    });

    return Response.json(content, { status: 201 });
  } catch (err) {
    console.error("VR content error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
