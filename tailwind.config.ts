import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // adaptive (light/dark) tokens: the values live in app/globals.css
        ink: { DEFAULT: "rgb(var(--ink) / <alpha-value>)", soft: "rgb(var(--ink-soft) / <alpha-value>)" },
        surface: "rgb(var(--surface) / <alpha-value>)",
        mist: "rgb(var(--mist) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        brand: { DEFAULT: "#2457ff", dark: "#1a42d1", soft: "rgb(var(--brand-soft) / <alpha-value>)", ring: "#9db6ff" },
        volt: { DEFAULT: "#c8f31d", dark: "#a8d000", soft: "rgb(var(--volt-soft) / <alpha-value>)" },
        sale: { DEFAULT: "#ff3b5c", soft: "rgb(var(--sale-soft) / <alpha-value>)" },
        // constant dark navy for panels that are dark in BOTH themes (hero, footer, admin sidebar)
        night: { DEFAULT: "#0b1220", soft: "#2a3447" },
      },
      fontFamily: {
        sans: ['"Inter Variable"', "ui-sans-serif", "system-ui", '"Noto Sans Khmer"', '"Khmer UI"', "sans-serif"],
        display: ['"Space Grotesk Variable"', '"Inter Variable"', "ui-sans-serif", "system-ui", '"Noto Sans Khmer"', "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,.04), 0 4px 16px rgba(11,18,32,.04)",
        lift: "0 8px 30px rgba(11,18,32,.10)",
        glow: "0 10px 40px rgba(36,87,255,.35)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "none" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(.96)" }, "100%": { opacity: "1", transform: "none" } },
        "slide-in-right": { "0%": { opacity: "0", transform: "translateX(24px)" }, "100%": { opacity: "1", transform: "none" } },
        "slide-in-left": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "none" } },
        "slide-up": { "0%": { transform: "translateY(100%)" }, "100%": { transform: "none" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pop: { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.35)" }, "100%": { transform: "scale(1)" } },
        grow: { "0%": { transform: "scaleY(0)" }, "100%": { transform: "scaleY(1)" } },
        shrink: { "0%": { transform: "scaleX(1)" }, "100%": { transform: "scaleX(0)" } },
        wiggle: { "0%,100%": { transform: "rotate(0)" }, "20%": { transform: "rotate(14deg)" }, "40%": { transform: "rotate(-12deg)" }, "60%": { transform: "rotate(8deg)" }, "80%": { transform: "rotate(-4deg)" } },
        pulseRing: { "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,.5)" }, "100%": { boxShadow: "0 0 0 10px rgba(34,197,94,0)" } },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.2,.7,.2,1) both",
        "fade-in": "fade-in .3s ease both",
        "scale-in": "scale-in .25s cubic-bezier(.2,.7,.2,1) both",
        "slide-in-right": "slide-in-right .35s cubic-bezier(.2,.7,.2,1) both",
        "slide-in-left": "slide-in-left .3s cubic-bezier(.2,.7,.2,1) both",
        "slide-up": "slide-up .3s cubic-bezier(.2,.7,.2,1) both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        shimmer: "shimmer 1.4s infinite",
        pop: "pop .35s ease",
        grow: "grow .7s cubic-bezier(.2,.7,.2,1) both",
        shrink: "shrink 4.5s linear forwards",
        "pulse-ring": "pulseRing 1.6s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
