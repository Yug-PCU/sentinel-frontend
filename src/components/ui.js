// Shared Tailwind class sets.
const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-not-allowed'

const BUTTON_VARIANTS = {
  primary: 'bg-teal-400 text-navy-950 hover:bg-teal-300 disabled:bg-teal-400/50',
  secondary: 'border border-navy-400 bg-navy-900/60 text-navy-50 hover:border-teal-300 hover:text-white disabled:opacity-50',
  ghost:
    'text-navy-200 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-navy-200',
}

const BUTTON_SIZES = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
}

export function buttonClass(variant = 'primary', size = 'md') {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}`
}

/** Panel: rounded, hairline border, translucent navy. */
export const CARD_CLASS = 'relative rounded-2xl border border-white/10 bg-navy-900/75 shadow-xl shadow-black/20'

export const ICON_TILE_CLASS =
  'grid shrink-0 place-items-center rounded-xl bg-teal-400/10 text-teal-300 ring-1 ring-teal-400/20'

/** Small uppercase monospace label, e.g. "■ Analyze". */
export const LABEL_CLASS = 'flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-navy-300 uppercase'

/** Horizontal page gutter and max width shared by every section. */
export const CONTAINER_CLASS = 'mx-auto max-w-7xl px-4 sm:px-8'
