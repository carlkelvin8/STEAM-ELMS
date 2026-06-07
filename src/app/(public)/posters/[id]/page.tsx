"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PosterViewer } from "@/components/poster-viewer";

interface PosterData {
  id: string;
  title: string;
  description: string | null;
  format: string;
  config: string | null;
  imageUrl: string | null;
  lesson: { id: string; title: string } | null;
  course: { id: string; title: string } | null;
  createdAt: string;
}

export default function PosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [poster, setPoster] = useState<PosterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    fetch(`/api/posters/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setPoster(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading poster...
        </div>
      </div>
    );
  }

  if (!poster) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center text-zinc-500">
        <p className="text-lg">Poster not found</p>
        <Link href="/posters" className="text-violet-600 hover:text-violet-700 mt-2 inline-block">
          Back to posters
        </Link>
      </div>
    );
  }

  const config = (() => {
    try {
      return poster.config ? JSON.parse(poster.config) : { title: poster.title, description: poster.description ?? undefined };
    } catch {
      return { title: poster.title, description: poster.description ?? undefined };
    }
  })();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
        <Link href="/posters" className="hover:text-violet-600 transition-colors">
          Posters
        </Link>
        <span>/</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{poster.title}</span>
      </div>

      <PosterViewer config={config} className="w-full aspect-video rounded-2xl shadow-2xl shadow-violet-500/10" />

      <div className="mt-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">{poster.title}</h1>
        {poster.description && (
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">{poster.description}</p>
        )}

        {(poster.course || poster.lesson) && (
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            {poster.course && (
              <Link
                href={`/courses/${poster.course.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
                {poster.course.title}
              </Link>
            )}
            {poster.lesson && (
              <Link
                href={`/courses/${poster.course?.id}/lessons/${poster.lesson.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.971l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653Z" />
                </svg>
                View Lesson
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
