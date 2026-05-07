import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        surface: "#141821",
        surface2: "#1c2230",
        border: "#262d3d",
        accent: "#f5c518" // IMDb yellow
      }
    }
  },
  plugins: []
};
export default config;
