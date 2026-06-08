"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string | null;
  completedLessons: number;
  quizAverage: number;
  currentStreak: number;
  avgProgress: number;
  coursesEnrolled: number;
}

type SortKey = "completedLessons" | "quizAverage" | "currentStreak" | "avgProgress";

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("completedLessons");
  const [user] = useState<{ id: string } | null>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
    }
    return null;
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, user]);

  const sorted = [...entries].sort((a, b) => {
    const val = b[sortKey] - a[sortKey];
    if (val !== 0) return val;
    return b.completedLessons - a.completedLessons;
  });

  const tabs: { key: SortKey; label: string }[] = [
    { key: "completedLessons", label: "Lessons Done" },
    { key: "quizAverage", label: "Quiz Avg" },
    { key: "currentStreak", label: "Streak" },
    { key: "avgProgress", label: "Avg Progress" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading leaderboard...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          See how you rank among your peers
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSortKey(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortKey === t.key
                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No data yet</p>
          <p className="text-sm mt-2">Students appear here once they start learning</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sorted.map((entry, i) => {
              const isMe = entry.userId === user?.id;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-6 py-4 ${
                    isMe
                      ? "bg-violet-50/50 dark:bg-violet-900/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-center w-8 shrink-0">
                    {i === 0 ? (
                      <span className="text-xl">🥇</span>
                    ) : i === 1 ? (
                      <span className="text-xl">🥈</span>
                    ) : i === 2 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-sm font-bold text-zinc-400">{i + 1}</span>
                    )}
                  </div>

                  <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-violet-500/20">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.name}
                      {isMe && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300 font-semibold">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {entry.coursesEnrolled} course{entry.coursesEnrolled !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">
                      {sortKey === "completedLessons" && entry.completedLessons}
                      {sortKey === "quizAverage" && `${entry.quizAverage}%`}
                      {sortKey === "currentStreak" && `🔥 ${entry.currentStreak}`}
                      {sortKey === "avgProgress" && `${entry.avgProgress}%`}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {sortKey === "completedLessons" && "lessons"}
                      {sortKey === "quizAverage" && "avg score"}
                      {sortKey === "currentStreak" && "day streak"}
                      {sortKey === "avgProgress" && "avg progress"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
