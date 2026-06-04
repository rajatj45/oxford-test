import type { Config } from "tailwindcss";


const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ["var(--font-primary)", "sans-serif"], // this creates font-headline class
        secondaryFont: ["var(--font-secondary)"],
      },
    },
  },
  plugins: [],
};

export default config;