import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        moss: "#385244",
        leaf: "#5c8068",
        clay: "#b25f45",
        paper: "#f7f4ee",
        mist: "#e8eee9"
      },
      boxShadow: {
        soft: "0 12px 36px rgba(23, 32, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
