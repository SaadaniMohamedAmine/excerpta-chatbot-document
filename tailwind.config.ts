import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-source-serif)", "Georgia", "Cambria", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      keyframes: {
        "eq-bar": {
          "0%, 100%": {
            transform: "scaleY(1)",
            backgroundColor: "rgb(var(--color-primary) / 0.5)",
          },
          "20%": {
            transform: "scaleY(1.5)",
            backgroundColor: "rgb(var(--color-primary))",
          },
          "40%": {
            transform: "scaleY(1)",
            backgroundColor: "rgb(var(--color-primary) / 0.5)",
          },
        },
        "typing-dot": {
          "0%, 60%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "30%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "eq-bar": "eq-bar 1s linear infinite",
        "typing-dot": "typing-dot 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
