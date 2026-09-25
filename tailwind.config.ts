import type { Config } from "tailwindcss";

const withOpacity = (cssVar: string) => `rgb(var(${cssVar}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // "Verified Slate" brand palette — see brand.md. Theme-aware tokens are
        // backed by CSS variables (light values in :root, dark values in .dark)
        // so existing classes like `text-ink` or `border-slate/20` adapt to dark
        // mode automatically — no per-usage `dark:` variants needed.
        ink: withOpacity("--color-ink"),
        slate: withOpacity("--color-slate"),
        leaf: withOpacity("--color-leaf"),
        signal: withOpacity("--color-signal"),
        paper: withOpacity("--color-paper"),
        mist: withOpacity("--color-mist"),
        surface: withOpacity("--color-surface"),
        // Fixed (non-theme-varying) tokens for the handful of solid CTA blocks
        // (primary button, hero band, file-input button) that stay dark in both
        // themes by design, so their white text always has contrast.
        onyx: "#091015",
        graphite: "#465865"
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
