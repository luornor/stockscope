// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB", // used by text-brand / bg-brand/10
          50: "#EEF2FF",
          600: "#2563EB",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.08)", // shadow-soft
      },
      borderColor: {
        subtle: "rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
