"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
  duration: number | null;
  description: string | null;
}

interface ModuleData {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string | null;
  difficulty: string | null;
  estimatedHours: number | null;
  published: boolean;
  modules: ModuleData[];
  _count: { enrollments: number };
}

export default function TeacherCourseDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setCourseId(id);
    })();
  }, [params]);

  useEffect(() => {
    if (!courseId) return;
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const user = JSON.parse(raw);
    if (user.role !== "INSTRUCTOR") { router.push("/dashboard"); return; }

    fetch(`/api/courses/${courseId}`)
      .then(r => r.json())
      .then(data => {
        const enrollmentCount = Array.isArray(data.enrollments) ? data.enrollments.length : 0;
        setCourse({ ...data, _count: { enrollments: enrollmentCount } });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading course...
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-zinc-500">Course not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
            <Link href="/teacher/courses" className="hover:text-emerald-600 transition-colors">My Courses</Link>
            <span>/</span>
          </div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-zinc-500 mt-1 text-sm">{course.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
            <span>{course._count?.enrollments ?? 0} enrolled</span>
            <span>{course.modules.length} modules</span>
            {course.category && <span>{course.category}</span>}
            {course.difficulty && <span>{course.difficulty}</span>}
            {course.estimatedHours && <span>{course.estimatedHours}h estimated</span>}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${course.published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
              {course.published ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Modules & Lessons */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Course Content</h2>
        {course.modules.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-sm">No modules yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {course.modules.map((mod) => (
              <div key={mod.id} className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-400">Module {mod.order}</span>
                      <h3 className="font-semibold">{mod.title}</h3>
                    </div>
                    {mod.description && (
                      <p className="text-xs text-zinc-500 mt-0.5">{mod.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">{mod.lessons.length} lessons</span>
                </div>
                <div className="divide-y divide-zinc-100/60 dark:divide-zinc-800/30">
                  {mod.lessons.length === 0 ? (
                    <p className="text-xs text-zinc-400 p-4">No lessons yet</p>
                  ) : (
                    mod.lessons.sort((a, b) => a.order - b.order).map((lesson, i) => (
                      <div key={lesson.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-medium text-zinc-400 w-5 shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-xs text-zinc-500 truncate">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            lesson.type === "VIDEO" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                            lesson.type === "ARTICLE" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                            lesson.type === "QUIZ" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" :
                            "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          }`}>
                            {lesson.type}
                          </span>
                          {lesson.duration && (
                            <span className="text-[10px] text-zinc-400">{Math.floor(lesson.duration / 60)}m</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enrolled Students */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Enrolled Students ({course._count?.enrollments ?? 0})</h2>
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6 text-center">
          <p className="text-sm text-zinc-500">
            View enrolled students and their progress in the{" "}
            <Link href="/analytics" className="text-emerald-600 hover:text-emerald-700 font-medium">Analytics</Link> page
          </p>
        </div>
      </div>
    </div>
  );
}
