"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function PostersPage() {
  const router = useRouter();
  const [posters, setPosters] = useState<PosterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    fetch("/api/posters")
      .then((r) => r.json())
      .then((d) => {
        setPosters(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading posters...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AR Educational Posters</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Interactive 3D posters that bring educational concepts to life
        </p>
      </div>

      {posters.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No posters available</p>
          <p className="text-sm mt-2">Posters will appear here once they are created</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => {
            const config = (() => {
              try {
                return poster.config ? JSON.parse(poster.config) : null;
              } catch {
                return null;
              }
            })();
            const gradientStyle = config
              ? { background: `linear-gradient(135deg, ${config.posterColor ?? "#6366f1"}, ${config.frameColor ?? "#8b5cf6"})` }
              : { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" };

            return (
              <Link
                key={poster.id}
                href={`/posters/${poster.id}`}
                className="group rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all"
              >
                <div className="aspect-video flex items-center justify-center relative overflow-hidden" style={gradientStyle}>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                    }} />
                  </div>
                  <div className="text-center relative z-10 p-4">
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">{poster.title}</h3>
                    {poster.description && (
                      <p className="text-white/70 text-xs mt-1 line-clamp-2">{poster.description}</p>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-white/80">
                    AR
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    {poster.course && (
                      <span className="truncate">{poster.course.title}</span>
                    )}
                    {poster.lesson && (
                      <>
                        <span>·</span>
                        <span className="truncate">{poster.lesson.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
