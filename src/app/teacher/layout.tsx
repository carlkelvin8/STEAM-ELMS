"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { Chatbot } from "@/components/chatbot";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    const user = JSON.parse(raw);
    if (user.role !== "INSTRUCTOR") {
      router.replace("/dashboard");
      return;
    }
    setTimeout(() => setAuthorized(true), 0);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
      </main>
      <Chatbot />
    </div>
  );
}
