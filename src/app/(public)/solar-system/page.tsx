"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SolarSystemViewer = dynamic(
  () => import("@/components/solar-system-viewer").then((m) => ({ default: m.SolarSystemViewer })),
  { ssr: false }
);

export default function SolarSystemPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <div className="px-6 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-white">VR Solar System</h1>
        <p className="text-blue-200/70 mt-1 text-sm">
          Explore the Solar System in 3D. Click on any planet to learn more.
        </p>
      </div>
      <div className="flex-1 px-6 pb-6">
        <div className="h-full rounded-2xl border border-blue-900/40 bg-gradient-to-b from-[#050814] via-[#0a0e2a] to-[#000008] overflow-hidden shadow-2xl shadow-blue-900/20">
          <SolarSystemViewer />
        </div>
      </div>
    </div>
  );
}
