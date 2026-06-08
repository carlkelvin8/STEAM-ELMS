import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

const STORAGE_KEY = "user";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const router = useRouter();

  const login = useCallback((userData: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    const current = getStoredUser();
    if (!current) return;
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }, []);

  return { user, loading: false, login, logout, updateUser };
}

export function useApi() {
  const { user, logout } = useUser();

  const apiFetch = useCallback(
    async <T = unknown>(url: string, options: FetchOptions = {}): Promise<T> => {
      const { skipAuth, ...fetchOpts } = options;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(fetchOpts.headers as Record<string, string>),
      };

      if (!skipAuth && user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }

      const res = await fetch(url, { ...fetchOpts, headers });

      if (res.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      if (res.status === 204) return undefined as T;
      return res.json();
    },
    [user, logout]
  );

  return { apiFetch, user };
}
