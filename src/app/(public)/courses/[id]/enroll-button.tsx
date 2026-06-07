"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      setChecking(false);
      return;
    }
    const u = JSON.parse(raw);
    setUser(u);

    fetch(`/api/enrollments?userId=${u.id}`)
      .then((r) => r.json())
      .then((data) => {
        setEnrolled(data.some((e: { courseId: string }) => e.courseId === courseId));
      })
      .finally(() => setChecking(false));
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, courseId }),
    });
    if (res.ok) {
      setEnrolled(true);
      router.refresh();
    }
    setLoading(false);
  };

  if (checking) return null;

  if (!user) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all"
      >
        Sign in to enroll
      </button>
    );
  }

  if (enrolled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
        <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Enrolled
      </div>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all disabled:opacity-50"
    >
      {loading ? "Enrolling..." : "Enroll now"}
    </button>
  );
}
