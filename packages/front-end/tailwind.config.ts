import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  theme: {
    fontFamily: {
      serif: ['PlusJakartaSans', 'serif'], // heading font; translates to Tailwind class 'font-sans'
      sans: ['Inter', 'sans-serif'], // body font; translates to Tailwind class 'font-serif'
    },
    extend: {
      colors: {
        // `primaryCol` used by NuxtUI for the global `base` color: see `app.config.ts`
        primaryCol: {
          '50': '#f3f3ff',
          '100': '#eae8ff',
          '200': '#d7d5ff',
          '300': '#b8b2ff',
          '400': '#9687fe',
          '500': '#5524e0',
          '600': '#6133f4',
          '700': '#5524e0',
          '800': '#451bbc',
          '900': '#3a1999',
          '950': '#210d68',
        },
        neutral: {
          '300': '#c2c2c2',
          '500': '#979797',
          '700': '#818181',
        },
        'primary-dark': '#451DB7',
        'primary-muted': '#eee9fc',
        'heading': '#12181f',
        'body': '#323840',
        'muted': '#818181',
        'background-dark-grey': '#e5e5e5',
        'background-grey': '#f5f5f5',
        'background-light-grey': '#f7f7f7',
        'skeleton-container': '#efefef',
        'stroke-light': '#e5e5e5',
        'stroke-medium': '#f5f5f5',
        'stroke-dark': '#f5f5f5',
        'alert-success': '#20A666',
        'alert-success-muted': '#E2FBE8',
        'alert-success-text': '#306239',
        'alert-success-dark': '#01696C',
        'alert-blue': '#1767CD',
        'alert-blue-muted': '#E8F0FA',
        'alert-caution': '#BC9A15',
        'alert-caution-muted': '#FEF7D9',
        'alert': '#EF5C45',
        'alert-danger': '#EF5C45',
        'alert-danger-dark': '#CC2525',
        'alert-danger-muted': '#FDEFEC',
      },
    },
  },
};
