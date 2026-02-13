import type { Config } from "tailwindcss";

export default {
  content: ["./client/src/**/*.{js,ts,jsx,tsx}", "./client/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: "#001278",
        blue: "#02a2fd",
        green: "#36bf78",
        dark: "#040822",
        subtle: "#f8fafc",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
