import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { pubbg: "#0f0f12", pubcard: "#17171c", pubaccent: "#d4a373" }
    }
  },
  plugins: []
};
export default config;
