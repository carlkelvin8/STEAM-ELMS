"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface FlashcardQuestion {
  id: string;
  text: string;
  options: string[];
  answer: string;
}

interface FlashcardGroup {
  courseTitle: string;
  lessonTitle: string;
  questions: FlashcardQuestion[];
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<FlashcardGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(raw);
    fetch(`/api/flashcards?userId=${parsed.id}`)
      .then((r) => r.json())
      .then((d) => {
        setGroups(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const currentGroup = groups[selectedGroup];

  const questions = useMemo(() => {
    if (!currentGroup) return [];
    const qs = [...currentGroup.questions];
    if (shuffled) {
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
    }
    return qs;
  }, [currentGroup, shuffled]);

  const currentQuestion = questions[currentIndex];

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setFlipped(false);
    }
  };

  const handleGroupChange = (value: number) => {
    setSelectedGroup(value);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const handleShuffle = () => {
    setShuffled((s) => !s);
    setCurrentIndex(0);
    setFlipped(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading flashcards...
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500">
        <p className="text-lg">No flashcards available</p>
        <p className="text-sm mt-2">Enroll in courses with quizzes to see flashcards</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <button
          onClick={handleShuffle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            shuffled
              ? "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800"
              : "text-zinc-600 border-zinc-200 hover:bg-zinc-100 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
          }`}
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          {shuffled ? "Shuffled" : "Shuffle"}
        </button>
      </div>

      {/* Group selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={selectedGroup}
          onChange={(e) => handleGroupChange(Number(e.target.value))}
          className="text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {groups.map((g, i) => (
            <option key={i} value={i}>
              {g.courseTitle} — {g.lessonTitle} ({g.questions.length})
            </option>
          ))}
        </select>
      </div>

      {currentQuestion && (
        <div className="space-y-6">
          {/* Card counter */}
          <div className="text-center text-sm text-zinc-500">
            {currentIndex + 1} / {questions.length}
          </div>

          {/* Flashcard */}
          <div
            className="cursor-pointer h-[340px]"
            style={{ perspective: "1200px" }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-4">Question</span>
                <p className="text-lg font-medium leading-relaxed">{currentQuestion.text}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {currentQuestion.options.map((opt, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-xs text-zinc-400">Tap or press Space to reveal answer</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-4">Answer</span>
                <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <svg className="size-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{currentQuestion.answer}</p>
                <p className="mt-6 text-xs text-zinc-400">Tap again or press Space to see question</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Previous
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Next
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
