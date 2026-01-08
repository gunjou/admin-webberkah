/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Menyalakan fitur dark mode berbasis class
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-gelap": "#2C2129",
        "custom-merah": "#7c161b", // Merah standar/gelap
        "custom-merah-terang": "#A91D24", // Merah lebih cerah untuk mode light
        "custom-cerah": "#B77171",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
