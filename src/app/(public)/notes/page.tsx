"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NoteLesson {
  id: string;
  title: string;
  module: { courseId: string; course: { title: string } };
}

interface NoteData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  lesson: NoteLesson;
}

interface CourseOption {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const [showNewNote, setShowNewNote] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(raw);
    Promise.all([
      fetch(`/api/notes?userId=${parsed.id}`).then(async (r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/enrollments?userId=${parsed.id}`).then(async (r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([notesData, enrollmentsData]) => {
      if (Array.isArray(notesData)) setNotes(notesData);
      const mapped: CourseOption[] = enrollmentsData.map((e: { course: { id: string; title: string; modules: { lessons: { id: string; title: string }[] }[] } }) => ({
        id: e.course.id,
        title: e.course.title,
        lessons: e.course.modules.flatMap((m) => m.lessons),
      }));
      setCourses(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const createNote = async () => {
    if (!selectedLessonId || !newNoteContent.trim()) return;
    setSavingNew(true);
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, lessonId: selectedLessonId, content: newNoteContent }),
    });
    if (res.ok) {
      const data = await res.json();
      const lesson = courses.flatMap((c) => c.lessons).find((l) => l.id === selectedLessonId);
      const course = courses.find((c) => c.id === selectedCourseId);
      setNotes((prev) => [{
        id: data.id,
        content: newNoteContent,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lesson: {
          id: selectedLessonId,
          title: lesson?.title ?? "",
          module: { courseId: selectedCourseId, course: { title: course?.title ?? "" } },
        },
      }, ...prev]);
      setShowNewNote(false);
      setSelectedCourseId("");
      setSelectedLessonId("");
      setNewNoteContent("");
    }
    setSavingNew(false);
  };

  const startEdit = (n: NoteData) => {
    setEditingId(n.id);
    setEditContent(n.content);
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw);
    const res = await fetch(`/api/notes?id=${id}&userId=${user.id}`, { method: "DELETE" });
    if (res.ok) setNotes((prev) => prev.filter((x) => x.id !== id));
  };

  const saveEdit = async (lessonId: string) => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, lessonId, content: editContent }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) =>
        prev.map((n) =>
          n.lesson.id === lessonId ? { ...n, content: editContent, updatedAt: data.updatedAt ?? new Date().toISOString() } : n,
        ),
      );
      setEditingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading notes...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {notes.length} note{notes.length !== 1 ? "s" : ""} across your courses
          </p>
        </div>
        <button
          onClick={() => setShowNewNote(!showNewNote)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Note
        </button>
      </div>

      {showNewNote && (
        <div className="mb-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-sm font-semibold">Create a new note</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              value={selectedCourseId}
              onChange={(e) => { setSelectedCourseId(e.target.value); setSelectedLessonId(""); }}
              className="text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              disabled={!selectedCourseId}
              className="text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-40"
            >
              <option value="">Select a lesson</option>
              {courses.find((c) => c.id === selectedCourseId)?.lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note..."
            rows={4}
            maxLength={10000}
            className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-zinc-400"
          />
          <div className="flex gap-2">
            <button
              onClick={createNote}
              disabled={!selectedLessonId || !newNoteContent.trim() || savingNew}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {savingNew ? "Saving..." : "Save Note"}
            </button>
            <button
              onClick={() => { setShowNewNote(false); setSelectedCourseId(""); setSelectedLessonId(""); setNewNoteContent(""); }}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No notes yet</p>
          <p className="text-sm mt-2">Take notes while watching lessons to see them here</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <Link
                    href={`/courses/${n.lesson.module.courseId}/lessons/${n.lesson.id}`}
                    className="text-sm font-medium hover:text-violet-600 transition-colors"
                  >
                    {n.lesson.title}
                  </Link>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {n.lesson.module.course.title}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-500">
                    {new Date(n.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {editingId !== n.id && (
                    <>
                      <button
                        onClick={() => startEdit(n)}
                        className="text-xs text-violet-600 hover:underline mt-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="text-xs text-red-400 hover:text-red-500 ml-2 mt-1"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === n.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    maxLength={10000}
                    className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(n.lesson.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {n.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
