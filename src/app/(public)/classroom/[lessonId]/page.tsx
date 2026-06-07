"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VirtualClassroom } from "@/components/virtual-classroom";

interface ClassroomLesson {
  id: string;
  title: string;
  description: string | null;
  type: string;
  videoUrl: string | null;
  courseTitle: string;
  courseId: string;
  moduleTitle: string;
}

export default function ClassroomPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const router = useRouter();
  const [lesson, setLesson] = useState<ClassroomLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }

    fetch(`/api/classroom/${lessonId}`)
      .then((r) => r.json())
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, lessonId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        setFullscreen((f) => !f);
      }
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a1a]">
        <div className="text-center">
          <div className="size-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-6" />
          <p className="text-zinc-400 text-sm">Entering Virtual Classroom...</p>
          <div className="mt-4 flex gap-1 justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="size-1.5 rounded-full bg-violet-500 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a1a] text-zinc-500">
        <p className="text-lg">Lesson not found</p>
        <Link href="/courses" className="text-violet-400 hover:underline mt-3 text-sm">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a1a] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-xl border-b border-zinc-800/50 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${lesson.courseId}/lessons/${lesson.id}`}
            className="text-xs text-zinc-400 hover:text-violet-400 transition-colors flex items-center gap-1.5"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Exit
          </Link>
          <span className="w-px h-4 bg-zinc-800" />
          <div>
            <p className="text-sm font-medium text-white">{lesson.title}</p>
            <p className="text-xs text-zinc-500">{lesson.courseTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lesson.videoUrl && (
            <a
              href={`/courses/${lesson.courseId}/lessons/${lesson.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            >
              <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Watch Video
            </a>
          )}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {fullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              )}
            </svg>
            {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* 3D Classroom */}
      <div className="flex-1 relative">
        <VirtualClassroom lesson={lesson} />
      </div>
    </div>
  );
}
