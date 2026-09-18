import type { Config } from "tailwindcss";

// Traditional American barbershop palette: deep navy, barber-pole crimson,
// a restrained blue accent, and warm off-white. Sampled to complement the
// 35TonsorialLogo emblem without competing with it.
const config: Config = {
  // lib/glow.ts is listed because it holds the btn-glow-{n} class names; the
  // rest of lib/ and emails/ are excluded so words in their comments and
  // inline-styled HTML (e.g. "container", "transition") don't ship dead CSS.
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/glow.ts",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0c101c",
          900: "#131b30",
          700: "#283454",
          600: "#34426a",
        },
        crimson: {
          700: "#6f1a24",
          600: "#93222d",
          500: "#ac2b38",
          400: "#c2434f",
        },
        royal: {
          400: "#4a6bab",
        },
        gold: "#c9a227",
        cream: {
          DEFAULT: "#f7f2e7",
          dim: "#c9c2b0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 8px 30px -8px rgba(147, 34, 45, 0.55)",
      },
    },
  },
  plugins: [],
};
export default config;
