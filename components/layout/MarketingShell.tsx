"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-ivory via-sand to-parchment text-coal">
      <header className="relative z-20 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="serif-heading text-2xl text-ink">JEWELAI</span>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-ink">
              Studio
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-ash">
            <a href="#how-it-works" className="transition hover:text-ink">
              How it works
            </a>
            <a href="#features" className="transition hover:text-ink">
              Workflow
            </a>
            <Link
              href="/login"
              className="rounded-full border border-ink/10 bg-ink px-5 py-2 text-sm font-semibold text-ivory shadow-md transition hover:-translate-y-[1px] hover:shadow-luxe"
            >
              Enter studio
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative flex-1">
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.8, scale: 1.05 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute -inset-[30%] bg-[radial-gradient(circle_at_20%_20%,_rgba(212,175,55,0.35)_0,_transparent_40%),radial-gradient(circle_at_80%_10%,_rgba(0,0,0,0.12)_0,_transparent_32%),radial-gradient(circle_at_60%_70%,_rgba(0,0,0,0.1)_0,_transparent_38%)] blur-3xl"
      />
    </div>
  );
}
