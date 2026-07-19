// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ['Inter', 'sans-serif'],
//         mono: ['IBM Plex Mono', 'monospace'],
//       },
//       colors: {
//         navy: {
//           900: '#0B1120',
//           800: '#111827',
//           700: '#1A2333',
//           600: '#2A3548',
//         },
//         brand: {
//           saffron: '#F5A623',
//           green: '#1E8A5F',
//         },
//         risk: {
//           low: '#22C55E',
//           medium: '#F59E0B',
//           high: '#EF4444',
//         }
//       }
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Maharashtra FDA palette
        // Deep institutional navy — top bar, nav, primary text-on-light accents
        navy: {
          900: '#0A2647', // primary header / nav background
          800: '#0F3059',
          700: '#153C6E',
          600: '#1D4E89', // hover / secondary accent (used as bg-navy-600 in existing tabs)
          500: '#2B6099',
        },
        // Ashoka saffron — CTAs, active states, the "official seal" accent
        'brand-saffron': '#FF9933',
        // Deep flag/FSSAI green — success, compliance, primary action
        'brand-green': '#1B7A3D',
        // Maharashtra state maroon — used sparingly for critical/legal emphasis
        'brand-maroon': '#7A1220',
        // Institutional red for high-risk flags (slightly deeper than default red for a govt feel)
        'risk-high': '#C0392B',
        // Warm paper background used behind cards instead of pure white
        paper: '#F6F5F1',
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans"', 'system-ui', 'sans-serif'],
        display: ['"Merriweather"', '"Noto Serif Devanagari"', 'serif'],
        devanagari: ['"Noto Sans Devanagari"', '"Noto Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'gov-card': '0 1px 2px rgba(10,38,71,0.06), 0 4px 16px rgba(10,38,71,0.08)',
      },
      animation: {
        'chakra-spin': 'chakraSpin 6s linear infinite',
        'tricolor-sweep': 'tricolorSweep 2.4s ease-in-out infinite',
      },
      keyframes: {
        chakraSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        tricolorSweep: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
