import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");

  if (!moduleId) {
    return Response.json({ error: "moduleId is required" }, { status: 400 });
  }

  const resources = await prisma.moduleResource.findMany({
    where: { moduleId },
    orderBy: { order: "asc" },
  });

  return Response.json(resources);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleId, title: rawTitle, type, url, content } = body;

    if (typeof moduleId !== "string" || !moduleId.trim()) {
      return Response.json({ error: "moduleId is required" }, { status: 400 });
    }
    if (typeof rawTitle !== "string" || !rawTitle.trim()) {
      return Response.json({ error: "title is required" }, { status: 400 });
    }

    const title = rawTitle.trim().slice(0, 200);

    const VALID_TYPES = ["PDF", "VIDEO", "LINK", "ARTICLE", "FILE"];
    const resourceType = type && VALID_TYPES.includes(type) ? type : "PDF";

    if (url !== undefined && url !== null && typeof url !== "string") {
      return Response.json({ error: "URL must be a string" }, { status: 400 });
    }

    if (content !== undefined && content !== null && typeof content !== "string") {
      return Response.json({ error: "Content must be a string" }, { status: 400 });
    }

    const last = await prisma.moduleResource.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const resource = await prisma.moduleResource.create({
      data: {
        moduleId,
        title,
        type: resourceType,
        url: url ?? null,
        content: content ?? null,
        order: (last?.order ?? -1) + 1,
      },
    });

    return Response.json(resource, { status: 201 });
  } catch (err) {
    console.error("Resource create error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Resource id is required" }, { status: 400 });
  }

  await prisma.moduleResource.delete({ where: { id } });
  return Response.json({ success: true });
}
