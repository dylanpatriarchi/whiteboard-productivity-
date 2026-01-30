/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
            },
            colors: {
                // Light mode
                light: {
                    bg: '#ffffff',
                    surface: '#f5f5f5',
                    border: '#e0e0e0',
                    text: '#000000',
                    'text-secondary': '#666666',
                },
                // Dark mode
                dark: {
                    bg: '#0a0a0a',
                    surface: '#1a1a1a',
                    border: '#2a2a2a',
                    text: '#ffffff',
                    'text-secondary': '#999999',
                },
            },
        },
    },
    plugins: [],
}
