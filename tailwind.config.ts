import type { Config } from "tailwindcss";
import assistantUiPlugin from "@assistant-ui/react-ui/tailwindcss";
import animatePlugin from "tailwindcss-animate";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@assistant-ui/react-ui/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {},
  },
  plugins: [animatePlugin, assistantUiPlugin],
} satisfies Config;
