module.exports = {
  content: [
    "./src/pages/**/*.tsx",
    "./src/components/**/*.tsx",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#1E1E1E",
        fontGray: "#8B9AB1",
        fontBlack: "#0F172A",

      }
    },
    fontFamily: {
      poppins: ['"Poppins"'],
    },
  },
  variants: {
    extend: {
      borderWidth: ["hover", "focus"],
      fontFamily: ["hover", "focus"],
      fontWeight: ["hover", "focus", "group-hover"],
      scale: ["active", "group-hover"],
    },
  },
  plugins: [require("@tailwindcss/forms")({ strategy: "class" }), require('tailwind-scrollbar-hide')],
};
