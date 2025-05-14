import { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Poppins', 'system-ui', 'sans-serif'],
				poppins: ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Custom green colors for our theme
                green: {
                    light: '#E0F2E9',
                    DEFAULT: '#38B27D',
                    dark: '#1A6E4A'
                }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" }
                },
                "scale-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" }
                },
                "float-slow": {
                    "0%, 100%": { transform: "translateY(0) translateX(0)" },
                    "50%": { transform: "translateY(-20px) translateX(15px)" }
                },
                "float-medium": {
                    "0%, 100%": { transform: "translateY(0) translateX(0)" },
                    "50%": { transform: "translateY(30px) translateX(-20px)" }
                },
                "float-fast": {
                    "0%, 100%": { transform: "translateY(0) translateX(0)" },
                    "50%": { transform: "translateY(-15px) translateX(-15px)" }
                },
                "beam-move": {
                    "0%": { transform: "translateX(0%) rotate(45deg)" },
                    "100%": { transform: "translateX(200%) rotate(45deg)" }
                },
                "beam-move-reverse": {
                    "0%": { transform: "translateX(0%) rotate(-45deg)" },
                    "100%": { transform: "translateX(-200%) rotate(-45deg)" }
                },
                "pulse-ring": {
                    "0%": { transform: "scale(0.8)", opacity: "0.3" },
                    "50%": { transform: "scale(1.2)", opacity: "0.1" },
                    "100%": { transform: "scale(1.8)", opacity: "0" }
                },
                "pulse-ring-delayed": {
                    "0%": { transform: "scale(0.8)", opacity: "0.2" },
                    "50%": { transform: "scale(1.5)", opacity: "0.1" },
                    "100%": { transform: "scale(2)", opacity: "0" }
                }
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "scale-in": "scale-in 0.2s ease-out",
                "float-slow": "float-slow 15s ease-in-out infinite",
                "float-medium": "float-medium 12s ease-in-out infinite",
                "float-fast": "float-fast 10s ease-in-out infinite",
                "beam-move": "beam-move 10s linear infinite",
                "beam-move-reverse": "beam-move-reverse 15s linear infinite",
                "pulse-ring": "pulse-ring 6s ease-out infinite",
                "pulse-ring-delayed": "pulse-ring-delayed 7s ease-out infinite 2s"
			},
            boxShadow: {
                'green': '0 4px 14px 0 rgba(56, 178, 125, 0.3)',
            },
            backgroundImage: {
                'gradient-green': 'linear-gradient(90deg, #38B27D 0%, #1A6E4A 100%)',
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
};
