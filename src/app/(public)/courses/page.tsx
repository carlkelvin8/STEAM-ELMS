import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseFilters } from "./filters";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const difficulty =
    typeof params.difficulty === "string" ? params.difficulty : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;

  const where: Record<string, unknown> = { published: true };
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (tag) where.tags = { some: { tag } };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const [courses, categories, difficulties, tags] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: { select: { name: true } },
        modules: {
          include: { lessons: { select: { id: true } } },
        },
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { published: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
    prisma.course.findMany({
      where: { published: true, difficulty: { not: null } },
      select: { difficulty: true },
      distinct: ["difficulty"],
    }),
    prisma.courseTag.findMany({
      where: { course: { published: true } },
      select: { tag: true },
      distinct: ["tag"],
    }),
  ]);

  const categoryList = categories.map((c) => c.category!);
  const difficultyList = difficulties.map((d) => d.difficulty!);
  const tagList = tags.map((t) => t.tag);

  const hasFilters = category || difficulty || tag || q;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-8">
        <CourseFilters
          categories={categoryList}
          difficulties={difficultyList}
          tags={tagList}
        />

        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Courses</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                {hasFilters
                  ? `Showing ${courses.length} course${courses.length !== 1 ? "s" : ""}`
                  : "Explore available VR courses"}
              </p>
            </div>
          </div>

          <form method="GET" action="/courses" className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search courses..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors text-sm"
            />
          </form>

          {courses.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <p className="text-lg">No courses match your filters</p>
              <p className="text-sm mt-1">
                Try adjusting or clearing your filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const lessonCount = course.modules.reduce(
                  (acc, m) => acc + m.lessons.length,
                  0,
                );
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-colors flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {course.tags.slice(0, 2).map((t) => (
                        <span
                          key={t.tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                        >
                          {t.tag}
                        </span>
                      ))}
                      {course.difficulty && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {course.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      {course.instructor.name}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 flex-1">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500">
                      <span>{course.modules.length} modules</span>
                      <span>{lessonCount} lessons</span>
                      {course.estimatedHours && (
                        <span>~{course.estimatedHours}h</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
