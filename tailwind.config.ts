import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jewel: {
          bg: "#050509",
          panel: "#101015",
          primary: "#6B4CFF",
          accent: "#FFD76B",
        },
      },
    },
  },
  plugins: [],
};

export default config;