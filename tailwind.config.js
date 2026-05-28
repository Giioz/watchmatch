/** @type {import('tailwindcss').Config} */
module.exports = {
  // მიუთითებს, სად ეძებოს კლასები
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}