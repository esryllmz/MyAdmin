/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Ana Aksiyon Renkleri
        primary: "#004ac6",
        "primary-container": "#2563eb",
        "on-primary": "#ffffff", // Buton metinleri için kritik ekleme!

        // Yüzey Hiyerarşisi
        surface: "#f8f9ff",
        "surface-container-low": "#eff4ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",

        // Diğer Renkler
        "on-surface": "#0b1c30",
        "on-surface-variant": "#434655",
        "outline-variant": "#c3c6d7",
      },
      fontFamily: {
        // Tasarım sisteminde belirtilen Inter fontu
        sans: ["Inter", "sans-serif"],
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem", // Tasarım sistemindeki kart köşe yuvarlaklığı
      },
      letterSpacing: {
        // Editoryal başlıklar için negatif letter-spacing
        tight: "-0.02em",
      }
    },
  },
  plugins: [],
}