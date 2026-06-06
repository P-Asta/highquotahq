/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "20px",
      screens: {
        "2xl": "1200px"
      }
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        hq: {
          black: "#171717",
          muted: "#4d4d4d",
          soft: "#666666",
          line: "#ebebeb",
          surface: "#fafafa",
          link: "#0072f5",
          develop: "#0a72ef",
          preview: "#de1d8d",
          ship: "#ff5b4f"
        }
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px"
      },
      boxShadow: {
        border: "0 0 0 1px rgba(0,0,0,0.08)",
        card: "0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.04), 0 8px 8px -8px rgba(0,0,0,0.04), 0 0 0 1px #fafafa",
        light: "0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.04)"
      }
    }
  },
  plugins: []
};
