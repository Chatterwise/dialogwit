/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Headings: Montserrat, UI: Inter (both are modern, geometric, and highly legible)
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Montserrat", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#fff5f2",
          100: "#ffe4db",
          200: "#ffc7b0",
          300: "#ffa085",
          400: "#ff7a5c",
          500: "#ff5233", // Main Chatterwise orange
          600: "#e64422",
          700: "#b52e14",
          800: "#8c210c",
          900: "#701909",
        },
        accent: {
          50: "#f3f8fd",
          100: "#e1f0fa",
          200: "#b8def2",
          300: "#7fc6e6",
          400: "#4faedb",
          500: "#2497cf", // Vibrant blue accent
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
        // Optional: Success, warning, error for UI feedback
        success: "#22c55e",
        warning: "#facc15",
        error: "#ef4444",
      },
      fontSize: {
        // Bigger, bolder headings for modern UI
        "display-2xl": ["3rem", { lineHeight: "1.1", fontWeight: "800" }],
        "display-xl": ["2.25rem", { lineHeight: "1.15", fontWeight: "800" }],
        "display-lg": ["1.875rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["1.5rem", { lineHeight: "1.25", fontWeight: "700" }],
      },
      boxShadow: {
        subtle: "0 1px 4px 0 rgba(31, 41, 55, 0.05)",
        card: "0 2px 8px 0 rgba(255, 82, 51, 0.06)", // subtle orange shadow
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      transitionProperty: {
        colors:
          "color, background-color, border-color, text-decoration-color, fill, stroke",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
