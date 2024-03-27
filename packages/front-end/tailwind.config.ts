import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  theme: {
    extend: {
      mode: 'jit',
      purge: ['./public/**/*.html', './**/*.{js,ts,vue}'],
      fontFamily: {
        // TODO
        sans: ['serif'],
        heading: ['sans-serif'],
      },
      screens: {
        sm: '500px',
        md: '767px',
        lg: '1024px',
        xl: '1400px',
      },
      colors: {
        // TODO
      },
    },
  },
};
