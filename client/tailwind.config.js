/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Light Mode — monochrome ink system
        primary: "#111111",
        "primary-container": "#2a2a2a",
        "on-primary": "#ffffff",
        secondary: "#e5e5e5",
        "secondary-container": "#dddddd",
        "on-secondary-container": "#111111",
        tertiary: "#666666",
        surface: "#f5f5f5",
        "surface-bright": "#ffffff",
        "surface-dim": "#e5e5e5",
        "surface-container-low": "#eeeeee",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e5e5e5",
        "surface-container-highest": "#dddddd",
        "on-surface": "#111111",
        "on-surface-variant": "#666666",
        outline: "#a3a3a3",
        "outline-variant": "#dddddd",
        "inverse-surface": "#1f1f1f",
        "inverse-on-surface": "#f5f5f5",

        // Dark Mode — inverted monochrome
        "dark-primary": "#f5f5f5",
        "dark-primary-container": "#d4d4d4",
        "dark-on-primary": "#111111",
        "dark-secondary": "#1f1f1f",
        "dark-secondary-container": "#262626",
        "dark-on-secondary-container": "#f5f5f5",
        "dark-tertiary": "#a3a3a3",
        "dark-surface": "#0f0f0f",
        "dark-surface-bright": "#1b1b1b",
        "dark-surface-dim": "#090909",
        "dark-surface-container-low": "#151515",
        "dark-surface-container-lowest": "#1b1b1b",
        "dark-surface-container-high": "#212121",
        "dark-surface-container-highest": "#262626",
        "dark-on-surface": "#f5f5f5",
        "dark-on-surface-variant": "#a3a3a3",
        "dark-outline": "#525252",
        "dark-outline-variant": "#2a2a2a",

        // Status accents — kept for semantic meaning only (badges/alerts), never decorative
        success: "#3f8f5f",
        error: "#c0392b",
        warning: "#a3760f",
        "warning-strong": "#8a5f0a",
        "warning-soft": "rgba(163, 118, 15, 0.14)",
        "warning-border": "rgba(163, 118, 15, 0.28)",
        info: "#4b5563",

        // Single controlled accent — dark emerald. Reserved for focus rings, active nav/tab
        // state, badges, success states and link hover. Never used as a base surface color.
        accent: "#167A5B",
        "accent-hover": "#12684D",
        "accent-active": "#0F5942",
        // Small-text/icon variant — a touch darker than `accent` so 12-13px labels and thin
        // glyphs stay legible on light surfaces without needing heavier font weight.
        "accent-strong": "#0F684C",
        "accent-soft": "rgba(22, 122, 91, 0.12)",
        "accent-border": "rgba(22, 122, 91, 0.24)",
        "accent-on": "#ffffff",

        // Dark mode — brightened slightly for AA contrast against dark surfaces
        "dark-accent": "#22A67D",
        "dark-accent-hover": "#2BBE8F",
        "dark-accent-active": "#3ED2A2",
        "dark-accent-strong": "#3ED2A2",
        "dark-accent-soft": "rgba(34, 166, 125, 0.18)",
        "dark-accent-border": "rgba(34, 166, 125, 0.32)",
        "dark-accent-on": "#052A1E",
        "dark-warning-soft": "rgba(212, 160, 40, 0.16)",
        "dark-warning-border": "rgba(212, 160, 40, 0.3)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
      },
      letterSpacing: {
        tight: "-0.02em",
      }
    },
  },
  plugins: [],
}
