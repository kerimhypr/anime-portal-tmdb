import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Material You - seeded from #6750A4 (anime violet) + anime accents
        primary: {
          DEFAULT: "#6750A4",
          light: "#7D6BB6",
          dark: "#4F378B",
          container: "#EADDFF",
          onContainer: "#21005D",
        },
        secondary: {
          DEFAULT: "#625B71",
          container: "#E8DEF8",
          onContainer: "#1D192B",
        },
        tertiary: {
          DEFAULT: "#7D5260",
          container: "#FFD8E4",
        },
        surface: {
          DEFAULT: "#FFFBFE",
          dim: "#DED8E1",
          bright: "#FFFBFE",
          container: "#F3EDF7",
          "container-high": "#ECE6F0",
          variant: "#E7E0EC",
        },
        background: "#FFFBFE",
        error: "#BA1A1A",
        outline: "#79747E",
        // dark
        dark: {
          surface: "#141218",
          "surface-container": "#211F26",
          "surface-container-high": "#2B2930",
          "surface-variant": "#49454F",
          primary: "#D0BCFF",
          onPrimary: "#381E72",
          secondary: "#CCC2DC",
          outline: "#938F99",
        },
        // anime accent
        accent: {
          pink: "#FF6B9D",
          cyan: "#00D9FF",
          yellow: "#FFD93D",
          green: "#6BCB77",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "m3-xs": "4px",
        "m3-sm": "8px",
        "m3-md": "12px",
        "m3-lg": "16px",
        "m3-xl": "28px",
        "m3-2xl": "32px",
      },
      boxShadow: {
        "m3-1": "0 1px 2px rgba(0,0,0,0.30), 0 1px 3px 1px rgba(0,0,0,0.15)",
        "m3-2": "0 1px 2px rgba(0,0,0,0.30), 0 2px 6px 2px rgba(0,0,0,0.15)",
        "m3-3": "0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.30)",
        glow: "0 0 20px rgba(103,80,164,0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(12px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        shimmer: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } },
      },
    },
  },
  plugins: [],
};
export default config;
