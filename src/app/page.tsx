"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollReveal, StaggerReveal, FloatingOrbs } from "@/components/animations";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex-1 bg-zinc-950">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <VRShowcaseSection />
      <PopularCoursesSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}

/* ───────────────────── HERO ───────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-zinc-950 to-indigo-950" />
      <FloatingOrbs count={3} />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            perspective: "800px",
            transform: "rotateX(10deg)",
            transformOrigin: "bottom",
          }}
        />
      </div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="size-1 bg-violet-400/40 rounded-full animate-orbit" />
        <div className="size-1.5 bg-indigo-400/30 rounded-full animate-orbit-reverse" style={{ marginTop: -4, marginLeft: -4 }} />
      </div>

      <div className="absolute top-20 left-10 w-32 h-32 border border-violet-500/20 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: "20s" }} />
      <div className="absolute bottom-40 right-16 w-48 h-48 border border-indigo-500/10 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: "25s", animationDirection: "reverse" }} />
      <div className="absolute top-1/2 right-20 w-24 h-24 border border-violet-400/15 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: "15s" }} />

      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute size-1.5 bg-violet-400/30 rounded-full animate-float pointer-events-none"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 4) * 20}%`,
            animationDuration: `${4 + i * 1.2}s`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-40 text-center">
        <ScrollReveal>
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-tight text-white">
            Learn{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-shimmer">
              Beyond Reality
            </span>
            <br />
            <span className="text-zinc-400">with Virtual Reality</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Step inside your lessons. STEAM ELMS brings science, technology,
            engineering, arts, and mathematics to life through immersive VR
            experiences — learn by doing, not just watching.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={450}>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="group relative rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Enter the VR World
                <svg className="size-4 group-hover:translate-x-1.5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link
              href="/courses"
              className="group rounded-xl border border-zinc-700 px-8 py-3.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 hover:scale-105 active:scale-95 transition-all duration-500"
            >
              <span className="flex items-center gap-2">
                Browse courses
                <svg className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <div className="mt-16 flex justify-center">
            <div className="relative w-36 h-24 perspective-800">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 to-indigo-600/20 rounded-2xl border border-violet-500/20 backdrop-blur-sm animate-float hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-500" style={{ animationDuration: "6s" }}>
                <div className="flex items-center justify-center h-full gap-5">
                  <div className="size-12 rounded-full border-2 border-violet-400/40 group-hover:border-violet-300/60 transition-colors" />
                  <div className="size-12 rounded-full border-2 border-violet-400/40 group-hover:border-violet-300/60 transition-colors" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-violet-500/30 rounded-full blur-sm" />
                <div className="absolute -top-1 -left-1 size-2 bg-violet-400/40 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───────────────────── FEATURES ───────────────────── */

function FeaturesSection() {
  return (
    <section className="relative py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-zinc-950 to-zinc-950" />
      <FloatingOrbs count={2} />
      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Immersive{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">VR Learning Experience</span>
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Our platform combines cutting-edge VR technology with proven
              educational methodologies for unmatched learning outcomes.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StaggerReveal>
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group card-tilt card-border-glow relative rounded-2xl border border-zinc-800 p-8 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 bg-zinc-900/50"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-0 group-hover:w-1/3 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent transition-all duration-700" />
                <div className="relative">
                  <div className="size-16 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/20 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-3 group-hover:text-violet-300 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── HOW IT WORKS ───────────────────── */

function HowItWorksSection() {
  return (
    <section className="relative py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/20 via-zinc-950 to-zinc-950" />
      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Start Learning in{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">4 Simple Steps</span>
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Getting started with VR learning is easier than you think.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-px h-[70%] bg-gradient-to-b from-violet-500/40 to-indigo-500/40 hidden lg:block" />

          <div className="space-y-16 lg:space-y-0">
            {steps.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 150}>
                <div className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-8 lg:gap-16`}>
                  <div className="flex-1">
                    <div className="group card-tilt rounded-2xl border border-zinc-800 p-8 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 bg-zinc-900/50">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-3xl">{step.icon}</span>
                        <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">
                          Step {i + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center justify-center">
                    <div className="size-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">
                      {i + 1}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── VR SHOWCASE ───────────────────── */

function VRShowcaseSection() {
  return (
    <section className="relative py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[160px] animate-scale-pulse" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">Virtual Campus</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Explore the{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Virtual Campus</span>
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Navigate through immersive 3D environments designed for interactive learning.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {showcaseItems.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 200}>
              <div className="group card-tilt relative rounded-2xl border border-zinc-800 overflow-hidden hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 bg-zinc-900/30">
                <div className="aspect-video bg-gradient-to-br from-zinc-900 to-zinc-800 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(139,92,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.2) 1px, transparent 1px)",
                      backgroundSize: "30px 30px",
                      transform: "rotateX(60deg)",
                      transformOrigin: "center bottom",
                    }}
                  />
                  <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-violet-500/20 rounded-full blur-2xl animate-pulse-glow" />
                  <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-indigo-500/20 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-3 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500">{item.icon}</div>
                      <div className="text-violet-400 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        Launch Experience
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-violet-300 transition-colors duration-300">{item.title}</h3>
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">{item.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── POPULAR COURSES ───────────────────── */

function PopularCoursesSection() {
  return (
    <section className="relative py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/10 to-zinc-950" />
      <FloatingOrbs count={2} />
      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">Courses</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Popular{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">VR Courses</span>
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Dive into our most popular courses designed for immersive VR learning.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCourses.map((course, i) => (
            <ScrollReveal key={course.title} delay={i * 100}>
              <div className="group card-tilt relative rounded-2xl border border-zinc-800 overflow-hidden hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 bg-zinc-900/50">
                <div className="aspect-[4/3] bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden flex items-center justify-center">
                  <div className="text-6xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500">{course.icon}</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-violet-400">{course.level}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500">{course.lessons} lessons</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors duration-300">{course.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-600">{course.students} students</span>
                    <span className="text-xs font-semibold text-violet-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Enroll now →
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 hover:scale-105 active:scale-95 transition-all duration-500"
            >
              View all courses
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───────────────────── STATS ───────────────────── */

function StatsSection() {
  return (
    <section className="relative py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-violet-950/10 to-zinc-950" />
      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">Our Impact</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Thousands</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 150}>
              <div className="text-center group p-6 rounded-2xl border border-transparent hover:border-zinc-800 hover:bg-zinc-900/50 transition-all duration-500">
                <p className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
                  {stat.value}
                </p>
                <p className="text-sm text-zinc-500 mt-2 group-hover:text-zinc-400 transition-colors duration-300">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── TESTIMONIALS ───────────────────── */

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-violet-950/5 to-zinc-950" />
      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              What Our{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Students Say</span>
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Hear from learners who have transformed their education through VR.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="relative rounded-2xl border border-zinc-800 p-8 md:p-12 bg-zinc-900/50 min-h-[280px]">
              <div className="absolute top-6 left-6 text-6xl text-violet-500/20 leading-none pointer-events-none select-none">
                &ldquo;
              </div>
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`transition-all duration-700 ${i === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"}`}
                >
                  {i === active && (
                    <div className="relative z-10">
                      <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-8 italic">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{t.name}</p>
                          <p className="text-sm text-zinc-500">{t.role}</p>
                        </div>
                        <div className="ml-auto flex gap-1">
                          {[...Array(5)].map((_, s) => (
                            <svg key={s} className="size-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`size-2 rounded-full transition-all duration-500 ${i === active ? "bg-violet-500 w-6" : "bg-zinc-700 hover:bg-zinc-600"}`}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── FAQ ───────────────────── */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/10 to-zinc-950" />
      <div className="relative max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Everything you need to know about VR learning on STEAM ELMS.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div
                className={`group rounded-2xl border transition-all duration-500 cursor-pointer ${
                  openIndex === i
                    ? "border-violet-500/50 bg-violet-500/5"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                }`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="flex items-center justify-between p-6">
                  <h3 className="text-white font-medium pr-4">{faq.question}</h3>
                  <div className={`size-8 shrink-0 rounded-full border transition-all duration-500 flex items-center justify-center ${
                    openIndex === i ? "border-violet-500 bg-violet-500/20 rotate-45" : "border-zinc-700"
                  }`}>
                    <svg className={`size-4 transition-transform duration-500 ${openIndex === i ? "text-violet-400" : "text-zinc-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-6 text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── CTA ───────────────────── */

function CTASection() {
  return (
    <section className="relative py-32 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="group relative rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 overflow-hidden hover:shadow-2xl hover:shadow-violet-500/20 transition-shadow duration-500">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 animate-pulse-glow" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative px-8 py-16 sm:py-20 text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight group-hover:scale-[1.02] transition-transform duration-500">
                Ready to step into the future?
              </h2>
              <p className="mt-4 text-violet-100 max-w-lg mx-auto">
                Join STEAM ELMS today and experience education in an entirely new
                dimension. Put on your headset and start learning.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/register"
                  className="group/btn rounded-xl bg-white text-violet-700 px-8 py-3.5 text-sm font-semibold hover:bg-violet-50 hover:scale-105 active:scale-95 shadow-xl transition-all duration-500"
                >
                  <span className="flex items-center gap-2">
                    Get started free
                    <svg className="size-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/courses"
                  className="group/btn rounded-xl border border-white/30 text-white px-8 py-3.5 text-sm font-semibold hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-500"
                >
                  <span className="flex items-center gap-2">
                    View courses
                    <svg className="size-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ───────────────────── FOOTER ───────────────────── */

function FooterSection() {
  return (
    <footer className="relative border-t border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 to-transparent pointer-events-none" />
      <FloatingOrbs count={1} />
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4">
              <Logo size="md" />
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              An immersive VR-powered learning management system designed for
              STEAM education. Learn science, technology, engineering, arts, and
              mathematics in virtual reality.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {["Twitter", "GitHub", "Discord"].map((social) => (
                <span
                  key={social}
                  className="text-xs text-zinc-600 hover:text-violet-400 cursor-pointer transition-colors duration-300 hover:scale-110 inline-block"
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white mb-5 relative inline-block">
              Platform
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-violet-500 rounded-full" />
            </h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              {[
                { href: "/courses", label: "Courses" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/progress", label: "My Progress" },
                { href: "/achievements", label: "Achievements" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-violet-400 hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white mb-5 relative inline-block">
              Account
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-violet-500 rounded-full" />
            </h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              {[
                { href: "/login", label: "Sign in" },
                { href: "/register", label: "Get started" },
                { href: "/dashboard/settings", label: "Settings" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-violet-400 hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} STEAM ELMS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-zinc-600">
              <span className="hover:text-violet-400 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-violet-400 cursor-pointer transition-colors">Terms of Service</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                Powered by VR
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────── DATA ───────────────────── */

const features = [
  {
    title: "VR Courses",
    description:
      "Interactive courses designed for VR headsets with 360-degree videos, 3D models, and fully immersive environments that make learning tangible.",
    icon: "🥽",
  },
  {
    title: "Progress Tracking",
    description:
      "Track your learning journey with detailed analytics, completion metrics, and personalized recommendations powered by AI.",
    icon: "📊",
  },
  {
    title: "Immersive Assessments",
    description:
      "Interactive quizzes, simulations, and hands-on assignments within virtual environments that make evaluation engaging and effective.",
    icon: "🎯",
  },
];

const steps = [
  {
    title: "Create Your Account",
    description:
      "Sign up for free and set up your profile. No VR headset required to get started — you can learn on any device.",
    icon: "📝",
  },
  {
    title: "Choose Your Path",
    description:
      "Browse our catalog of VR-enhanced courses across science, technology, engineering, arts, and mathematics.",
    icon: "🎯",
  },
  {
    title: "Dive Into VR Lessons",
    description:
      "Immerse yourself in interactive 3D environments. Conduct experiments, solve problems, and collaborate with peers.",
    icon: "🥽",
  },
  {
    title: "Track Your Progress",
    description:
      "Monitor your achievements, earn badges, and unlock new challenges as you advance through your learning journey.",
    icon: "📈",
  },
];

const showcaseItems = [
  {
    title: "Virtual Science Lab",
    description:
      "Conduct experiments in a fully equipped 3D laboratory. Mix chemicals, observe reactions, and learn safely without real-world risks.",
    icon: "🔬",
  },
  {
    title: "3D Engineering Studio",
    description:
      "Design, build, and test engineering projects in a virtual workshop. See your creations come to life in real-time.",
    icon: "⚙️",
  },
];

const popularCourses = [
  {
    title: "Introduction to VR Biology",
    description: "Explore the human body in immersive 3D — from cells to organ systems.",
    icon: "🧬",
    level: "Beginner",
    lessons: 12,
    students: "2.4K",
  },
  {
    title: "Virtual Chemistry Lab",
    description: "Mix compounds and observe chemical reactions in a safe virtual laboratory.",
    icon: "🧪",
    level: "Intermediate",
    lessons: 10,
    students: "1.8K",
  },
  {
    title: "Physics in 3D Space",
    description: "Master Newtonian physics through interactive 3D simulations and experiments.",
    icon: "⚡",
    level: "Advanced",
    lessons: 15,
    students: "1.2K",
  },
  {
    title: "Engineering Design Studio",
    description: "Design, prototype, and test mechanical systems in a virtual engineering lab.",
    icon: "🔧",
    level: "Intermediate",
    lessons: 14,
    students: "960",
  },
];

const stats = [
  { value: "50+", label: "VR Courses" },
  { value: "10K+", label: "Active Students" },
  { value: "95%", label: "Completion Rate" },
  { value: "4.8", label: "Average Rating" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Biology Student",
    quote: "STEAM ELMS completely transformed how I learn biology. Dissecting a virtual frog in VR was far more educational and humane than the real thing. I could repeat the process until I truly understood every organ system.",
  },
  {
    name: "Marcus Johnson",
    role: "Engineering Major",
    quote: "The engineering design studio is incredible. I can prototype and test mechanical systems in VR before building them in real life. It has saved me countless hours and materials in my senior design project.",
  },
  {
    name: "Elena Rodriguez",
    role: "High School Teacher",
    quote: "My students are more engaged than ever. The VR chemistry lab lets them experiment freely without safety concerns. Their test scores have improved by 40% since we started using STEAM ELMS.",
  },
  {
    name: "James Park",
    role: "Self-Learner",
    quote: "I never thought I could learn quantum physics, but the 3D visualizations in STEAM ELMS make abstract concepts tangible. It is like having a personal tutor who can show you anything in full 3D.",
  },
];

const faqs = [
  {
    question: "Do I need a VR headset to use STEAM ELMS?",
    answer: "No! While VR headsets provide the most immersive experience, all courses are fully accessible on desktop, tablet, and mobile devices. You can start learning immediately without any special equipment.",
  },
  {
    question: "What subjects are available?",
    answer: "STEAM ELMS covers science, technology, engineering, arts, and mathematics. We offer over 50 courses ranging from beginner to advanced levels, with new content added every month.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! We offer a 14-day free trial with full access to all courses. No credit card required. You can cancel anytime during the trial period with no obligations.",
  },
  {
    question: "Can I track my learning progress?",
    answer: "Absolutely. Our analytics dashboard tracks your completion rates, quiz scores, time spent in VR, and skills mastered. You can set goals, earn achievement badges, and compare your progress with peers.",
  },
  {
    question: "Are there live instructors or is it self-paced?",
    answer: "Both! We offer self-paced courses you can take on your own schedule, as well as live instructor-led VR sessions where you can interact with teachers and classmates in real-time.",
  },
  {
    question: "How do assessments work in VR?",
    answer: "Assessments are integrated directly into the VR experience. You might be asked to perform a virtual dissection, build a circuit, or solve a physics problem in 3D space. It is hands-on learning at its finest.",
  },
];
