"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tab, setTab] = useState<"profile" | "account">("profile");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    const parsed = JSON.parse(raw);
    fetch(`/api/auth/profile?id=${parsed.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name);
          setBio(data.user.bio ?? "");
          setAvatarUrl(data.user.avatarUrl ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMessage({ type: "error", text: "Only image files are allowed" }); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage({ type: "error", text: "File size must be under 5MB" }); return; }

    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: data.error ?? "Upload failed" }); return; }
      setAvatarUrl(data.url);
      setAvatarPreview(URL.createObjectURL(file));
      setMessage({ type: "success", text: "Image uploaded" });
    } catch { setMessage({ type: "error", text: "Upload failed" }); }
    finally { setUploading(false); }
  };

  const removeAvatar = () => {
    setAvatarUrl("");
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user!.id, name, bio, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: data.error ?? "Failed to update" }); return; }
      const updated = data.user;
      localStorage.setItem("user", JSON.stringify({ id: updated.id, name: updated.name, email: updated.email, role: updated.role }));
      setUser(updated);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch { setMessage({ type: "error", text: "Something went wrong" }); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setMessage({ type: "error", text: "Password must be at least 6 characters" }); return; }
    if (newPassword !== confirmPassword) { setMessage({ type: "error", text: "Passwords do not match" }); return; }
    setChangingPassword(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user!.id, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: data.error ?? "Failed to change password" }); return; }
      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch { setMessage({ type: "error", text: "Something went wrong" }); }
    finally { setChangingPassword(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  const previewSrc = avatarPreview || avatarUrl || null;
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "S";

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-500 mt-1 text-sm">Manage your profile and account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 w-fit">
        <button
          onClick={() => setTab("profile")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "profile" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab("account")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "account" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Account
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            {message.type === "success"
              ? <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />}
          </svg>
          {message.text}
        </div>
      )}

      {tab === "profile" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6 space-y-5">
            <h2 className="text-sm font-semibold">Profile Picture</h2>
            <div className="flex items-center gap-5">
              <div className="relative size-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-violet-500/20 overflow-hidden shrink-0 group">
                {previewSrc ? (
                  <Image src={previewSrc} alt="Avatar" width={80} height={80} className="size-full object-cover" unoptimized />
                ) : (
                  initial
                )}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all cursor-pointer">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  {uploading ? "Uploading..." : "Upload photo"}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploading} />
                </label>
                <p className="text-xs text-zinc-400 mt-2">PNG, JPG, WEBP &middot; Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6 space-y-5">
            <h2 className="text-sm font-semibold">Basic Information</h2>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email</label>
              <input
                id="email" type="email" value={user?.email ?? ""} disabled
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed text-sm"
              />
              <p className="text-xs text-zinc-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                <input
                  id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Bio</label>
                <textarea
                  id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors resize-none placeholder:text-zinc-400"
                />
                <p className="text-xs text-zinc-400 mt-1">{bio.length}/500 characters</p>
            </div>
          </div>

          {/* Digital ID Preview */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6">
            <h2 className="text-sm font-semibold mb-3">Digital ID</h2>
            <div className="flex items-center gap-5">
              <div className="bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-sm shrink-0">
                {typeof window !== "undefined" && (
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/dashboard/id`)}`}
                    alt="ID QR Code"
                    width={80}
                    height={80}
                    className="size-20"
                    unoptimized
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Scan to view your ID</p>
                <p className="text-xs text-zinc-500 mt-1">Share this QR code so others can scan and verify your identity</p>
                <Link
                  href="/dashboard/id"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
                >
                  View full ID card
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving...
                </span>
              ) : "Save changes"}
            </button>
          </div>
        </form>
      )}

      {tab === "account" && (
        <div className="space-y-6">
          {/* Password */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6 space-y-5">
            <h2 className="text-sm font-semibold">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Current Password</label>
                <input
                  id="current-password" type="password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">New Password</label>
                <input
                  id="new-password" type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} required minLength={6} maxLength={128}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                />
                <p className="text-xs text-zinc-400 mt-1">At least 6 characters</p>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Confirm New Password</label>
                <input
                  id="confirm-password" type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
              >
                {changingPassword ? "Changing..." : "Update password"}
              </button>
            </form>
          </div>

          {/* Role info */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6">
            <h2 className="text-sm font-semibold mb-3">Account Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Role</span>
                <span className="font-medium capitalize">{user?.role.toLowerCase()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-zinc-500">Member since</span>
                <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"}</span>
              </div>
            </div>
          </div>

          {/* Campus ID */}
          <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-6">
            <h2 className="text-sm font-semibold mb-3">Campus ID</h2>
            <p className="text-sm text-zinc-500 mb-4">Share your digital ID card. Scan the QR code to view your profile.</p>
            <div className="flex items-center gap-6">
              <div className="bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-sm shrink-0">
                {typeof window !== "undefined" && (
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/dashboard/id`)}`}
                    alt="ID QR Code"
                    width={96}
                    height={96}
                    className="size-24"
                    unoptimized
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="size-14 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0 overflow-hidden ring-2 ring-white/50 dark:ring-zinc-800/50 mb-2">
                  {user?.avatarUrl ? <Image src={user.avatarUrl} alt="" width={56} height={56} className="size-full object-cover" unoptimized /> : user?.name?.charAt(0)?.toUpperCase() ?? "S"}
                </div>
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${user?.role === "INSTRUCTOR" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"}`}>
                  {user?.role === "INSTRUCTOR" ? "Instructor" : "Student"}
                </span>
              </div>
            </div>
            <Link
              href="/dashboard/id"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              View full ID card
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
