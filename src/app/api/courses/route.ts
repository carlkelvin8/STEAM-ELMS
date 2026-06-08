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
  try {
    const body = await request.json();

    if (typeof body.title !== "string" || !body.title.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }
    if (typeof body.description !== "string" || !body.description.trim()) {
      return Response.json({ error: "Description is required" }, { status: 400 });
    }
    if (typeof body.instructorId !== "string" || !body.instructorId.trim()) {
      return Response.json({ error: "Instructor ID is required" }, { status: 400 });
    }

    const title = body.title.trim().slice(0, 200);
    const description = body.description.trim().slice(0, 2000);

    const VALID_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
    const difficulty = body.difficulty && VALID_DIFFICULTIES.includes(body.difficulty) ? body.difficulty : undefined;

    const estimatedHours = typeof body.estimatedHours === "number" && !isNaN(body.estimatedHours) && body.estimatedHours >= 0 && body.estimatedHours <= 1000 ? body.estimatedHours : undefined;

    const published = typeof body.published === "boolean" ? body.published : false;

    const course = await prisma.course.create({
      data: { title, description, instructorId: body.instructorId, category: body.category || null, difficulty: difficulty ?? null, estimatedHours, published },
    });

    return Response.json(course, { status: 201 });
  } catch (err) {
    console.error("Course create error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
