const colors = require("tailwindcss/colors");
// you can also make your own color list and import

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts}"],
  theme: {
    extend: {
      colors: {
        neutral: colors.gray,
      },
    },
  },
  plugins: [],
};
