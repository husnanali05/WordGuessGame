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
      // Custom responsive breakpoints for better mobile support
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Custom spacing for mobile optimization
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
