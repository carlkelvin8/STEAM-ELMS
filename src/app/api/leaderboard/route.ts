import { prisma } from "@/lib/prisma";

export async function GET() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      enrollments: {
        select: { progress: true, completed: true },
      },
      submissions: {
        where: { score: { not: null } },
        select: { score: true },
        orderBy: { submittedAt: "desc" },
      },
      progress: {
        where: { status: "COMPLETED", completedAt: { not: null } },
        select: { completedAt: true },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  const ranked = students.map((s) => {
    const completedLessons = s.progress.length;

    const quizScores = s.submissions.filter((sub) => sub.score !== null).map((sub) => sub.score!);
    const quizAverage =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : 0;

    const dates = new Set<string>();
    for (const p of s.progress) {
      if (p.completedAt) dates.add(p.completedAt.toISOString().slice(0, 10));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    let currentStreak = 0;
    if (dates.has(todayStr)) {
      currentStreak = 1;
      for (let i = 1; ; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (dates.has(d.toISOString().slice(0, 10))) currentStreak++;
        else break;
      }
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (dates.has(yesterday.toISOString().slice(0, 10))) {
        currentStreak = 1;
        for (let i = 2; ; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          if (dates.has(d.toISOString().slice(0, 10))) currentStreak++;
          else break;
        }
      }
    }

    const avgProgress =
      s.enrollments.length > 0
        ? Math.round(s.enrollments.reduce((a, e) => a + e.progress, 0) / s.enrollments.length)
        : 0;

    return {
      userId: s.id,
      name: s.name,
      avatarUrl: s.avatarUrl,
      completedLessons,
      quizAverage,
      currentStreak,
      avgProgress,
      coursesEnrolled: s.enrollments.length,
    };
  });

  return Response.json(ranked);
}
