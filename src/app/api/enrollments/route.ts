import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const where = userId ? { userId } : {};

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      course: {
        include: {
          modules: {
            include: { lessons: { select: { id: true, title: true } } },
          },
          instructor: { select: { id: true, name: true, role: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return Response.json(enrollments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (typeof body.userId !== "string" || !body.userId.trim()) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }
    if (typeof body.courseId !== "string" || !body.courseId.trim()) {
      return Response.json({ error: "courseId is required" }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: body.userId }, select: { id: true } });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: body.courseId }, select: { id: true } });
    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: body.userId,
          courseId: body.courseId,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "Already enrolled in this course" },
        { status: 409 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: body.userId,
        courseId: body.courseId,
      },
    });

    return Response.json(enrollment, { status: 201 });
  } catch (err) {
    console.error("Enrollment error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
