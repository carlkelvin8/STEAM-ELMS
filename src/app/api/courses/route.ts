import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

  const where: Record<string, unknown> = { published: true };
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;

  const courses = await prisma.course.findMany({
    where,
    include: {
      instructor: { select: { name: true } },
      modules: {
        include: { lessons: { select: { id: true } } },
      },
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(courses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      instructorId: body.instructorId,
      category: body.category,
      difficulty: body.difficulty,
      estimatedHours: body.estimatedHours,
      published: body.published ?? false,
    },
  });

  return Response.json(course, { status: 201 });
}
