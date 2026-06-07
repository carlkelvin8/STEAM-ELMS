import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const poster = await prisma.aRPoster.findUnique({
    where: { id },
    include: {
      lesson: { select: { id: true, title: true } },
      course: { select: { id: true, title: true } },
    },
  });

  if (!poster) {
    return Response.json({ error: "Poster not found" }, { status: 404 });
  }

  return Response.json(poster);
}
