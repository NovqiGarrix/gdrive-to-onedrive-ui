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
        primary: "#2F80ED",
        fontGray: "#8B9AB1",
        fontGray2: "#798AA5",
        fontBlack: "#0F172A",
        purple: "#725DFF",
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
