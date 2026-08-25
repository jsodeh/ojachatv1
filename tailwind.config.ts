import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        grok: {
          dark: {
            background: "#1e1e1e",
            input: "#333333",
            secondary: "#2a2a2a",
            border: "#3e3e3e",
            text: {
              primary: "#ffffff",
              secondary: "#a0a0a0",
              tertiary: "#808080"
            },
            button: {
              bg: "#2a2a2a",
              hover: "#3a3a3a"
            }
          },
          light: {
            background: "#ffffff",
            input: "#f0f0f0",
            secondary: "#f5f5f5",
            border: "#e0e0e0",
            text: {
              primary: "#1a1a1a",
              secondary: "#505050",
              tertiary: "#757575"
            },
            button: {
              bg: "#f5f5f5",
              hover: "#e5e5e5"
            }
          },
          background: "#1e1e1e",
          input: "#333333",
          secondary: "#2a2a2a",
          border: "#3e3e3e",
          text: {
            primary: "#ffffff",
            secondary: "#a0a0a0",
            tertiary: "#808080"
          },
          button: {
            bg: "#2a2a2a",
            hover: "#3a3a3a"
          },
          grokGreen: {
            DEFAULT: "#16a34a",
            light: "#12b76a",
            dark: "#15803d"
          }
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      },
      animation: {
        blink: 'blink 1s ease-in-out infinite',
      },
      boxShadow: {
        'send-button-inactive': '0 4px 6px -1px rgba(128, 128, 128, 0.1), 0 2px 4px -2px rgba(128, 128, 128, 0.1)',
        'send-button-active': '0 4px 6px -1px rgba(22, 163, 74, 0.3), 0 2px 4px -2px rgba(22, 163, 74, 0.3)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;