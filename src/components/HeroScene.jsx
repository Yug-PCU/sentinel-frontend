import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useMediaQuery.js'

function supportsWebGL() {
  return typeof window !== 'undefined' && 'WebGLRenderingContext' in window
}

/**
 * Hosts the 3D radar. three.js is downloaded only here, after the page renders,
 * so it never delays the analyzer. Without WebGL (or if it fails) a static radar
 * drawing stands in. With reduced motion the scene renders one still frame.
 */
export default function HeroScene() {
  const containerRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const [status, setStatus] = useState(() => (supportsWebGL() ? 'loading' : 'fallback'))

  useEffect(() => {
    const container = containerRef.current
    if (!container || !supportsWebGL()) return undefined
    let scene = null
    let cancelled = false
    import('./scene/RadarScene.js')
      .then(({ RadarScene }) => {
        if (cancelled) return
        scene = new RadarScene(container, { animate: !reduceMotion })
        setStatus('ready')
      })
      .catch((error) => {
        console.warn('3D scene unavailable, showing the static version instead.', error)
        if (!cancelled) setStatus('fallback')
      })
    return () => {
      cancelled = true
      scene?.dispose()
    }
  }, [reduceMotion])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 transition-opacity duration-1000 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
    >
      {status === 'fallback' && <StaticRadar />}
    </div>
  )
}

function StaticRadar() {
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full opacity-100" aria-hidden="true">
      <g fill="none" stroke="#2dd4bf" strokeOpacity="0.25">
        {[40, 80, 120, 160].map((radius) => (
          <ellipse key={radius} cx="200" cy="190" rx={radius * 1.4} ry={radius * 0.35} />
        ))}
      </g>
      <path d="M200 190 L420 150 A 230 60 0 0 0 330 140 Z" fill="#2dd4bf" fillOpacity="0.12" />
      {[
        [120, 120],
        [250, 90],
        [310, 130],
      ].map(([x, y]) => (
        <path key={x} d={`M${x} ${y - 14} l10 14 l-10 14 l-10 -14 Z`} fill="#d03b3b" />
      ))}
    </svg>
  )
}
