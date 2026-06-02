/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        kitchen: {
          cream: "#fbf7ef",
          paper: "#fffdf8",
          ink: "#24221f",
          muted: "#766f65",
          orange: "#f97316",
          sage: "#7aa36f",
          mint: "#dcebd2",
          clay: "#d97757",
        },
      },
      boxShadow: {
        soft: "0 14px 40px rgba(36, 34, 31, 0.08)",
      },
    },
  },
  plugins: [],
};
