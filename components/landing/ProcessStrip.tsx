"use client";

import { motion } from "framer-motion";

const steps = [
  {
    label: "Quiz intake",
    desc: "Klient odpowiada na pytania – wszystko ląduje w JSON-ie na procesie.",
  },
  {
    label: "Process pipeline",
    desc: "Proces idzie krok po kroku po statusach z backendu.",
  },
  {
    label: "Visualization",
    desc: "Łączysz odpowiedzi z wizualizacją / modelem 3D.",
  },
  {
    label: "Delivery",
    desc: "Status PRODUCTION / DELIVERY domyka temat.",
  },
];

export function ProcessStrip() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Jak JewelAI porządkuje chaos projektów
      </h2>
      <p className="max-w-2xl text-sm text-white/60">
        Front jest cienką warstwą nad tym, co już masz w backendzie:
        DesignProcess, DesignProcessStatus, QuizQuestion, UserAnswer.
      </p>

      <div className="relative mt-6">
        <div className="absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="relative">
                  <div className="h-7 w-7 rounded-full bg-white/10 ring-2 ring-white/40" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/30" />
                </div>
                <span className="text-xs uppercase tracking-wide text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">
                  {step.label}
                </h3>
                <p className="text-xs text-white/60">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}