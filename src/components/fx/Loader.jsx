import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useMediaQuery.js'

const SEEN_KEY = 'sentinel:intro-seen'
const COUNT_MS = 1100
const EXIT_MS = 800

function introSeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the intro just plays again.
  }
}

/**
 * Intro overlay: a percentage counter that runs to 100 once fonts are ready, then
 * a skewed panel wipes up to reveal the page. Plays once per browser session and
 * never for reduced motion.
 */
export default function Loader() {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState(() => (introSeen() ? 'done' : 'counting'))
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    if (phase !== 'counting') return undefined
    let frame = 0
    let cancelled = false
    const fontsReady = document.fonts?.ready ?? Promise.resolve()

    fontsReady.then(() => {
      if (cancelled) return
      let start = 0
      const step = (now) => {
        if (!start) start = now
        const progress = Math.min(1, (now - start) / COUNT_MS)
        setPercent(Math.round(100 * (1 - (1 - progress) ** 3)))
        if (progress < 1) {
          frame = requestAnimationFrame(step)
          return
        }
        markIntroSeen()
        setPhase('leaving')
      }
      frame = requestAnimationFrame(step)
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [phase])

  // Unmount once the wipe has finished.
  useEffect(() => {
    if (phase !== 'leaving') return undefined
    const timer = setTimeout(() => setPhase('done'), EXIT_MS)
    return () => clearTimeout(timer)
  }, [phase])

  if (reduceMotion || phase === 'done') return null
  const leaving = phase === 'leaving'

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] origin-top-left bg-navy-950 transition-[translate,skew] duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        leaving ? '-translate-y-[115%] -skew-y-6' : ''
      }`}
    >
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-x-6 top-6 flex items-center justify-between font-mono text-xs tracking-[0.2em] text-navy-300 uppercase sm:inset-x-10 sm:top-10">
        <span>Sentinel</span>
        <span>Initializing scanner</span>
      </div>
      <div className="absolute inset-x-6 bottom-6 sm:inset-x-10 sm:bottom-10">
        <div className="h-px w-full bg-white/10">
          <div className="h-px origin-left bg-teal-300" style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
        <p className="mt-4 font-display text-[clamp(5rem,22vw,16rem)] leading-[0.8] font-black tracking-tighter text-white tabular-nums font-stretch-expanded">
          {String(percent).padStart(3, '0')}
        </p>
      </div>
    </div>
  )
}
