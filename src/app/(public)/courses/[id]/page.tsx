import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseNav } from "./course-nav";
import { EnrollButton } from "./enroll-button";

export default async function CourseDetailPage(
  props: PageProps<"/courses/[id]">
) {
  const { id } = await props.params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { name: true, bio: true } },
      modules: {
        include: {
          lessons: {
            include: { vrContent: true },
            orderBy: { order: "asc" },
          },
          resources: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      tags: true,
    },
  });

  if (!course || !course.published) notFound();

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  const navModules = course.modules.map((m) => ({
    id: m.id,
    order: m.order,
    title: m.title,
    lessonCount: m.lessons.length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-violet-600 transition-colors mb-6"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to courses
      </Link>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-72 shrink-0">
          <CourseNav modules={navModules} />
        </aside>

        <div className="flex-1 min-w-0 space-y-8">
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-8 bg-white/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-4">
              {course.tags.map((t) => (
                <span
                  key={t.tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-medium"
                >
                  {t.tag}
                </span>
              ))}
              {course.difficulty && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-medium">
                  {course.difficulty}
                </span>
              )}
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold tracking-tight">
                  {course.title}
                </h1>
                <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                  <span>by {course.instructor.name}</span>
                  {course.estimatedHours && (
                    <>
                      <span className="text-zinc-300">·</span>
                      <span>~{course.estimatedHours} hours</span>
                    </>
                  )}
                  <span className="text-zinc-300">·</span>
                  <span>{totalLessons} lessons</span>
                </div>
              </div>
              <div className="shrink-0">
                <EnrollButton courseId={course.id} />
              </div>
            </div>
            <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {course.description}
            </p>
            {course.instructor.bio && (
              <p className="mt-4 text-sm text-zinc-500 italic border-l-2 border-violet-200 dark:border-violet-800 pl-4">
                {course.instructor.bio}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {course.modules.map((module) => (
              <section
                key={module.id}
                id={`module-${module.order}`}
                className="scroll-mt-24 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden bg-white/50 dark:bg-zinc-900/50"
              >
                <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider">
                        Module {module.order}
                      </p>
                      <h2 className="text-lg font-semibold mt-0.5">
                        {module.title}
                      </h2>
                    </div>
                    <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full font-medium">
                      {module.lessons.length} lessons
                    </span>
                  </div>
                  {module.description && (
                    <p className="text-sm text-zinc-500 mt-2">
                      {module.description}
                    </p>
                  )}
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {module.lessons.map((lesson, idx) => (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.id}/lessons/${lesson.id}`}
                      className="px-8 py-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-colors"
                    >
                      <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-500 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{lesson.title}</p>
                          {lesson.videoUrl ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300 font-semibold">
                              VIDEO
                            </span>
                          ) : lesson.type === "ARTICLE" || lesson.type === "READING" || lesson.type === "TEXT" ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold">
                              READ
                            </span>
                          ) : lesson.type ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 font-semibold">
                              {lesson.type.replace(/_/g, " ")}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {lesson.type.replace(/_/g, " ")}
                          {lesson.duration &&
                            ` · ${Math.ceil(lesson.duration / 60)} min`}
                        </p>
                      </div>
                      <svg className="size-4 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  ))}
                </div>

                {module.resources.length > 0 && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 px-8 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="size-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Resources</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {module.resources.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          {r.type === "PDF" ? (
                            <svg className="size-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                          ) : (
                            <svg className="size-5 shrink-0 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{r.title}</p>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{r.type}</p>
                          </div>
                          {r.type === "PDF" && r.url ? (
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                            </a>
                          ) : r.content ? (
                            <button className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                              onClick={() => {
                                const w = window.open("", "_blank");
                                if (w) {
                                  w.document.write(`<!DOCTYPE html><html><head><title>${r.title}</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:2rem;line-height:1.7;color:#1a1a2e}h1{font-size:1.5rem;font-weight:700;margin-bottom:.5rem}.meta{font-size:.85rem;color:#888;margin-bottom:2rem}hr{border:none;border-top:1px solid #e5e7eb;margin:2rem 0}p{margin-bottom:1rem}</style></head><body><h1>${r.title}</h1><p class="meta">Article</p><hr>${r.content}</body></html>`);
                                  w.document.close();
                                }
                              }}
                            >
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
