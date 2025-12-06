"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="grid gap-10 pt-14 min-h-[calc(100vh-80px)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
      <div className="space-y-8">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="serif-heading text-4xl sm:text-5xl lg:text-6xl"
        >
          A calm studio for bespoke jewelry projects
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
      </div>

      <motion.img
        src="/hero.png"
        alt="Bespoke jewelry design"
        initial={{ y: 40, opacity: 0 }}
        animate={{
          y: [0, -25, 0],
          opacity: 1,
        }}
        transition={{
          opacity: { delay: 0.1, duration: 0.7, ease: "easeOut" },
          y: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="w-full h-auto"
      />
    </div>
  );
}
