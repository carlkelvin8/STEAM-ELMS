"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
      { label: "Dashboard", href: "/dashboard", icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" },
      { label: "Courses", href: "/courses", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
    ],
  },
  {
    label: "Learning",
    items: [
      { label: "My Progress", href: "/progress", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" },
      { label: "Analytics", href: "/analytics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" },
      { label: "Achievements", href: "/achievements", icon: "M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.77.896 6.023 6.023 0 0 1-2.77-.896" },
      { label: "Flashcards", href: "/flashcards", icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" },
      { label: "Notes", href: "/notes", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" },
      { label: "Grades", href: "/grades", icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" },
    ],
  },
  {
    label: "Campus",
    items: [
      { label: "Posters", href: "/posters", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" },
      { label: "Virtual Lab", href: "/lab", icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
      { label: "Campus", href: "/campus", icon: "m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Leaderboard", href: "/leaderboard", icon: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" },
    ],
  },
];

const sectionIcons: Record<string, string> = {
  Main: "●",
  Learning: "◇",
  Campus: "◆",
  Community: "○",
  Account: "◎",
};

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        fetch(`/api/auth/profile?id=${parsed.id}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.user) setUser((prev) => prev ? { ...prev, avatarUrl: data.user.avatarUrl } : null);
          })
          .catch(() => {});
        fetch(`/api/achievements?userId=${parsed.id}`)
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data)) setAchievementCount(data.filter((a: { unlocked: boolean }) => a.unlocked).length);
          })
          .catch(() => {});
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "S";

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
        {/* Logo */}
        <div className="px-5 pt-5 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 group">
          <Logo size="sm" />
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
                          ? "bg-gradient-to-r from-violet-100 to-indigo-50 text-violet-700 dark:from-violet-900/40 dark:to-indigo-900/20 dark:text-violet-300 shadow-sm"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500 shadow-sm shadow-violet-500/50" />}
                      <svg className={`size-4 shrink-0 transition-colors ${active ? "text-violet-500" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <span className="truncate">{item.label}</span>
                      {item.label === "Achievements" && achievementCount > 0 && (
                        <span className="ml-auto min-w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-bold text-white flex items-center justify-center px-1.5 shadow-sm">
                          {achievementCount}
                        </span>
                      )}
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
                <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20 shrink-0 overflow-hidden ring-2 ring-white/50 dark:ring-zinc-800/50">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="size-full object-cover" /> : initial}
                </div>
                <div className="text-sm min-w-0 flex-1">
                  <p className="font-semibold truncate text-zinc-800 dark:text-zinc-200">{user.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${user.role === "INSTRUCTOR" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"}`}>
                      {user.role === "INSTRUCTOR" ? "Instructor" : "Student"}
                    </span>
                  </div>
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
              <Link href="/register" className="block text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all text-center">Get started</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
