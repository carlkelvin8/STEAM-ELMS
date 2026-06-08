"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  todayCompleted: boolean;
}

interface LessonInfo {
  id: string;
  title: string;
  type: string;
  order: number;
  duration: number | null;
  videoUrl: string | null;
}

interface ModuleInfo {
  id: string;
  title: string;
  order: number;
  lessons: LessonInfo[];
}

interface CourseInfo {
  id: string;
  title: string;
  description: string;
  modules: ModuleInfo[];
}

interface Enrollment {
  id: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  completedAt: string | null;
  course: CourseInfo;
}

interface ProgressRecord {
  id: string;
  status: string;
  score: number | null;
  completedAt: string | null;
  lessonId: string;
}

export default function ProgressPage() {
  const router = useRouter();
  const [user] = useState<{ id: string } | null>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
    }
    return null;
  });
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, ProgressRecord>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch(`/api/enrollments?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/progress?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/streaks?userId=${user.id}`).then((r) => r.json()),
    ])
      .then(([enrollmentsData, progressData, streakData]) => {
        setEnrollments(enrollmentsData);
        setStreak(streakData);
        const map = new Map<string, ProgressRecord>();
        for (const p of progressData) {
          map.set(p.lessonId, p);
        }
        setProgressMap(map);
      })
      .finally(() => setLoading(false));
  }, [router, user]);

  const markComplete = useCallback(
    async (lessonId: string) => {
      if (!user) return;
      setMarking(lessonId);

      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lessonId,
          status: "COMPLETED",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProgressMap((prev) => {
          const next = new Map(prev);
          next.set(lessonId, updated);
          return next;
        });

        setEnrollments((prev) =>
          prev.map((e) => ({ ...e })),
        );

        const [freshEnrollments] = await Promise.all([
          fetch(`/api/enrollments?userId=${user.id}`).then((r) => r.json()),
        ]);
        setEnrollments(freshEnrollments);
      }

      setMarking(null);
    },
    [user],
  );

  const getStatus = (lessonId: string): ProgressRecord | undefined =>
    progressMap.get(lessonId);

  const totalLessons = (course: CourseInfo) =>
    course.modules.reduce((a, m) => a + m.lessons.length, 0);

  const completedLessons = (course: CourseInfo) =>
    course.modules.reduce(
      (a, m) =>
        a + m.lessons.filter((l) => getStatus(l.id)?.status === "COMPLETED")
          .length,
      0,
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Progress</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Track your learning journey
        </p>
      </div>

      {streak && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-5 text-center">
            <div className="text-3xl mb-1">🔥</div>
            <p className="text-2xl font-bold">{streak.currentStreak}</p>
            <p className="text-xs text-zinc-500">Current streak</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-5 text-center">
            <div className="text-3xl mb-1">🏆</div>
            <p className="text-2xl font-bold">{streak.longestStreak}</p>
            <p className="text-xs text-zinc-500">Longest streak</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-5 text-center">
            <div className="text-3xl mb-1">📅</div>
            <p className="text-2xl font-bold">{streak.totalDaysActive}</p>
            <p className="text-xs text-zinc-500">Days active</p>
          </div>
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No enrolled courses yet</p>
          <Link
            href="/courses"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const total = totalLessons(course);
            const completed = completedLessons(course);
            const percent = enrollment.progress;

            return (
              <section
                key={enrollment.id}
                className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/courses/${course.id}`}
                        className="text-lg font-semibold hover:text-violet-600 transition-colors"
                      >
                        {course.title}
                      </Link>
                      <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">
                        {course.description}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Enrolled{" "}
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        {enrollment.completedAt &&
                          ` · Completed ${new Date(enrollment.completedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold">{percent}%</div>
                      <p className="text-xs text-zinc-400">
                        {completed}/{total} lessons
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent === 100
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-violet-500 to-indigo-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {course.modules.map((mod) => {
                    const modCompleted = mod.lessons.filter(
                      (l) => getStatus(l.id)?.status === "COMPLETED",
                    ).length;
                    return (
                      <div key={mod.id} className="px-8 py-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
                            Module {mod.order}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {modCompleted}/{mod.lessons.length}
                          </span>
                          {modCompleted === mod.lessons.length &&
                            mod.lessons.length > 0 && (
                              <span className="text-xs text-green-600 font-medium">
                                Complete
                              </span>
                            )}
                        </div>
                        <p className="text-sm font-medium mb-3">{mod.title}</p>
                        <div className="space-y-1.5">
                          {mod.lessons.map((lesson) => {
                            const prog = getStatus(lesson.id);
                            const done =
                              prog?.status === "COMPLETED";
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                              >
                                <div
                                  className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    done
                                      ? "bg-green-500 text-white"
                                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                                  }`}
                                >
                                  {done ? "✓" : lesson.order}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`text-sm ${
                                        done
                                          ? "text-zinc-400 line-through"
                                          : "font-medium"
                                      }`}
                                    >
                                      {lesson.title}
                                    </p>
                                    {lesson.videoUrl && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300 font-semibold">
                                        VIDEO
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-400">
                                    {(lesson.type ?? "").replace(/_/g, " ")}
                                    {lesson.duration &&
                                      ` · ${Math.ceil(lesson.duration / 60)} min`}
                                  </p>
                                </div>
                                {!done ? (
                                  <button
                                    onClick={() => markComplete(lesson.id)}
                                    disabled={marking === lesson.id}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50 shrink-0"
                                  >
                                    {marking === lesson.id
                                      ? "..."
                                      : "Mark complete"}
                                  </button>
                                ) : (
                                  <span className="text-xs text-green-600 font-medium shrink-0">
                                    {prog?.completedAt
                                      ? new Date(
                                          prog.completedAt,
                                        ).toLocaleDateString()
                                      : "Done"}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
