/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#dbe7ff",
          200: "#b3cdff",
          300: "#88b0ff",
          400: "#6298ff",
          500: "#3b82f6", // Tailwind default blue
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        accent: {
          50: "#fffefc",
          100: "#fef6e7",
          200: "#fdeac5",
          300: "#fbdc9d",
          400: "#facc6d",
          500: "#fbbf24", // gold/yellow accent (for stats or highlights)
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        success: "#22c55e",
        warning: "#eab308",
        error: "#ef4444",
      },
      fontSize: {
        "display-2xl": ["2.75rem", { lineHeight: "1.1", fontWeight: "800" }],
        "display-xl": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-lg": ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
        "display-md": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.04)",
        card: "0 4px 12px rgba(0, 0, 0, 0.06)",
        inner: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
