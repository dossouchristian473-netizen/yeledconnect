import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f2f6fb",
        card: "#ffffff",
        border: "#e7edf5",
        ink: "#0f1b2d",
        soft: "#5c6b80",
        faint: "#8a97a8",
        blue: {
          DEFAULT: "#3b9be0",
          dark: "#2c86cc",
          bg: "#dbeefc",
        },
        teal: {
          DEFAULT: "#3fb8c9",
          dark: "#1f9c86",
          bg: "#d7f3ee",
        },
        yellowbg: "#fdeec9",
        yellowtext: "#a6740b",
        danger: "#e6485c",
        // Les 4 classes d'âge (voir rooms.color en base) — David/Joseph/
        // Gédéon/Daniel. Utilisées partout où une classe/salle précise doit
        // être identifiée visuellement, à la place du bleu générique.
        david: "#A7C7E7",
        joseph: "#FFC9DE",
        gedeon: "#FFFACD",
        daniel: "#C1E1C1",
      },
      fontFamily: {
        serif: ["var(--font-baloo)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg2: "26px",
        md2: "18px",
      },
      boxShadow: {
        card: "0 12px 30px -14px rgba(20,40,70,.10)",
        nav: "0 10px 30px -8px rgba(20,40,70,.14)",
      },
    },
  },
  plugins: [],
};
export default config;
