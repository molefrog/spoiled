import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./demo/index.html", "./demo/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["SF Pro", "Inter", "system-ui", "sans-serif"],
    },
    extend: {},
  },
  plugins: [typography()],
};
