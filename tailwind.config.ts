import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                premium: {
                    dark: "#0a0a0c",
                    slate: "#1c1c1f",
                    gold: "#d4af37",
                    gold_dim: "#aa8c2c",
                    text: "#e5e5e5",
                    muted: "#a1a1aa"
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            },
        },
    },
    plugins: [],
};
export default config;
