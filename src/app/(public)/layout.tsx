import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Chatbot } from "@/components/chatbot";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
      <Chatbot />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="size-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-violet-500/20">
                S
              </div>
              <span className="font-bold">
                STEAM <span className="text-violet-600">ELMS</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              An immersive VR-powered learning management system designed for
              STEAM education. Learn science, technology, engineering, arts, and
              mathematics in virtual reality.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-violet-600 transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-violet-600 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li>
                <Link
                  href="/login"
                  className="hover:text-violet-600 transition-colors"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-violet-600 transition-colors"
                >
                  Get started
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-6 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} STEAM ELMS. All rights reserved.
      </div>
    </footer>
  );
}
