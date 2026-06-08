"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string)?.trim();
    const password = form.get("password") as string;

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push(data.user.role === "INSTRUCTOR" ? "/teacher" : "/dashboard");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-sm space-y-8 px-6">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Sign in to continue learning in VR
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              maxLength={128}
              autoComplete="current-password"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 text-center" role="alert">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg shadow-violet-500/20 transition-all"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
