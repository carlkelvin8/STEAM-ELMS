"use client";

import { useEffect, useState, useRef } from "react";

interface ModuleNavItem {
  id: string;
  order: number;
  title: string;
  lessonCount: number;
}

export function CourseNav({ modules }: { modules: ModuleNavItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const initialized = useRef(false);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => setActiveId(hash), 0);
      }
    }
    initialized.current = true;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );

    for (const mod of modules) {
      const el = document.getElementById(`module-${mod.order}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [modules]);

  const handleClick = (e: React.MouseEvent, moduleOrder: number) => {
    e.preventDefault();
    const id = `module-${moduleOrder}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <div className="sticky top-24 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          {modules.length} {modules.length === 1 ? "Module" : "Modules"}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {modules.reduce((a, m) => a + m.lessonCount, 0)} lessons total
        </p>
      </div>
      <nav className="space-y-1">
        {modules.map((mod) => {
          const sectionId = `module-${mod.order}`;
          const isActive = activeId === sectionId;
          return (
            <a
              key={mod.id}
              href={`#${sectionId}`}
              onClick={(e) => handleClick(e, mod.order)}
              className={`block rounded-xl border px-4 py-3 transition-all ${
                isActive
                  ? "border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/20 shadow-sm"
                  : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <p
                className={`text-xs font-medium ${
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-violet-600"
                }`}
              >
                Module {mod.order}
              </p>
              <p className="text-sm font-medium mt-0.5">{mod.title}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {mod.lessonCount} {mod.lessonCount === 1 ? "lesson" : "lessons"}
              </p>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
