"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

interface CourseFiltersProps {
  categories: string[];
  difficulties: string[];
  tags: string[];
}

export function CourseFilters({
  categories,
  difficulties,
  tags,
}: CourseFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category");
  const selectedDifficulty = searchParams.get("difficulty");
  const selectedTag = searchParams.get("tag");

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  const toggleFilter = (name: string, value: string) => {
    const current = searchParams.get(name);
    const newValue = current === value ? null : value;
    router.push(`${pathname}?${createQueryString(name, newValue)}`);
  };

  const clearAll = () => router.push(pathname);

  const hasFilters = selectedCategory || selectedDifficulty || selectedTag;

  return (
    <aside className="w-64 shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-sm">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {categories.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Category
            </h3>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleFilter("category", cat)}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-medium"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {difficulties.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Difficulty
            </h3>
            <div className="space-y-0.5">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => toggleFilter("difficulty", diff)}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedDifficulty === diff
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-medium"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleFilter("tag", t)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    selectedTag === t
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-medium"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
