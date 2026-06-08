"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface StudentGrade {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  averageScore: number | null;
  percentage: number | null;
  letterGrade: string | null;
  completedLessons: number;
  totalLessons: number;
  enrollmentProgress: number;
}

interface CourseGradeData {
  courseId: string;
  courseTitle: string;
  students: StudentGrade[];
}

export default function TeacherGrades() {
  const router = useRouter();
  const [data, setData] = useState<CourseGradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const user = JSON.parse(raw);
    if (user.role !== "INSTRUCTOR") { router.push("/dashboard"); return; }

    fetch(`/api/teacher/grades?instructorId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setData(data);
          if (data.length > 0) setSelectedCourse(data[0].courseId);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const currentCourse = data.find((c) => c.courseId === selectedCourse);
  const averageGrade = currentCourse?.students.length
    ? Math.round(
        (currentCourse.students.reduce((sum, s) => sum + (s.percentage ?? 0), 0) /
          currentCourse.students.length) *
          10
      ) / 10
    : null;

  const passingCount = currentCourse?.students.filter((s) => (s.percentage ?? 0) >= 60).length ?? 0;

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "text-zinc-400";
    if (grade === "A") return "text-emerald-600";
    if (grade === "B") return "text-blue-600";
    if (grade === "C") return "text-amber-600";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading grades...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grades</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {data.length} course{data.length !== 1 ? "s" : ""}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <svg className="size-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
          </svg>
          <p className="text-sm font-medium">No grade data yet</p>
          <p className="text-xs text-zinc-400 mt-1">Grades appear here once students complete lessons</p>
        </div>
      ) : (
        <>
          {/* Course selector */}
          <div className="flex flex-wrap gap-2">
            {data.map((course) => (
              <button
                key={course.courseId}
                onClick={() => setSelectedCourse(course.courseId)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCourse === course.courseId
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/20"
                    : "border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {course.courseTitle}
                <span className="ml-1.5 text-xs opacity-70">({course.students.length})</span>
              </button>
            ))}
          </div>

          {currentCourse && (
            <>
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Students</p>
                  <p className="text-2xl font-bold">{currentCourse.students.length}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Class Average</p>
                  <p className="text-2xl font-bold">{averageGrade != null ? `${averageGrade}%` : "—"}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-4">
                  <p className="text-xs text-zinc-500 mb-1">Passing</p>
                  <p className="text-2xl font-bold">
                    {passingCount}/{currentCourse.students.length}
                  </p>
                </div>
              </div>

              {/* Grades table */}
              <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-500">Student</th>
                        <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-500">Progress</th>
                        <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-500">Lessons Done</th>
                        <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-500">Average</th>
                        <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-500">Grade</th>
                        <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-zinc-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                      {currentCourse.students.map((student) => (
                        <tr key={student.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                                {student.avatarUrl ? (
                                  <Image src={student.avatarUrl} alt="" width={32} height={32} className="size-full object-cover rounded-lg" unoptimized />
                                ) : (
                                  student.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-[11px] text-zinc-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all"
                                  style={{ width: `${Math.min(student.enrollmentProgress, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-zinc-500">{Math.round(student.enrollmentProgress)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">
                            {student.completedLessons}/{student.totalLessons}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {student.averageScore != null ? `${student.averageScore}` : "—"}
                          </td>
                          <td className={`px-4 py-3 text-center font-bold text-lg ${getGradeColor(student.letterGrade)}`}>
                            {student.letterGrade ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/chat?userId=${student.id}`}
                              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                            >
                              Message
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
