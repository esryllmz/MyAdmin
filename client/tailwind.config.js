/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Light Mode Colors
        primary: "#004ac6",
        "primary-container": "#2563eb",
        "on-primary": "#ffffff",
        surface: "#f8f9ff",
        "surface-container-low": "#eff4ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#434655",
        "outline-variant": "#c3c6d7",

        // Dark Mode Colors
        "dark-primary": "#5a9eff",
        "dark-primary-container": "#0051d4",
        "dark-on-primary": "#000000",
        "dark-surface": "#0b1117",
        "dark-surface-container-low": "#161b22",
        "dark-surface-container-lowest": "#010409",
        "dark-surface-container-high": "#21262d",
        "dark-surface-container-highest": "#30363d",
        "dark-on-surface": "#e6edf3",
        "dark-on-surface-variant": "#8b949e",
        "dark-outline-variant": "#30363d",

        // Success, Error, Warning
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
        info: "#3b82f6",
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
