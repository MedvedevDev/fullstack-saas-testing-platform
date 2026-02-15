/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "flow-indigo": "var(--color-flow-indigo)",
        "flow-bg": "var(--color-flow-bg)",
        "flow-blue": "var(--color-flow-blue)",
        "flow-border": "var(--color-flow-border)",
        "flow-text-main": "var(--color-flow-text-main)",
        "flow-text-muted": "var(--color-flow-text-muted)",
      },
    },
  },
  plugins: [],
};
