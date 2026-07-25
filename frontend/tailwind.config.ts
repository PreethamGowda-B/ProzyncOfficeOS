import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core neutrals
        ink: "#0B0D12",
        "ink-2": "#1A1D27",
        "ink-3": "#242736",
        surface: "#F4F5F8",
        "surface-2": "#ECEEF3",
        card: "#FFFFFF",
        "card-hover": "#F8F9FC",
        border: "#E2E5EE",
        "border-dark": "#2E3347",
        muted: "#8892A4",
        "muted-dark": "#4A5568",
        // Accent — indigo/violet
        accent: {
          DEFAULT: "#4F46E5",
          light: "#EEF2FF",
          dark: "#3730A3",
          subtle: "#C7D2FE",
        },
        // Status colors
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          dark: "#D97706",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#DC2626",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
          dark: "#2563EB",
        },
        // Role badge colors
        role: {
          superadmin: "#7C3AED",
          admin: "#4F46E5",
          hr: "#DB2777",
          pm: "#059669",
          lead: "#0891B2",
          dev: "#2563EB",
          designer: "#7C3AED",
          mobile: "#0D9488",
          qa: "#D97706",
          sales: "#DC2626",
          biz: "#9333EA",
          finance: "#B45309",
          intern: "#6B7280",
          client: "#047857",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        "card-lg": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        glow: "0 0 0 3px rgb(79 70 229 / 0.15)",
        "glow-sm": "0 0 0 2px rgb(79 70 229 / 0.12)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "ticker": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "fade-in-slow": "fade-in 0.5s ease-out both",
        "slide-in-left": "slide-in-left 0.25s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
        "ticker": "ticker 18s linear infinite",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
