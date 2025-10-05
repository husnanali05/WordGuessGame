/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ note the ** not //*
  ],
  theme: {
    extend: {
      // Optional: register a Tailwind family name if you want to use `font-silkscreen` via Tailwind
      fontFamily: {
        silkscreen: ['"Silkscreen"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
