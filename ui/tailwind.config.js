/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'ocn-purple': '#5063BF',
                'ocn-aqua': '#8EDFEB',
                'ocn-dark': '#414B77',
                'ocn-medium': '#6F6F77',
                'ocn-light': '#FAFAFD',
            },
            boxShadow: {
                'ocn-8': '0 4px 6px -1px rgba(80, 99, 191, 0.08), 0 2px 4px -1px rgba(80, 99, 191, 0.08)',
                'ocn-25': '0 10px 15px -3px rgba(80, 99, 191, 0.25), 0 4px 6px -2px rgba(80, 99, 191, 0.25)',
            }
        },
    },
    plugins: [],
}
