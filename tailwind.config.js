/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#166534", // green-800
                    light: "#15803d", // green-700
                    dark: "#14532d", // green-900
                },
                secondary: {
                    DEFAULT: "#facc15", // yellow-400
                    light: "#fde047", // yellow-300
                },
                accent: "#f97316", // orange-500
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
