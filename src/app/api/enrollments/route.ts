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
  const body = await request.json();

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
}
