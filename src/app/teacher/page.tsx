"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CourseSummary {
  id: string;
  title: string;
  description: string;
  published: boolean;
  _count: { enrollments: number; modules: number; lessons?: number };
}

interface DashboardData {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  courses: CourseSummary[];
  recentMessages: { id: string; sender: { name: string }; message: string; createdAt: string }[];
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const user = JSON.parse(raw);
    if (user.role !== "INSTRUCTOR") { router.push("/dashboard"); return; }

    Promise.all([
      fetch(`/api/courses?instructorId=${user.id}`).then(r => r.json()),
      fetch(`/api/chat?userId=${user.id}`).then(r => r.json()),
    ]).then(([coursesData, messagesData]) => {
      const courseList = Array.isArray(coursesData) ? coursesData : [];
      const totalStudents = courseList.reduce((sum: number, c: CourseSummary) => sum + (c._count?.enrollments ?? 0), 0);
      const totalLessons = courseList.reduce((sum: number, c: CourseSummary) => sum + (c._count?.lessons ?? 0), 0);

      setData({
        totalCourses: courseList.length,
        totalStudents,
        totalLessons,
        courses: courseList,
        recentMessages: Array.isArray(messagesData) ? messagesData.slice(0, 5).map((c: { user: { id: string; name: string }; lastMessage: string; lastMessageAt: string }) => ({
          id: c.user?.id ?? "",
          sender: { name: c.user?.name ?? "Unknown" },
          message: c.lastMessage ?? "",
          createdAt: c.lastMessageAt ?? "",
        })) : [],
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p>Could not load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, Instructor</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {data.totalCourses} courses &middot; {data.totalStudents} enrolled students
          </p>
        </div>
        <Link
          href="/teacher/courses"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25 transition-all"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Manage Courses
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{data.totalCourses}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Active courses</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{data.totalStudents}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Enrolled students</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{data.totalLessons}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Total lessons</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/20">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{data.recentMessages.length}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Active conversations</p>
        </div>
      </div>

      {/* Course List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Courses</h2>
          <Link href="/teacher/courses" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {data.courses.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-sm">No courses yet. Create your first course!</p>
            </div>
          ) : (
            data.courses.slice(0, 6).map((course) => (
              <Link
                key={course.id}
                href={`/teacher/courses/${course.id}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold group-hover:text-emerald-600 transition-colors">{course.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{course._count?.enrollments ?? 0} enrolled &middot; {course._count?.modules ?? 0} modules</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${course.published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                    {course.published ? "Published" : "Draft"}
                  </span>
                  <svg className="size-5 text-zinc-300 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/teacher/courses" className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors text-center group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
              <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm font-medium">New Course</p>
          </Link>
          <Link href="/chat" className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors text-center group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/20">
              <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Messages</p>
          </Link>
          <Link href="/teacher/students" className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors text-center group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20">
              <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Students</p>
          </Link>
          <Link href="/teacher/grades" className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors text-center group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
              <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
            </div>
            <p className="text-sm font-medium">Grades</p>
          </Link>
          <Link href="/analytics" className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors text-center group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Analytics</p>
          </Link>
          <Link href="/dashboard/settings" className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors text-center group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20">
              <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
