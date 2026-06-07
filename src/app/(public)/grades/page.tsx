"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GradeLesson {
  lessonId: string;
  title: string;
  type: string;
  score: number | null;
  status: string;
}

interface GradeCourse {
  courseId: string;
  courseTitle: string;
  enrollmentProgress: number;
  completed: boolean;
  averageScore: number | null;
  percentage: number | null;
  letterGrade: string | null;
  totalLessons: number;
  completedLessons: number;
  lessons: GradeLesson[];
}

function getGradeMeta(letter: string | null) {
  switch (letter) {
    case "A": return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", ring: "ring-emerald-500/20", label: "Excellent", bar: "bg-emerald-500" };
    case "B": return { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", ring: "ring-blue-500/20", label: "Good", bar: "bg-blue-500" };
    case "C": return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", ring: "ring-amber-500/20", label: "Satisfactory", bar: "bg-amber-500" };
    case "D": return { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", ring: "ring-orange-500/20", label: "Needs Improvement", bar: "bg-orange-500" };
    case "F": return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", ring: "ring-red-500/20", label: "Failing", bar: "bg-red-500" };
    default: return { color: "text-zinc-500", bg: "bg-zinc-800/30", border: "border-zinc-700", ring: "ring-zinc-800", label: "No Grade", bar: "bg-zinc-600" };
  }
}

function RadialGrade({ pct, size = 100 }: { pct: number | null; size?: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const valid = pct != null && pct >= 0;
  const offset = valid ? circ - (pct! / 100) * circ : circ;
  const strokeColor = pct != null ? (pct >= 90 ? "#34d399" : pct >= 80 ? "#60a5fa" : pct >= 70 ? "#fbbf24" : pct >= 60 ? "#fb923c" : "#f87171") : "#525252";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(39 39 42)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="fill-white text-xl font-bold" transform="rotate(90 50 50)">
        {valid ? `${pct}%` : "—"}
      </text>
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    COMPLETED: { label: "Completed", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    IN_PROGRESS: { label: "In Progress", classes: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    NOT_STARTED: { label: "Pending", classes: "bg-zinc-800 text-zinc-500 border-zinc-700" },
  };
  const m = map[status] ?? map.NOT_STARTED;
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${m.classes}`}>{m.label}</span>;
}

function ScoreDisplay({ score }: { score: number | null }) {
  if (score == null) return <span className="text-zinc-600">—</span>;
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  return <span className={`font-semibold ${color}`}>{Math.round(score)}%</span>;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUserId(JSON.parse(raw).id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/grades?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGrades(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const overallPercentage =
    grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + (g.percentage ?? 0), 0) / grades.length)
      : null;

  const overallLetter =
    overallPercentage != null
      ? overallPercentage >= 90 ? "A" : overallPercentage >= 80 ? "B" : overallPercentage >= 70 ? "C" : overallPercentage >= 60 ? "D" : "F"
      : null;

  const gpaPoints = grades.reduce((sum, g) => {
    switch (g.letterGrade) {
      case "A": return sum + 4.0;
      case "B": return sum + 3.0;
      case "C": return sum + 2.0;
      case "D": return sum + 1.0;
      default: return sum;
    }
  }, 0);
  const gpa = grades.length > 0 ? (gpaPoints / grades.length).toFixed(2) : null;

  const totalCompletedLessons = grades.reduce((s, g) => s + g.completedLessons, 0);
  const totalLessons = grades.reduce((s, g) => s + g.totalLessons, 0);

  const gradeDist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  grades.forEach((g) => {
    if (g.letterGrade && g.letterGrade in gradeDist) gradeDist[g.letterGrade as keyof typeof gradeDist]++;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-sm text-zinc-500">Loading grades...</p>
        </div>
      </div>
    );
  }

  const meta = getGradeMeta(overallLetter);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-3">Academic Record</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Grade <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Report</span>
        </h1>
        <p className="text-zinc-400 mt-2">Your complete academic performance overview.</p>
      </div>

      {/* Overall Grade Card */}
      <div className="relative mb-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Radial */}
            <div className="shrink-0">
              <RadialGrade pct={overallPercentage} size={140} />
            </div>
            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{gpa ?? "—"}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">GPA</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${meta.color}`}>{overallLetter ?? "—"}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Grade</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totalCompletedLessons}/{totalLessons}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Lessons Done</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{grades.length}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Courses</p>
              </div>
            </div>
          </div>
          {/* Grade label */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}>
              {meta.label}
            </span>
            {overallLetter && (
              <span className="text-xs text-zinc-500">
                {overallLetter === "A" ? "Outstanding performance! Keep it up! 🌟" :
                 overallLetter === "B" ? "Great work! Room to grow even higher. 📈" :
                 overallLetter === "C" ? "Solid foundation. Focus on weak areas. 📚" :
                 overallLetter === "D" ? "Needs improvement. Review your lessons. 💪" :
                 "Don't give up! Revisit the basics and try again. 🎯"}
              </span>
            )}
          </div>
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-800 rounded-3xl">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-zinc-400 text-lg">No enrolled courses yet.</p>
          <p className="text-zinc-600 text-sm mt-1">Enroll in a course to start tracking your grades.</p>
          <Link href="/courses" className="inline-flex items-center gap-2 mt-6 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
            Browse courses
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <>
          {/* Grade Distribution */}
          <div className="mb-8 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Grade Distribution</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("cards")}
                  className={`text-[10px] px-2.5 py-1 rounded-lg transition-colors ${view === "cards" ? "bg-violet-500/20 text-violet-300" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setView("table")}
                  className={`text-[10px] px-2.5 py-1 rounded-lg transition-colors ${view === "table" ? "bg-violet-500/20 text-violet-300" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Table
                </button>
              </div>
            </div>
            <div className="flex items-end gap-2 h-20">
              {(["A", "B", "C", "D", "F"] as const).map((letter) => {
                const count = gradeDist[letter];
                const max = Math.max(...Object.values(gradeDist), 1);
                const height = (count / max) * 100;
                const m = getGradeMeta(letter);
                return (
                  <div key={letter} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500">{count}</span>
                    <div className="w-full rounded-full relative overflow-hidden" style={{ height: "60px" }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ${m.bar}`}
                        style={{ height: `${height}%`, opacity: 0.6 }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${m.color}`}>{letter}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View toggle */}
          {view === "cards" ? (
            /* Card View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {grades.map((course) => {
                const m = getGradeMeta(course.letterGrade);
                return (
                  <div key={course.courseId} className="group rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`size-14 shrink-0 rounded-xl flex items-center justify-center text-lg font-bold border ${m.bg} ${m.border} ${m.ring} ring-1`}>
                          <span className={m.color}>{course.letterGrade ?? "—"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">{course.courseTitle}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            <span>•</span>
                            <span>{Math.round(course.enrollmentProgress)}%</span>
                          </div>
                          <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700" style={{ width: `${course.enrollmentProgress}%` }} />
                          </div>
                        </div>
                        <button
                          onClick={() => setExpanded(expanded === course.courseId ? null : course.courseId)}
                          className={`size-8 shrink-0 rounded-lg border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-all duration-300 ${expanded === course.courseId ? "bg-zinc-800 rotate-180" : ""}`}
                        >
                          <svg className="size-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </div>

                      {/* Score row */}
                      {course.percentage != null && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${m.bar}`} style={{ width: `${course.percentage}%`, opacity: 0.7 }} />
                          </div>
                          <span className={`text-xs font-semibold ${m.color}`}>{course.percentage}%</span>
                        </div>
                      )}
                    </div>

                    {/* Expanded lessons */}
                    <div className={`overflow-hidden transition-all duration-500 ${expanded === course.courseId ? "max-h-[2000px]" : "max-h-0"}`}>
                      <div className="border-t border-zinc-800 px-6 pb-4">
                        <table className="w-full text-sm mt-3">
                          <thead>
                            <tr className="text-[10px] text-zinc-600 uppercase tracking-wider">
                              <th className="text-left py-2 pr-3 font-medium">Lesson</th>
                              <th className="text-left py-2 pr-3 font-medium w-20">Type</th>
                              <th className="text-left py-2 pr-3 font-medium w-22">Status</th>
                              <th className="text-right py-2 font-medium w-16">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {course.lessons.map((lesson) => (
                              <tr key={lesson.lessonId} className="border-t border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                                <td className="py-2.5 pr-3 text-zinc-300 text-xs truncate max-w-0">{lesson.title}</td>
                                <td className="py-2.5 pr-3">
                                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase">{lesson.type}</span>
                                </td>
                                <td className="py-2.5 pr-3"><StatusBadge status={lesson.status} /></td>
                                <td className="py-2.5 text-right"><ScoreDisplay score={lesson.score} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Course</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Grade</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Score</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Progress</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Lessons</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">GPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((course) => {
                      const m = getGradeMeta(course.letterGrade);
                      const courseGpa =
                        course.letterGrade === "A" ? 4.0 :
                        course.letterGrade === "B" ? 3.0 :
                        course.letterGrade === "C" ? 2.0 :
                        course.letterGrade === "D" ? 1.0 : 0;
                      return (
                        <tr key={course.courseId} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                          <td className="py-4 px-6">
                            <p className="text-white font-medium">{course.courseTitle}</p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`text-lg font-bold ${m.color}`}>{course.letterGrade ?? "—"}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-zinc-300">{course.percentage != null ? `${course.percentage}%` : "—"}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden max-w-[100px] mx-auto">
                                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700" style={{ width: `${course.enrollmentProgress}%` }} />
                              </div>
                              <span className="text-xs text-zinc-500 w-8 text-right">{Math.round(course.enrollmentProgress)}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center text-zinc-400">{course.completedLessons}/{course.totalLessons}</td>
                          <td className="py-4 px-6 text-right font-medium text-violet-400">{courseGpa.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
