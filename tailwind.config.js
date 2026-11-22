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
          dark: "#121214",
          card: "#18181B",
          cardHover: "#232328",
          border: "#2E2E36",
          gold: "#D4AF37",
          goldHover: "#E5C158",
          amber: "#F59E0B",
          text: "#F4F4F6",
          muted: "#A1A1AA",
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
          bg: "#EFEAE2",
          panelBg: "#F0F2F5",
          border: "#E9EDEF",
        },
      },
    },
  },
  plugins: [],
};
