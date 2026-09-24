import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // "Verified Slate" brand palette — see brand.md (hex, not oklch(): Tailwind
        // v3's @apply can't resolve opacity modifiers like border-slate/20 on raw
        // oklch() config values)
        ink: "#091015",
        slate: "#465865",
        leaf: "#31573f",
        signal: "#18364a",
        paper: "#f6f9fb",
        mist: "#edf1f4"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        soft: "0 12px 36px rgba(9, 16, 21, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
