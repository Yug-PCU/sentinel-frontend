// Shared Tailwind class sets.
const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 font-mono font-bold tracking-[0.12em] uppercase whitespace-nowrap transition-colors disabled:cursor-not-allowed'

const BUTTON_VARIANTS = {
  // Chamfered HUD tab. The focus outline sits inside because clip-path would cut it off.
  primary:
    'chamfer bg-teal-400 text-navy-950 hover:bg-teal-300 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-navy-950 disabled:bg-teal-400/50',
  secondary:
    'rounded-full border border-navy-400 bg-navy-900/60 text-navy-50 hover:border-teal-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:opacity-50',
  ghost:
    'rounded-full text-navy-200 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-navy-200',
}

const BUTTON_SIZES = {
  md: 'px-5 py-3 text-xs',
  lg: 'px-6 py-4 text-[13px]',
}

export function buttonClass(variant = 'primary', size = 'md') {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}`
}

/** HUD panel: rounded, hairline border, translucent navy. Pair with <Corners />. */
export const CARD_CLASS = 'relative rounded-[22px] border border-white/10 bg-navy-900/75 shadow-2xl shadow-black/30'

export const ICON_TILE_CLASS =
  'grid shrink-0 place-items-center rounded-xl bg-teal-400/10 text-teal-300 ring-1 ring-teal-400/20'

/** Small uppercase monospace label, e.g. "■ 001 / Analyze". */
export const LABEL_CLASS = 'flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-navy-300 uppercase'
