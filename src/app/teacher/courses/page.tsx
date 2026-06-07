"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string | null;
  difficulty: string | null;
  published: boolean;
  _count: { enrollments: number; modules: number };
}

export default function TeacherCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const user = JSON.parse(raw);
    if (user.role !== "INSTRUCTOR") { router.push("/dashboard"); return; }

    fetch(`/api/courses?instructorId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const togglePublish = async (courseId: string, current: boolean) => {
    const res = await fetch(`/api/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !current }),
    });
    if (res.ok) {
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, published: !current } : c));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading courses...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <svg className="size-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-sm font-medium">No courses yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div key={course.id} className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${course.published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                      {course.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>{course._count?.enrollments ?? 0} enrolled</span>
                    <span>{course._count?.modules ?? 0} modules</span>
                    {course.category && <span>{course.category}</span>}
                    {course.difficulty && <span>{course.difficulty}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/teacher/courses/${course.id}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => togglePublish(course.id, course.published)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      course.published
                        ? "border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        : "border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    }`}
                  >
                    {course.published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
