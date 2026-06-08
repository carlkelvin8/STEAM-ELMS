"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SceneViewer } from "@/components/scene-viewer";

interface UserInfo {
  id: string;
  name: string;
}

interface VrContentData {
  id: string;
  title: string;
  description: string | null;
  format: string;
  url: string;
  settings: string | null;
}

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  vrContent: VrContentData | null;
  module: {
    id: string;
    title: string;
    order: number;
    course: {
      id: string;
      title: string;
    };
  };
}

interface QuestionData {
  id: string;
  text: string;
  options: string;
  order: number;
}

function getYouTubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = use(params);
  const router = useRouter();
  const [user] = useState<UserInfo | null>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
    }
    return null;
  });
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    feedback: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [posterId, setPosterId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
  }, [router, user]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => r.json()),
      fetch(`/api/questions?lessonId=${lessonId}`).then((r) => r.json()),
      fetch(`/api/progress?userId=${user.id}&lessonId=${lessonId}`).then((r) =>
        r.json(),
      ),
      fetch(`/api/notes?userId=${user.id}&lessonId=${lessonId}`).then((r) =>
        r.json(),
      ),
      fetch(`/api/posters?lessonId=${lessonId}`).then((r) => r.json()),
    ])
      .then(([courseData, questionsData, progressData, notesData, postersData]) => {
        if (postersData.length > 0) setPosterId(postersData[0].id);
        const found = courseData.modules
          .flatMap((m: { lessons: LessonData[] }) => m.lessons)
          .find((l: LessonData) => l.id === lessonId);
        if (found) {
          const mod = courseData.modules.find((m: { lessons: LessonData[] }) =>
            m.lessons.some((l: LessonData) => l.id === lessonId),
          );
          setLesson({ ...found, module: { ...mod, course: courseData } });
        }
        setQuestions(questionsData);
        if (progressData.length > 0 && progressData[0].status === "COMPLETED") {
          setMarked(true);
        }
        if (notesData.length > 0) setNote(notesData[0].content);
      })
      .finally(() => setLoading(false));
  }, [user, courseId, lessonId]);

  const saveNote = async () => {
    if (!user || !note.trim()) return;
    setSavingNote(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, lessonId, content: note }),
    });
    if (res.ok) setNoteSaved(true);
    setSavingNote(false);
    if (res.ok) setTimeout(() => setNoteSaved(false), 2000);
  };

  const markComplete = async () => {
    if (!user) return;
    setMarking(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, lessonId, status: "COMPLETED" }),
    });
    setMarked(true);
    setMarking(false);
  };

  const handleSubmitQuiz = async () => {
    if (!user) return;
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, lessonId, answers }),
    });
    const data = await res.json();
    setResult(data);
    setSubmitted(true);
  };

  const embedUrl = getYouTubeEmbed(lesson?.videoUrl ?? null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        Loading...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-zinc-500">
        <p className="text-lg">Lesson not found</p>
        <Link
          href={`/courses/${courseId}`}
          className="text-violet-600 hover:text-violet-700 mt-2 inline-block"
        >
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 flex-wrap">
        <Link href={`/courses/${courseId}`} className="hover:text-violet-600 transition-colors">{lesson.module.course.title}</Link>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{lesson.title}</span>
        {!embedUrl && !lesson.vrContent && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold ml-auto">
            {lesson.type === "ARTICLE" ? "READING" : lesson.type.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {embedUrl ? (
        <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-8 shadow-xl">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : lesson.vrContent ? (
        <div className="mb-8">
          <SceneViewer
            config={(() => {
              try {
                return JSON.parse(lesson.vrContent.settings ?? "{}");
              } catch {
                return {};
              }
            })()}
            className="aspect-video"
          />
          {lesson.vrContent.description && (
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              {lesson.vrContent.description}
            </p>
          )}
        </div>
      ) : lesson.content ? (
        <div className="mb-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {lesson.content}
          </div>
        </div>
      ) : (
        <div className="aspect-video rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center justify-center text-zinc-400 mb-8 gap-2">
          <svg className="size-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-sm">Reading lesson</p>
          {lesson.description && <p className="text-xs text-center max-w-md px-4">{lesson.description}</p>}
        </div>
      )}

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-600 font-semibold uppercase tracking-wider mb-1">
            <span>Module {lesson.module.order}</span>
            <span className="text-zinc-300">·</span>
            <span>{lesson.module.title}</span>
          </div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {lesson.duration && (
            <p className="text-sm text-zinc-500 mt-1">
              {Math.ceil(lesson.duration / 60)} min
            </p>
          )}
          {lesson.description && (
            <p className="text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
              {lesson.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/classroom/${lessonId}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
            </svg>
            Virtual Classroom
          </Link>
          {posterId && (
            <Link
              href={`/posters/${posterId}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium text-sm hover:from-pink-600 hover:to-rose-700 shadow-lg shadow-pink-500/25 transition-all"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
              View Poster
            </Link>
          )}
          {!marked ? (
            <button
              onClick={markComplete}
              disabled={marking}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium text-sm hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 transition-all disabled:opacity-50"
            >
              {marking ? "Marking..." : "Mark as complete"}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Completed
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 bg-white/50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Your Notes
            </h2>
            <div className="flex items-center gap-2">
              {noteSaved && (
                <span className="text-xs text-green-600 font-medium">Saved</span>
              )}
              <button
                onClick={saveNote}
                disabled={savingNote || !note.trim()}
                className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {savingNote ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          <textarea
            value={note}
            onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }}
            placeholder="Write your notes for this lesson here..."
            rows={5}
            maxLength={10000}
            className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-400"
          />
        </div>

        {questions.length > 0 && !submitted && (
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-8 bg-white/50 dark:bg-zinc-900/50">
            <h2 className="text-lg font-semibold mb-6">Lesson Quiz</h2>
            <div className="space-y-6">
              {questions.map((q, qi) => {
                const options: string[] = JSON.parse(q.options);
                return (
                  <div key={q.id}>
                    <p className="text-sm font-medium mb-3">
                      {qi + 1}. {q.text}
                    </p>
                    <div className="space-y-2">
                      {options.map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                            answers[q.id] === opt
                              ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20"
                              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: e.target.value,
                              }))
                            }
                            className="accent-violet-600"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length !== questions.length}
              className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
            >
              Submit answers
            </button>
          </div>
        )}

        {submitted && result && (
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-8 bg-white/50 dark:bg-zinc-900/50">
            <h2 className="text-lg font-semibold mb-4">Quiz Result</h2>
            <div className="flex items-center gap-6">
              <div
                className={`size-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                  result.percentage >= 70
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                }`}
              >
                {result.percentage}%
              </div>
              <div>
                <p className="text-sm font-medium">
                  {result.score}/{result.total} correct
                </p>
                <p className="text-sm text-zinc-500 mt-1">{result.feedback}</p>
                {result.percentage >= 70 ? (
                  <p className="text-xs text-green-600 mt-1">Passed!</p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">
                    Review the lesson and try again
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/courses/${courseId}`}
            className="text-sm text-zinc-500 hover:text-violet-600 transition-colors flex items-center gap-1"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to course
          </Link>
        </div>
      </div>
    </div>
  );
}
