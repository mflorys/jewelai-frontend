"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const appNav = [
  { href: "/app/processes", label: "Procesy" },
  { href: "/app/settings", label: "Ustawienia" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-jewel-bg text-white">
      <aside className="hidden w-60 flex-col border-r border-white/10 bg-black/30 p-4 md:flex">
        <Link href="/" className="mb-6 text-lg font-semibold">
          JewelAI
        </Link>
        <nav className="space-y-1 text-sm">
          {appNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}