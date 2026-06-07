import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get("instructorId");

  if (!instructorId) {
    return Response.json({ error: "instructorId is required" }, { status: 400 });
  }

  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true },
  });

  const courseIds = courses.map((c) => c.id);

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const studentMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    totalCourses: number;
    courses: { id: string; title: string }[];
    lastActive: string;
  }>();

  for (const enrollment of enrollments) {
    const existing = studentMap.get(enrollment.user.id);
    if (existing) {
      existing.totalCourses++;
      existing.courses.push(enrollment.course);
    } else {
      studentMap.set(enrollment.user.id, {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
        avatarUrl: enrollment.user.avatarUrl,
        totalCourses: 1,
        courses: [enrollment.course],
        lastActive: enrollment.enrolledAt.toISOString(),
      });
    }
  }

  const students = Array.from(studentMap.values()).sort((a, b) => b.totalCourses - a.totalCourses);

  return Response.json({ students, total: students.length });
}
