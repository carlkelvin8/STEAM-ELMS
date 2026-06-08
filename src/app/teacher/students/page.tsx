"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface StudentData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  totalCourses: number;
  courses: { id: string; title: string }[];
  lastActive: string;
}

export default function TeacherStudents() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const user = JSON.parse(raw);
    if (user.role !== "INSTRUCTOR") { router.push("/dashboard"); return; }

    fetch(`/api/teacher/students?instructorId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.students)) setStudents(data.students);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled in your courses
          </p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <svg className="size-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <p className="text-sm font-medium">No students found</p>
          <p className="text-xs text-zinc-400 mt-1">
            {search ? "Try a different search term" : "Students appear here once they enroll in your courses"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-5 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20 shrink-0">
                  {student.avatarUrl ? (
                    <Image src={student.avatarUrl} alt="" width={44} height={44} className="size-full object-cover rounded-xl" unoptimized />
                  ) : (
                    student.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-xs text-zinc-500">{student.email}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] font-medium text-zinc-400">
                      {student.totalCourses} course{student.totalCourses !== 1 ? "s" : ""}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {student.courses.slice(0, 2).map((c) => (
                        <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                          {c.title}
                        </span>
                      ))}
                      {student.courses.length > 2 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          +{student.courses.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/chat?userId=${student.id}`)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
