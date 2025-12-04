import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f4efe6",
        parchment: "#e8dfd3",
        coal: "#15120f",
        ink: "#0f0c0a",
        ash: "#6f665c",
        gold: "#d4af37",
        "gold-soft": "#e6d3a3",
        ivory: "#fffaf2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        luxe: "0 18px 50px rgba(0,0,0,0.12)",
        "luxe-strong": "0 28px 80px rgba(0,0,0,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
