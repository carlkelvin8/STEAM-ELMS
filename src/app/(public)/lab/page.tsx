"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LabViewer } from "@/components/lab-viewer";

interface LabData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  config: string | null;
}

export default function LabPage() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<LabData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    fetch("/api/lab")
      .then((r) => r.json())
      .then((d) => {
        setExperiments(d);
        if (d.length > 0) setActiveId(d[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const active = experiments.find((e) => e.id === activeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading lab...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Virtual Science Lab</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Conduct virtual chemistry experiments in an interactive 3D laboratory
        </p>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No experiments available</p>
          <p className="text-sm mt-2">Lab experiments will appear here once configured</p>
        </div>
      ) : (
        <>
          {/* Experiment selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {experiments.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveId(exp.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeId === exp.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {exp.title}
              </button>
            ))}
          </div>

          {/* Active experiment */}
          {active && (
            <LabViewer key={active.id} experiment={active} />
          )}
        </>
      )}
    </div>
  );
}
