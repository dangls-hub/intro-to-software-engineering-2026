/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    // Disabled: the existing liquid-glass design system in index.css handles
    // the CSS base reset. Enabling preflight would override those styles.
    preflight: false,
  },

  theme: {
    extend: {
      // ── Color palette ──────────────────────────────
      // Named tokens derived from the AssoTech Pride design system.
      // Dark-mode semantic tokens use CSS custom properties so they
      // respond to [data-theme] attribute without JS.
      colors: {
        // Raw brand colors (always fixed, theme-independent)
        pm: {
          teal:        '#0b1f28',
          'teal-mid':  '#0d2534',
          'teal-dark': '#091a22',
          beige:       '#f8f5f0',
          'beige-warm':'#fdf9f3',
          gold:        '#c9a96e',
          'gold-light':'#d4b47a',
          'gold-bright':'#f0c040',
          'gold-dark': '#8b6c3e',
        },
        // Semantic tokens that resolve to CSS custom properties
        // so dark/light theme switching works automatically
        accent:  'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger:  'var(--danger)',
      },

      // ── Typography ─────────────────────────────────
      fontFamily: {
        // font-serif → Playfair Display (luxury headings)
        serif: ["'Playfair Display'", 'Georgia', 'serif'],
        // font-sans / font-body → Inter (data, tables, body text)
        sans: ["'Inter'", 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        body: ["'Inter'", 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        // font-display → alias for serif (legacy compat)
        display: ["'Playfair Display'", 'Georgia', 'serif'],
      },

      // ── Radius ─────────────────────────────────────
      // Mirrors the --radius-* CSS variables so components can use
      // rounded-sm, rounded-card, rounded-pill etc. in Tailwind
      borderRadius: {
        xs:   '6px',
        sm:   '10px',
        md:   '14px',
        lg:   '18px',
        xl:   '22px',
        '2xl':'28px',
        card: '18px',
        pill: '999px',
      },

      // ── Shadows ────────────────────────────────────
      boxShadow: {
        'glow':        '0 0 40px rgba(201, 169, 110, 0.08)',
        'glow-lg':     '0 0 60px rgba(201, 169, 110, 0.14)',
        'card-hover':  '0 8px 32px rgba(201, 169, 110, 0.08), 0 0 0 1px rgba(201, 169, 110, 0.14)',
        'premium':     '0 20px 56px rgba(11, 31, 40, 0.1), 0 0 0 1px rgba(201, 169, 110, 0.18)',
        'dark-card':   '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(201, 169, 110, 0.18)',
        'badge':       '0 8px 32px rgba(11, 31, 40, 0.12)',
        'badge-hover': '0 18px 52px rgba(11, 31, 40, 0.2)',
      },

      // ── Gradients ──────────────────────────────────
      backgroundImage: {
        'gradient-gold':   'linear-gradient(135deg, #c9a96e 0%, #f0c040 100%)',
        'gradient-brand':  'linear-gradient(135deg, #c9a96e 0%, #f0c040 50%, #e8a830 100%)',
        'gradient-gold-h': 'linear-gradient(90deg, transparent, #c9a96e, transparent)',
        'gradient-card-0': 'linear-gradient(135deg, rgba(201,169,110,0.18) 0%, rgba(11,31,40,0.95) 65%)',
        'gradient-card-1': 'linear-gradient(135deg, rgba(52,211,153,0.12)  0%, rgba(11,31,40,0.95) 65%)',
        'gradient-card-2': 'linear-gradient(135deg, rgba(240,192,64,0.15)  0%, rgba(11,31,40,0.95) 65%)',
      },

      // ── Easing ─────────────────────────────────────
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        out:    'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        220: '220ms',
        350: '350ms',
        400: '400ms',
      },

      // ── Spacing additions ──────────────────────────
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
      },
    },
  },

  plugins: [],
};
