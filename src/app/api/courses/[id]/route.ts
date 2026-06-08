import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/courses/[id]">
) {
  const { id } = await ctx.params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { name: true, bio: true } },
      modules: {
        include: {
          lessons: {
            include: { vrContent: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      tags: true,
      enrollments: true,
    },
  });

  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  return Response.json(course);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/courses/[id]">
) {
  try {
    const { id } = await ctx.params;
    if (typeof id !== "string" || !id.trim()) {
      return Response.json({ error: "Course ID is required" }, { status: 400 });
    }

    const body = await request.json();

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return Response.json({ error: "Title must be a non-empty string" }, { status: 400 });
      }
      data.title = body.title.trim().slice(0, 200);
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        return Response.json({ error: "Description must be a non-empty string" }, { status: 400 });
      }
      data.description = body.description.trim().slice(0, 2000);
    }

    if (body.category !== undefined) {
      data.category = typeof body.category === "string" ? body.category.trim().slice(0, 100) : body.category;
    }

    const VALID_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
    if (body.difficulty !== undefined) {
      if (body.difficulty && !VALID_DIFFICULTIES.includes(body.difficulty)) {
        return Response.json({ error: "Invalid difficulty level" }, { status: 400 });
      }
      data.difficulty = body.difficulty || null;
    }

    if (body.estimatedHours !== undefined) {
      if (body.estimatedHours !== null && (typeof body.estimatedHours !== "number" || isNaN(body.estimatedHours) || body.estimatedHours < 0 || body.estimatedHours > 1000)) {
        return Response.json({ error: "Estimated hours must be between 0 and 1000" }, { status: 400 });
      }
      data.estimatedHours = body.estimatedHours;
    }

    if (body.published !== undefined) {
      if (typeof body.published !== "boolean") {
        return Response.json({ error: "Published must be a boolean" }, { status: 400 });
      }
      data.published = body.published;
    }

    if (Object.keys(data).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const course = await prisma.course.update({
      where: { id },
      data,
    });

    return Response.json(course);
  } catch (err) {
    console.error("Course update error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/courses/[id]">
) {
  const { id } = await ctx.params;
  if (typeof id !== "string" || !id.trim()) {
    return Response.json({ error: "Course ID is required" }, { status: 400 });
  }

  await prisma.course.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
