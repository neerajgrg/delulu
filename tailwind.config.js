/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Dynamic Theme Surfaces & Tokens (RGB with Tailwind alpha support) ──
        'base':        'rgb(var(--bg-base) / <alpha-value>)',
        'surface':     'rgb(var(--bg-surface) / <alpha-value>)',
        'surface-2':   'rgb(var(--bg-surface-2) / <alpha-value>)',
        'surface-3':   'rgb(var(--bg-surface-3) / <alpha-value>)',
        'surface-4':   'rgb(var(--bg-surface-4) / <alpha-value>)',
        'surface-5':   'rgb(var(--bg-surface-5) / <alpha-value>)',

        // Antigravity Blue Accent
        'accent':        'rgb(var(--accent) / <alpha-value>)',
        'accent-bright': 'rgb(var(--accent-bright) / <alpha-value>)',
        'accent-dim':    'rgb(var(--accent-dim) / <alpha-value>)',

        // Text & Hierarchy
        'ink':         'rgb(var(--text-ink) / <alpha-value>)',
        'ink-2':       'rgb(var(--text-ink-2) / <alpha-value>)',
        'ink-muted':   'rgb(var(--text-ink-muted) / <alpha-value>)',
        'ink-dim':     'rgb(var(--text-ink-dim) / <alpha-value>)',

        // Precision Hairline Borders
        'line':        'rgb(var(--border-line) / <alpha-value>)',
        'line-bright': 'rgb(var(--border-line-bright) / <alpha-value>)',

        // Semantic Accents
        'ok':          '#10b981',
        'ok-glow':     'rgba(16, 185, 129, 0.15)',
        'warn':        '#f59e0b',
        'err':         '#ef4444',
        'info':        '#3b82f6',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'Geist', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', '"Fira Code"', 'Menlo', 'monospace'],
      },
      fontSize: {
        '3xs': ['10.5px', { lineHeight: '14px', letterSpacing: '0.01em' }],
        '2xs': ['11.5px', { lineHeight: '16px', letterSpacing: '-0.005em' }],
        xs:    ['12.5px', { lineHeight: '18px', letterSpacing: '-0.01em' }],
        sm:    ['13.5px', { lineHeight: '19.5px', letterSpacing: '-0.012em' }],
        base:  ['14.5px', { lineHeight: '22px', letterSpacing: '-0.012em' }],
        md:    ['16px',   { lineHeight: '24px', letterSpacing: '-0.015em' }],
        lg:    ['18px',   { lineHeight: '26px', letterSpacing: '-0.02em' }],
        xl:    ['21px',   { lineHeight: '28px', letterSpacing: '-0.025em' }],
        '2xl': ['26px',   { lineHeight: '32px', letterSpacing: '-0.03em' }],
        '3xl': ['32px',   { lineHeight: '38px', letterSpacing: '-0.035em' }],
        '4xl': ['38px',   { lineHeight: '44px', letterSpacing: '-0.04em' }],
      },
      letterSpacing: {
        tighter: '-0.035em',
        tight: '-0.02em',
        normal: '-0.01em',
        wide: '0.02em',
        wider: '0.05em',
        widest: '0.08em',
      },
      borderRadius: {
        sm:  '4px',
        DEFAULT: '6px',
        md:  '8px',
        lg:  '10px',
        xl:  '14px',
        '2xl': '18px',
      },
      boxShadow: {
        glow:        '0 0 24px rgba(37, 99, 235, 0.25)',
        'glow-sm':   '0 0 12px rgba(37, 99, 235, 0.18)',
        card:        '0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':'0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
        modal:       '0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.09)',
        panel:       '1px 0 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-in':   'fadeIn 0.12s ease-out',
        'slide-up':  'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in':  'slideIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(6px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideIn:   { from: { transform: 'translateX(-4px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.8', transform: 'scale(1.03)' },
        },
      },
    },
  },
  plugins: [],
};
