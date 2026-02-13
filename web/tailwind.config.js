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
                    DEFAULT: '#94fbdd',
                    70: 'rgba(148, 251, 221, 0.7)',
                    20: 'rgba(148, 251, 221, 0.2)',
                    highlight: '#94fbdd33', // 20% opacity
                },
                background: '#121214',
                surface: {
                    DEFAULT: '#18181b', // Zinc-900 like
                    card: '#252527',    // Slightly lighter
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#9CA3AF',
                },
                border: {
                    subtle: '#FFFFFF0D', // 5% opacity
                    accent: '#94fbdd33',
                }
            },
            fontFamily: {
                montserrat: ['Montserrat', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
            }
        },
    },
    plugins: [],
}
