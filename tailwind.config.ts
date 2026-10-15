import type { Config } from "tailwindcss";

// Palette sampled from the 35th Tonsorial logos and red marble background:
// logo red, black, and white. (Token names kept from the old navy/blue theme.)
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
          950: "#000000",
          900: "#000000",
          700: "#3a3a3a",
          600: "#555555",
        },
        crimson: {
          700: "#a30000",
          600: "#d90000",
          500: "#ec1c1c",
          400: "#ff5a5a",
        },
        // Accent now white (from the logo's lettering) instead of blue.
        royal: {
          400: "#ffffff",
        },
        gold: "#ffffff",
        cream: {
          DEFAULT: "#ffffff",
          dim: "#d9d4d4",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 8px 30px -8px rgba(217, 0, 0, 0.55)",
      },
    },
  },
  plugins: [],
};
export default config;
