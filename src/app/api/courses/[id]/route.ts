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
  const { id } = await ctx.params;
  const body = await request.json();

  const course = await prisma.course.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
      difficulty: body.difficulty,
      estimatedHours: body.estimatedHours,
      published: body.published,
    },
  });

  return Response.json(course);
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/courses/[id]">
) {
  const { id } = await ctx.params;

  await prisma.course.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
