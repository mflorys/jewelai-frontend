"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken, setToken } from "./auth-storage";

type AuthContextValue = {
  token: string | null;
  hydrated: boolean;
  userName: string | null;
  saveToken: (token: string, fallbackName?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  function deriveNameFromToken(idToken: string | null, fallback?: string) {
    if (!idToken) return fallback ?? null;
    try {
      const parts = idToken.split(".");
      if (parts.length < 2) return fallback ?? null;
      const payload = JSON.parse(atob(parts[1]));
      return (
        payload.name ||
        payload.email ||
        payload.sub ||
        payload.preferred_username ||
        fallback ||
        null
      );
    } catch {
      return fallback ?? null;
    }
  }

  useEffect(() => {
    const stored = getToken();
    setTokenState(stored);
    setUserName(deriveNameFromToken(stored) ?? null);
    setHydrated(true);
  }, []);

  const value = useMemo(
    () => ({
      token,
      userName,
      hydrated,
      saveToken: (nextToken: string, fallbackName?: string) => {
        setTokenState(nextToken);
        setToken(nextToken);
        setUserName(deriveNameFromToken(nextToken, fallbackName));
      },
      logout: () => {
        clearToken();
        setTokenState(null);
        setUserName(null);
      },
    }),
    [token, userName, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useAuthGuard() {
  const { token, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);
}
