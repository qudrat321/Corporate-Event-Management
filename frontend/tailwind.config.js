// Tell Tailwind which files contain the page styles it should build.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#20242c",
        muted: "#737b88",
        canvas: "#f6f7f9",
        brand: {
          50: "#f2f7f7",
          100: "#dcebea",
          500: "#3d7775",
          600: "#2f6563",
          700: "#285453",
          900: "#1d3d3c",
        },
        coral: "#e88c70",
      },
      boxShadow: {
        card: "0 12px 35px rgba(27, 38, 48, 0.07)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
