module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto_400Regular'],
        medium: ['Roboto_500Medium'],
        bold: ['Roboto_700Bold'],
        black: ['Roboto_900Black'],
      },
      colors: {
        primary: "#0D9488", // Teal-600
        secondary: "#F97316", // Orange-500
        accent: "#14B8A6", // Teal-500
        background: "#F8FAFC", // Slate-50 - Nền sáng sủa sạch sẽ
        surface: "#FFFFFF",
        text: "#1E293B", // Slate-800
        subtext: "#64748B", // Slate-500
      },
    },
  },
  plugins: [],
}
