"use client";

import { motion } from "framer-motion";

const steps = [
  {
    label: "Discovery",
    desc: "Capture preferences through guided design questions and store them with the project.",
  },
  {
    label: "Generation",
    desc: "Trigger preview generation when the last answer is saved, then track job progress.",
  },
  {
    label: "Review",
    desc: "Share visuals, request acceptance, or move to production when the client is ready.",
  },
  {
    label: "Delivery",
    desc: "Follow shipping and delivery milestones without losing the design context.",
  },
];

export function ProcessStrip() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 className="serif-heading text-3xl text-ink sm:text-4xl">
        One flow, no chaos
      </h2>

      <div className="relative mt-6">
        <div className="absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative rounded-2xl border border-black/5 bg-white/70 p-4 shadow-inner shadow-black/5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="relative">
                  <div className="h-7 w-7 rounded-full border border-gold/40 bg-gold/20" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
                </div>
                <span className="text-xs uppercase tracking-wide text-ash">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-ink">{step.label}</h3>
                <p className="text-xs text-ash">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
