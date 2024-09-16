import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#DAF773',
          secondary: '#7C8D43',
        },
      },
    ],
  },
  theme: {
    extend: {
      colors: {
        main: '#DAF773',
        secondary: '#daf77380',
        white: '#fff',
        black: '#fafafa',
        gray: '#898A8C',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    container: {
      center: true,
      padding: { DEFAULT: '2rem', lg: '8rem' },
      screens: {
        '2xl': '1000px',
      },
    },
  },
  plugins: [require('daisyui')],
};
export default config;
