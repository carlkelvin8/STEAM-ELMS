"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  metric: string;
  threshold: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

const categoryLabels: Record<string, string> = {
  lessons: "Lessons",
  courses: "Courses",
  quizzes: "Quizzes",
  streaks: "Streaks",
  engagement: "Engagement",
  special: "Special",
};

const categoryIcons: Record<string, string> = {
  lessons: "📖",
  courses: "📋",
  quizzes: "❓",
  streaks: "🔥",
  engagement: "⭐",
  special: "✨",
};

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const user = JSON.parse(raw);
    fetch(`/api/achievements?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setAchievements(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const categories = ["all", ...new Set(achievements.map((a) => a.category))];
  const filtered = activeCategory === "all" ? achievements : achievements.filter((a) => a.category === activeCategory);

  const total = achievements.length;
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          Loading achievements...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🏆 Achievements
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Unlock badges by completing lessons, quizzes, and exploring the platform
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {unlocked} / {total} badges unlocked
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {cat === "all" ? "🏁 All" : `${categoryIcons[cat] || "🏷️"} ${categoryLabels[cat] || cat}`}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No achievements in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className={`relative p-4 rounded-2xl border text-center transition-all ${
                a.unlocked
                  ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-400/30"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50 opacity-60"
              }`}
            >
              {/* Badge icon */}
              <div className={`text-4xl mb-2 transition-transform ${a.unlocked ? "scale-100" : "scale-90 grayscale"}`}>
                {a.icon}
              </div>

              {/* Title & description */}
              <h3 className={`text-sm font-bold mb-0.5 ${a.unlocked ? "text-amber-800 dark:text-amber-300" : "text-zinc-500 dark:text-zinc-500"}`}>
                {a.title}
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-3 leading-tight">
                {a.description}
              </p>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    a.unlocked
                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                      : "bg-zinc-400 dark:bg-zinc-600"
                  }`}
                  style={{ width: `${Math.min(100, (a.progress / a.threshold) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                {Math.min(a.progress, a.threshold)}/{a.threshold}
              </p>

              {/* Unlocked badge */}
              {a.unlocked && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs">✅</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
