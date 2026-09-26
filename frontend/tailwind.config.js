/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0d1321",
        surface: {
          DEFAULT: "#141b2c",
          raised: "#1b2438",
        },
        border: {
          DEFAULT: "#28324a",
          strong: "#3a4666",
        },
        accent: {
          DEFAULT: "#14b8a6",
          bright: "#22d3ee",
          soft: "rgba(34, 211, 238, 0.15)",
        },
        // Backwards compatibility alias for gold -> accent
        gold: {
          DEFAULT: "#22d3ee",
          soft: "#14b8a6",
        },
        text: {
          primary: "#eceae3",
          secondary: "#9098ae",
          muted: "#5e6a85",
        },
        live: "#4ade80",
        danger: {
          DEFAULT: "#f2867b",
          bg: "#2b1a1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Fraunces", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glow: "var(--shadow-btn-glow)",
        "glow-lg": "var(--shadow-btn-glow-hover)",
        card: "var(--shadow-card-hover)",
        nav: "var(--shadow-nav-active)",
        soft: "var(--shadow-soft-drop)",
      },
      zIndex: {
        0: '0',
        content: '0',
        sticky: '30',
        nav: '40',
        sidebar: '40',
        dropdown: '50',
        popover: '50',
        drawer: '60',
        modal: '70',
        dialog: '70',
        command: '80',
        toast: '90',
      },
    },
  },
  plugins: [],
}
