// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#10b981", // Emerald-500
        secondary: "#34d399", // Emerald-400
        accent: "#f97316", // Orange-500
        danger: "#ef4444", // Red-500
        warning: "#eab308", // Yellow-500
        background: "#f8fafc", // Slate-50
      },
      fontFamily: {
        // Add custom fonts here if needed
      }
    },
  },
  plugins: [],
}
