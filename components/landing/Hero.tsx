"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
      <div className="space-y-8">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Uporządkuj proces
          <span className="block bg-gradient-to-r from-purple-400 via-amber-300 to-purple-500 bg-clip-text text-transparent">
            projektowania biżuterii
          </span>
          zamiast gasić pożary.
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-xl text-sm text-white/70 sm:text-base"
        >
          JewelAI Process Hub łączy intake quiz, pipeline statusów i wizualizacje 3D
          w jednym miejscu. Każdy projekt przechodzi tę samą ścieżkę – od pierwszego
          pytania do gotowego modelu.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            href="/app/login"
            className="rounded-full bg-gradient-to-r from-purple-500 to-amber-400 px-6 py-3 text-sm font-medium text-black shadow-xl shadow-purple-500/40"
          >
            Wejdź do aplikacji
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
          >
            Zobacz jak działa
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
        className="relative"
      >
        <div className="pointer-events-none absolute -inset-10 rounded-[36px] bg-gradient-to-br from-purple-500/40 via-amber-400/20 to-transparent blur-3xl" />
        <div className="relative rounded-3xl border border-white/10 bg-[#0b0b11]/80 p-4 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Projekt #13 – Custom Pendant</span>
            </div>
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[10px] text-amber-200">
              VISUAL_READY
            </span>
          </div>

          <div className="grid gap-3 text-[11px] text-white/70 sm:grid-cols-4">
            {["Intake", "Generation", "Production", "Delivery"].map((col, idx) => (
              <div
                key={col}
                className="rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-white/80">{col}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400/70" />
                </div>
                <div className="space-y-1.5">
                  <div className="rounded-xl bg-white/5 px-2 py-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/80">
                        Projekt #13
                      </span>
                      {idx <= 2 && (
                        <span className="rounded-full bg-emerald-400/15 px-2 py-px text-[9px] text-emerald-200">
                          active
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[9px] text-white/50">
                      {idx === 0 && "Quiz intake w toku"}
                      {idx === 1 && "Generowanie wizualizacji"}
                      {idx === 2 && "Akceptacja do produkcji"}
                      {idx === 3 && "Gotowy do wysyłki"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-white/3 px-3 py-3 text-[10px] text-white/70">
            <div className="mb-1 flex items-center justify-between">
              <span>Quiz answers (debug view)</span>
              <span className="rounded-full bg-white/10 px-2 py-px">
                JSON
              </span>
            </div>
            <pre className="max-h-24 overflow-hidden text-[9px] text-emerald-200/90">
{`{
  "style": "minimal",
  "metal": "PLATINUM",
  "stone": "EMERALD"
}`}
            </pre>
          </div>
        </div>
      </motion.div>
    </div>
  );
}