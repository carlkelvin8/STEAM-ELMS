"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Logo } from "@/components/logo";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

const sections = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/teacher", icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" },
      { label: "My Courses", href: "/teacher/courses", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
      { label: "Messages", href: "/chat", icon: "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" },
      { label: "Analytics", href: "/analytics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" },
      { label: "Students", href: "/teacher/students", icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
      { label: "Grades", href: "/teacher/grades", icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" },
      { label: "VR Solar System", href: "/solar-system", icon: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" },
    ],
  },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const [user] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
    }
    return null;
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { setTimeout(() => setOpen(false), 0); }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/teacher") return pathname === "/teacher";
    return pathname.startsWith(href);
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "T";

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 size-10 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-lg backdrop-blur-sm"
        aria-label="Toggle sidebar">
        <svg className="size-5 text-zinc-700 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
        </svg>
      </button>

      {open && <div className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <aside className={`w-64 border-r border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-b from-white via-zinc-50/80 to-white dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-900 flex flex-col ${open ? "fixed inset-y-0 left-0 z-40 animate-in slide-in-from-left" : "hidden lg:flex"}`}>
        {/* Logo + Instructor badge */}
        <div className="px-5 pt-5 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <Logo size="sm" />
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              Instructor Portal
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto scrollbar-thin">
          {sections.map((section) => (
            <div key={section.label} className="mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{section.label}</span>
                <div className="flex-1 h-px bg-zinc-200/60 dark:bg-zinc-800/60" />
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-emerald-100 to-green-50 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/20 dark:text-emerald-300 shadow-sm"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-green-500 shadow-sm shadow-emerald-500/50" />}
                      <svg className={`size-4 shrink-0 transition-colors ${active ? "text-emerald-500" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-t from-zinc-50/50 to-transparent dark:from-zinc-900/50">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20 shrink-0 overflow-hidden ring-2 ring-white/50 dark:ring-zinc-800/50">
                  {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={40} height={40} className="size-full object-cover" unoptimized /> : initial}
                </div>
                <div className="text-sm min-w-0 flex-1">
                  <p className="font-semibold truncate text-zinc-800 dark:text-zinc-200">{user.name}</p>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Instructor
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 pt-1">
                <Link href="/dashboard/settings" className="flex-1 text-center text-[11px] font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  Profile
                </Link>
                <button onClick={logout} className="flex-1 text-center text-[11px] font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login" className="block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">Sign in</Link>
              <Link href="/register" className="block text-sm font-medium bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all text-center">Get started</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
