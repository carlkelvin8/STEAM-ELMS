"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export default function IDPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const parsed = JSON.parse(raw);
    fetch(`/api/auth/profile?id=${parsed.id}`)
      .then((r) => r.json())
      .then((data) => { if (data.user) setUser(data.user); })
      .finally(() => setLoading(false));
  }, [router]);

  const downloadPDF = () => {
    setDownloading(true);
    window.print();
    setTimeout(() => setDownloading(false), 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading ID...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();
  const shortId = user.id.slice(0, 8).toUpperCase();
  const qrUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard/id` : "";
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
  const memberYear = new Date(user.createdAt).getFullYear();
  const expiryYear = memberYear + 4;

  return (
    <>
      <style>{`
        @media print {
          body { background: #f0f0f0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .id-card-wrapper { padding: 0 !important; display: flex !important; justify-content: center !important; align-items: center !important; min-height: 100vh !important; }
          .id-card { box-shadow: none !important; border: none !important; break-inside: avoid; page-break-inside: avoid; }
          .id-card * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 0.5in; }
        }
      `}</style>

      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8 no-print">
          <h1 className="text-2xl font-bold">Campus ID</h1>
          <p className="text-zinc-500 mt-1 text-sm">Your official identification card</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8 no-print">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all disabled:opacity-50"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? "Preparing..." : "Download PDF"}
          </button>
          <button
            onClick={() => window.location.href = "/dashboard/settings"}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* ID Card - Portrait Physical ID Style */}
        <div className="id-card-wrapper flex justify-center">
          <div
            ref={cardRef}
            className="id-card relative w-[340px] min-h-[520px] rounded-[20px] overflow-hidden shadow-2xl shadow-zinc-300/50 dark:shadow-black/50"
          >
            {/* Card background with security pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-violet-700 via-violet-600 to-indigo-800" />
            <div className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            {/* Top branding bar */}
            <div className="relative px-6 pt-6 pb-4 bg-white/10 backdrop-blur-sm border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/95 flex items-center justify-center shadow-md">
                  <svg className="size-6 text-violet-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                  </svg>
                </div>
                <div>
                  <span className="text-white font-bold text-lg tracking-tight">CAMPUS</span>
                  <p className="text-[10px] text-white/70 font-medium tracking-[0.2em] uppercase">Learning Hub</p>
                </div>
              </div>
            </div>

            {/* Photo + Info section */}
            <div className="relative px-6 pt-6 pb-2 flex gap-5">
              {/* Photo */}
              <div className="shrink-0">
                <div className="size-28 rounded-xl border-[3px] border-white/60 shadow-lg shadow-black/10 overflow-hidden bg-white/20 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-4xl">{initial}</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="mb-3">
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider mb-0.5">Name</p>
                  <p className="text-white font-bold text-base leading-tight truncate">{user.name}</p>
                </div>
                <div className="mb-3">
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider mb-0.5">ID Number</p>
                  <p className="text-white font-mono font-bold text-sm tracking-wider">{shortId}</p>
                </div>
                <div>
                  <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${user.role === "INSTRUCTOR" ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30" : "bg-sky-400/20 text-sky-200 border border-sky-400/30"}`}>
                    {user.role === "INSTRUCTOR" ? "Instructor" : "Student"}
                  </span>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="relative px-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-white/10">
                  <p className="text-[9px] text-white/50 font-medium uppercase tracking-wider">Email</p>
                  <p className="text-white text-[11px] font-medium truncate">{user.email}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-white/10">
                  <p className="text-[9px] text-white/50 font-medium uppercase tracking-wider">Member Since</p>
                  <p className="text-white text-[11px] font-medium">{memberYear}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-white/10">
                  <p className="text-[9px] text-white/50 font-medium uppercase tracking-wider">Valid Until</p>
                  <p className="text-white text-[11px] font-medium">{expiryYear}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-white/10">
                  <p className="text-[9px] text-white/50 font-medium uppercase tracking-wider">Department</p>
                  <p className="text-white text-[11px] font-medium truncate">{user.role === "INSTRUCTOR" ? "Faculty" : "Student Affairs"}</p>
                </div>
              </div>
            </div>

            {/* Signature + Holographic strip */}
            <div className="relative px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-white/40 font-medium uppercase tracking-[0.15em] mb-0.5">Authorized Signature</p>
                <div className="w-32 h-6 relative">
                  <svg viewBox="0 0 120 24" className="w-32 h-6 text-white/30 fill-current">
                    <path d="M5 18 Q15 5 30 12 Q45 19 60 8 Q75 -3 90 14 Q105 31 115 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              {/* Holographic effect */}
              <div className="size-9 rounded-lg bg-gradient-to-br from-violet-300/30 via-pink-300/20 to-cyan-300/30 border border-white/20 shadow-inner">
                <div className="size-full rounded-lg bg-gradient-to-tr from-transparent via-white/5 to-white/20" />
              </div>
            </div>

            {/* Bottom bar with barcode + QR */}
            <div className="relative bg-black/20 backdrop-blur-sm border-t border-white/10 px-5 py-4">
              <div className="flex items-center gap-4">
                {/* Barcode simulation */}
                <div className="flex-1 flex items-end gap-[2px] h-10">
                  {Array.from({ length: 48 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-white/70 rounded-[1px]"
                      style={{ height: `${50 + Math.random() * 60}%`, opacity: 0.3 + Math.random() * 0.7 }}
                    />
                  ))}
                </div>
                {/* QR */}
                <div className="shrink-0 bg-white rounded-lg p-1.5 shadow-md">
                  <img src={qrApi} alt="QR" className="size-14" />
                </div>
              </div>
              <p className="text-[7px] text-white/30 font-medium tracking-[0.3em] uppercase text-center mt-2">
                This card is property of CAMPUS Learning Hub
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
