"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("animate-reveal");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`opacity-0 translate-y-8 transition-all duration-1000 ease-out ${className}`}>
      {children}
    </div>
  );
}

export function StaggerReveal({ children, className = "" }: { children: ReactNode[]; className?: string }) {
  return (
    <>
      {children.map((child, i) => (
        <ScrollReveal key={i} delay={i * 150} className={className}>
          {child}
        </ScrollReveal>
      ))}
    </>
  );
}

export function AnimatedGradient({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-purple-600/20 animate-gradient-shift ${className}`}
    />
  );
}

export function FloatingOrbs({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[100px] opacity-20 animate-float-random pointer-events-none"
          style={{
            width: `${150 + (i * 100)}px`,
            height: `${150 + (i * 100)}px`,
            background: i % 2 === 0 ? "rgb(139, 92, 246)" : "rgb(99, 102, 241)",
            left: `${20 + (i * 25)}%`,
            top: `${15 + (i * 20)}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${8 + (i * 2)}s`,
          }}
        />
      ))}
    </>
  );
}
