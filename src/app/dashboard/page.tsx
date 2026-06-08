"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface DashboardData {
  user: { name: string; email: string; role: string; memberSince: string };
  stats: {
    totalEnrolled: number;
    totalLessons: number;
    completedLessons: number;
    overallProgress: number;
    quizAverage: number;
    quizAttempts: number;
  };
  courseProgress: { courseId: string; courseTitle: string; totalLessons: number; completedLessons: number; progress: number }[];
  recentActivity: { lessonId: string; lessonTitle: string; courseTitle: string; completedAt: string }[];
}

const quickLinks = [
  { label: "Courses", href: "/courses", icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342", color: "from-violet-600 to-indigo-600" },
  { label: "Flashcards", href: "/flashcards", icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z", color: "from-pink-500 to-rose-600" },
  { label: "Posters", href: "/posters", icon: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z", color: "from-amber-500 to-orange-600" },
  { label: "Lab", href: "/lab", icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5", color: "from-cyan-500 to-blue-600" },
  { label: "Campus", href: "/campus", icon: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25", color: "from-emerald-500 to-green-600" },
  { label: "Notes", href: "/notes", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10", color: "from-purple-500 to-violet-600" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const hh = new Date().getHours();
  const greeting = hh < 12 ? "Good morning" : hh < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const user = JSON.parse(raw);
    Promise.all([
      fetch(`/api/analytics?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/streaks?userId=${user.id}`).then((r) => r.json()),
    ]).then(([analytics]) => {
      setData(analytics);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p>Could not load dashboard data</p>
        <Link href="/courses" className="text-violet-600 hover:text-violet-700 mt-2 inline-block text-sm">
          Browse courses
        </Link>
      </div>
    );
  }

  const { stats, courseProgress, recentActivity } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{greeting}, {data.user.name.split(" ")[0]}</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {stats.completedLessons}/{stats.totalLessons} lessons completed &middot; {stats.quizAttempts} quizzes taken
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/20">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats.totalEnrolled}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Enrolled courses</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-green-500/20">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats.overallProgress}%</p>
          <p className="text-xs text-zinc-500 mt-0.5">Overall progress</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats.completedLessons}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Lessons done</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/20">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats.quizAverage}%</p>
          <p className="text-xs text-zinc-500 mt-0.5">Quiz average</p>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-zinc-500 uppercase tracking-wider">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all group"
            >
              <div className={`size-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Course progress + Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Course progress */}
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Course Progress</h2>
            <Link href="/progress" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {courseProgress.slice(0, 4).map((cp) => (
              <div key={cp.courseId}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium truncate">{cp.courseTitle}</span>
                  <span className="text-xs text-zinc-500 shrink-0 ml-2">{cp.completedLessons}/{cp.totalLessons}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${cp.totalLessons > 0 ? (cp.completedLessons / cp.totalLessons) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {courseProgress.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-6">Enroll in a course to track progress</p>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <Link href="/progress" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-0">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 6).map((a, i) => (
                <div key={a.lessonId} className={`flex items-start gap-3 py-3 ${i < Math.min(recentActivity.length, 6) - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""}`}>
                  <div className="size-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <Link
                      href={`/courses/${a.lessonId}`}
                      className="text-sm font-medium hover:text-violet-600 transition-colors line-clamp-1"
                    >
                      {a.lessonTitle}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-0.5">{a.courseTitle}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {new Date(a.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 text-center py-6">No activity yet. Start a lesson!</p>
            )}
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6">
        <h2 className="text-sm font-semibold mb-3">Account</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-zinc-500">{data.user.email}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="text-zinc-500 capitalize">{data.user.role.toLowerCase()}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="text-zinc-500">Member since {new Date(data.user.memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
          <Link href="/dashboard/settings" className="ml-auto text-xs text-violet-600 hover:text-violet-700 font-medium">
            Edit profile
          </Link>
        </div>
      </div>
    </div>
  );
}
