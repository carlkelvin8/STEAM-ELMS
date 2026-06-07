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
  const body = await request.json();
  const { moduleId, title, type, url, content } = body;

  if (!moduleId || !title) {
    return Response.json({ error: "moduleId and title are required" }, { status: 400 });
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
      type: type ?? "PDF",
      url: url ?? null,
      content: content ?? null,
      order: (last?.order ?? -1) + 1,
    },
  });

  return Response.json(resource, { status: 201 });
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
