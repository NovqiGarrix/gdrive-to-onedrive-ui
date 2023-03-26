module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "bg": "#F5F6F8",
        "text": "#A2ABB7",
        "bg-light": "#F8F9FD",
        "bg-2": "#CBCFDA",
        "dark": "#656e7f",
        "darken": "#666e7f"
      }
    },
    fontFamily: {
      roboto: ['"Roboto"'],
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
  plugins: [require("daisyui"), require("@tailwindcss/forms")({ strategy: "class" }), require('tailwind-scrollbar-hide')],
};
