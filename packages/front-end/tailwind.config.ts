import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'serif'],
        heading: ['PlusJakartaSans', 'sans-serif'],
      },
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
        'primary-dark': '#451DB7',
        'primary-muted': '#eee9fc',
        'text-heading': '#12181f',
        'text-body': '#323840',
        'text-muted': '#818181',
        'text-dark-grey': '#e5e5e5',
        'text-grey': '#f5f5f5',
        'alert-success': '#20A666',
        'alert-success-text': '#306239',
        'alert-success-dark': '#01696C',
        'alert-success-muted': '#E2FBE8',
        'alert-blue': '#1767CD',
        'alert-blue-muted': '#E8F0FA',
        'alert-caution': '#BC9A15',
        'alert-caution-muted': '#FEF7D9',
        'alert-danger': '#EF5C45',
        'alert-danger-dark': '#CC2525',
        'alert-danger-muted': '#FDEFEC',
      },
    },
  },
};
