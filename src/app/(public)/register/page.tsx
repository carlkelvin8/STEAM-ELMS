"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string)?.trim();
    const email = (form.get("email") as string)?.trim();
    const password = form.get("password") as string;

    if (!name || name.length < 2) {
      setError("Name must be at least 2 characters");
      setLoading(false);
      return;
    }
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-sm space-y-6 px-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Start your VR learning journey
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
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
            className="w-full rounded-lg bg-violet-600 text-white py-2 text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
