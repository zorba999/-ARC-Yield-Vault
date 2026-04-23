import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          bg: '#080b12',
          card: '#0f1520',
          border: '#1e2a3a',
          blue: '#3b82f6',
          'blue-light': '#60a5fa',
          green: '#22c55e',
          'green-dim': '#16a34a',
          yellow: '#eab308',
          text: '#e2e8f0',
          muted: '#64748b',
          subtle: '#1e2a3a',
        },
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(135deg, #0f1520 0%, #111827 100%)',
        'blue-glow': 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
