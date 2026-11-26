/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        barber: {
          dark: "#F8FAFC",
          light: "#FFFFFF",
          card: "#FFFFFF",
          cardHover: "#F1F5F9",
          border: "#E2E8F0",
          gold: "#D97706",
          goldHover: "#B45309",
          amber: "#F59E0B",
          text: "#0F172A",
          muted: "#64748B",
          poleRed: "#DC2626",
          poleBlue: "#2563EB",
        },
        wa: {
          green: "#25D366",
          darkGreen: "#075E54",
          teal: "#128C7E",
          lightGreen: "#DCF8C6",
          bubbleOut: "#D9FDD3",
          bubbleIn: "#FFFFFF",
          bg: "#F8FAFC",
          panelBg: "#F1F5F9",
          border: "#E2E8F0",
        },
      },
    },
  },
  plugins: [],
};
