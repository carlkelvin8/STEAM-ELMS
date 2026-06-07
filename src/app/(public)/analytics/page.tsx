"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
  name: string;
  email: string;
  role: string;
  memberSince: string;
}

interface Stats {
  totalEnrolled: number;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  quizAverage: number;
  quizAttempts: number;
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

interface QuizScore {
  score: number;
  submittedAt: string;
}

interface Activity {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  completedAt: string;
}

interface AnalyticsData {
  user: UserInfo;
  stats: Stats;
  courseProgress: CourseProgress[];
  quizPerformance: QuizScore[];
  recentActivity: Activity[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(raw);
    fetch(`/api/analytics?userId=${parsed.id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500">
        <p className="text-lg">Could not load analytics</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm text-violet-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const maxScore = Math.max(...data.quizPerformance.map((q) => q.score), 100);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {data.user.name.split(" ")[0]}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Here&apos;s your learning overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <svg className="size-5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Enrolled</p>
          </div>
          <p className="text-3xl font-bold">{data.stats.totalEnrolled}</p>
          <p className="text-xs text-zinc-400 mt-1">active courses</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Completed</p>
          </div>
          <p className="text-3xl font-bold">{data.stats.completedLessons}</p>
          <p className="text-xs text-zinc-400 mt-1">of {data.stats.totalLessons} lessons</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="size-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Quiz Avg</p>
          </div>
          <p className="text-3xl font-bold">{data.stats.quizAverage}%</p>
          <p className="text-xs text-zinc-400 mt-1">{data.stats.quizAttempts} attempt{data.stats.quizAttempts !== 1 ? "s" : ""}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-9 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <svg className="size-5 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Overall</p>
          </div>
          <p className="text-3xl font-bold">{data.stats.overallProgress}%</p>
          <p className="text-xs text-zinc-400 mt-1">course completion</p>
        </div>
      </div>

      {/* Course Progress */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Course Progress</h2>
        <div className="grid gap-4">
          {data.courseProgress.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="mb-2">No courses enrolled yet</p>
              <Link href="/courses" className="text-sm text-violet-600 hover:underline">Browse courses</Link>
            </div>
          ) : (
            data.courseProgress.map((cp) => (
              <Link
                key={cp.courseId}
                href={`/courses/${cp.courseId}`}
                className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">{cp.courseTitle}</h3>
                  <span className="text-sm font-bold">{cp.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      cp.progress === 100
                        ? "bg-green-500"
                        : "bg-gradient-to-r from-violet-500 to-indigo-500"
                    }`}
                    style={{ width: `${cp.progress}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {cp.completedLessons}/{cp.totalLessons} lessons completed
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Two columns: Quiz Performance + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quiz Performance */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quiz Performance</h2>
          <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
            {data.quizPerformance.length === 0 ? (
              <p className="text-sm text-zinc-400 py-6 text-center">No quizzes attempted yet</p>
            ) : (
              <div className="space-y-3">
                {data.quizPerformance.map((q, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400 w-16 shrink-0">
                      {new Date(q.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <div className="flex-1 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          q.score >= 80
                            ? "bg-emerald-500"
                            : q.score >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${(q.score / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${
                      q.score >= 80
                        ? "text-emerald-600"
                        : q.score >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}>
                      {q.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-400 py-6 text-center">No activity yet</p>
            ) : (
              <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.recentActivity.map((a) => (
                  <div key={a.lessonId + a.completedAt} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="size-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.lessonTitle}</p>
                        <p className="text-xs text-zinc-400">{a.courseTitle}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(a.completedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
