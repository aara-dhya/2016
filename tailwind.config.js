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
        darkBg: '#050505',
        darkCard: '#0A0A0A',
        neon: '#77DD77',
        neonGreen: '#77DD77',
        pastelGreen: '#77DD77',
        neonGlow: '#61D095',
        neonDark: '#38A368',
        mutedGray: '#A0A0A0',
        borderGray: '#222222',
        borderBright: '#77DD77',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', '"Fira Code"', 'Courier New', 'monospace'],
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
        neon: '4px 4px 0px #77DD77',
        neonSm: '2px 2px 0px #77DD77',
        neonLg: '6px 6px 0px #77DD77',
        neonHover: '0px 0px 15px rgba(119, 221, 119, 0.4)',
      }
    },
  },
  plugins: [],
};
