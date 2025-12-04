"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <div className="grid gap-10 pt-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
      <div className="space-y-8">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="serif-heading text-4xl sm:text-5xl lg:text-6xl"
        >
          A calm studio for bespoke jewelry projects.
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-xl text-sm text-ash sm:text-base"
        >
          JewelAI guides every project from early preferences to generated
          previews and production milestones. One continuous surface for
          clients, designers, and makers.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            href="/login"
            className="rounded-full border border-ink/10 bg-ink px-6 py-3 text-sm font-semibold text-ivory shadow-md shadow-black/10 transition hover:-translate-y-[1px] hover:shadow-luxe"
          >
            Enter the studio
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-coal shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            See the flow
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
        className="relative"
      >
        <div className="pointer-events-none absolute -inset-10 rounded-[36px] bg-gradient-to-br from-gold/30 via-parchment/60 to-transparent blur-3xl" />
        <div className="relative rounded-3xl border border-black/10 bg-white/70 p-4 shadow-luxe">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-parchment/80 px-4 py-3 text-xs text-ash">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span>Project #13 — Custom pendant</span>
            </div>
            <span className="rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-[10px] text-ink">
              Preview ready
            </span>
          </div>

          <div className="grid gap-3 text-[11px] text-ash sm:grid-cols-4">
            {["Discovery", "Generation", "Production", "Delivery"].map((col, idx) => (
              <div
                key={col}
                className="rounded-2xl bg-white/90 p-3 ring-1 ring-black/5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-ink">{col}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/80" />
                </div>
                <div className="space-y-1.5">
                  <div className="rounded-xl bg-parchment/80 px-2 py-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-ink">Project #13</span>
                      {idx <= 2 && (
                        <span className="rounded-full bg-gold/15 px-2 py-px text-[9px] text-ink">
                          active
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[9px] text-ash">
                      {idx === 0 && "Design questions underway"}
                      {idx === 1 && "Rendering preview"}
                      {idx === 2 && "Preparing production brief"}
                      {idx === 3 && "Ready for delivery"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-parchment/80 px-3 py-3 text-[10px] text-ash">
            <div className="mb-1 flex items-center justify-between">
              <span>Preference snapshot</span>
              <span className="rounded-full border border-black/10 bg-white px-2 py-px">
                JSON
              </span>
            </div>
            <pre className="max-h-24 overflow-hidden text-[9px] text-ink">
{`{
  "style": "minimal",
  "metal": "Platinum",
  "stone": "Emerald"
}`}
            </pre>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
