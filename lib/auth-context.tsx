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
      // Prefer name from token, then fallback if it's not an email, then other token fields
      const tokenName = payload.name;
      const tokenEmail = payload.email;
      const fallbackName = fallback && !fallback.includes("@") ? fallback : null;
      
      return (
        tokenName ||
        fallbackName ||
        tokenEmail ||
        payload.sub ||
        payload.preferred_username ||
        fallback ||
        null
      );
    } catch {
      return fallback ?? null;
    }
  }

  // Initial hydration from localStorage
  useEffect(() => {
    const stored = getToken();
    setTokenState(stored);
    setUserName(deriveNameFromToken(stored) ?? null);
    setHydrated(true);
  }, []);

  // Sync with localStorage on route changes and add storage event listener
  useEffect(() => {
    if (!hydrated) return;

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "jewelai_token") {
        const stored = getToken();
        setTokenState(stored);
        setUserName(deriveNameFromToken(stored) ?? null);
      }
    };

    // Defensive check: if token state is null but localStorage has a token, reload it
    // This helps recover from state loss during navigation
    const stored = getToken();
    if (!token && stored) {
      setTokenState(stored);
      setUserName(deriveNameFromToken(stored) ?? null);
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [hydrated]); // Removed token from dependencies to avoid loops

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
    if (!hydrated) return;
    
    // Check token state first, then fallback to localStorage directly
    const hasToken = token || getToken();
    
    if (!hasToken) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);
}
