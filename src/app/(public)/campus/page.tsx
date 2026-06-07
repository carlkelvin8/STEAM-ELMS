"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CampusViewer } from "@/components/campus-viewer";

interface BuildingData {
  id: string;
  name: string;
  description: string | null;
  abbreviation: string | null;
  color: string;
  positionX: number;
  positionZ: number;
  width: number;
  depth: number;
  height: number;
  department: string | null;
  icon: string | null;
}

export default function CampusPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    fetch("/api/campus")
      .then((r) => r.json())
      .then((d) => {
        setBuildings(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading campus...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AR Campus Navigation</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Explore the campus in 3D. Click on any building to navigate.
        </p>
      </div>

      {buildings.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No campus buildings loaded</p>
          <p className="text-sm mt-2">Campus data will appear once configured</p>
        </div>
      ) : (
        <CampusViewer buildings={buildings} />
      )}
    </div>
  );
}
