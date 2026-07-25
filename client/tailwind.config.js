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
        info: "#4b5563",
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
