"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useAuthGuard } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  useAuthGuard();
  const router = useRouter();
  const { logout, token, userName } = useAuth();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.getMe,
    enabled: !!token,
  });
  const greetName =
    meQuery.data?.displayName ||
    (meQuery.data as { display_name?: string })?.display_name ||
    (meQuery.data as { name?: string })?.name ||
    (userName && !userName.includes("@") ? userName : undefined) ||
    "there";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen text-coal">
      <header className="border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="serif-heading text-2xl tracking-wide text-ink">
              JEWELAI
            </span>
            <span className="rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-xs font-semibold text-ink">
              Studio
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-ash">
            {token && (
              <span className="rounded-full border border-black/5 bg-parchment px-3 py-1 text-ink">
                {`Hello, ${greetName}!`}
              </span>
            )}
            <button
              onClick={handleLogout}
              className={cn(
                "rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-coal transition hover:-translate-y-[1px] hover:shadow-md",
              )}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10">{children}</main>
    </div>
  );
}
