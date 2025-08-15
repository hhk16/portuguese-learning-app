import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0e12",
        card: "#11161d",
        brand: "#00a884",
        brand2: "#415aff",
        accent: "#b16cff",
      },
    },
  },
  plugins: [],
};
export default config; 