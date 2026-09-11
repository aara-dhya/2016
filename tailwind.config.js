/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        pastel: '#77DD77',
        pastelGreen: '#77DD77',
        darkMint: '#38A368',
        mutedGray: '#A0A0A0',
        darkSurface: '#0A0A0A',
        cardBg: '#050505',
        borderDark: '#222222',
        borderPastel: '#77DD77',
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', '"Fira Code"', '"Space Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Space Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      boxShadow: {
        hardPastel: '4px 4px 0px #77DD77',
        hardDark: '4px 4px 0px #222222',
        pastelGlow: '0 0 10px rgba(119, 221, 119, 0.4)',
      }
    },
  },
  plugins: [],
};
