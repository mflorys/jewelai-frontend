"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-jewel-bg text-white overflow-hidden">
      <header className="relative z-20 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold">JewelAI</span>
            <span className="rounded-full bg-gradient-to-r from-purple-500 to-amber-400 px-2 py-0.5 text-xs text-black">
              Process Hub
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Jak to działa
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Funkcje
            </a>
            <Link
              href="/app/login"
              className="rounded-full bg-gradient-to-r from-purple-500 to-amber-400 px-4 py-2 text-sm font-medium text-black shadow-lg shadow-purple-500/30"
            >
              Wejdź do aplikacji
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative">
        <AnimatedBackground />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.8, scale: 1.05 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute -inset-[30%] bg-[radial-gradient(circle_at_top,_rgba(107,76,255,0.55)_0,_transparent_50%),radial-gradient(circle_at_20%_70%,_rgba(255,215,107,0.28)_0,_transparent_52%),radial-gradient(circle_at_80%_60%,_rgba(147,51,234,0.35)_0,_transparent_50%)] blur-3xl"
      />
    </div>
  );
}