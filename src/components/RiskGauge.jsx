import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useMediaQuery.js'
import { getRiskTone } from './riskTones.js'

const ARC = 'M 20 100 A 80 80 0 0 1 180 100'

function useCountUp(value, duration = 900) {
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const currentRef = useRef(0)

  useEffect(() => {
    if (reduceMotion) return undefined
    const from = currentRef.current
    let start = 0
    let frame = 0
    const step = (now) => {
      if (!start) start = now
      const progress = Math.min(1, (now - start) / duration)
      const next = Math.round(from + (value - from) * (1 - (1 - progress) ** 3))
      currentRef.current = next
      setDisplay(next)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reduceMotion])

  return reduceMotion ? value : display
}

export default function RiskGauge({ score, level, label }) {
  const value = Math.round(Math.min(100, Math.max(0, score)))
  const shown = useCountUp(value)
  const tone = getRiskTone(level)

  return (
    <div
      role="meter"
      aria-label="Risk score"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value} out of 100, ${label}`}
      className="mx-auto w-full max-w-60"
    >
      <div className="relative">
        <svg viewBox="0 0 200 110" className="block w-full" aria-hidden="true">
          <path
            d={ARC}
            pathLength={100}
            fill="none"
            strokeWidth={14}
            strokeLinecap="round"
            className={tone.track}
          />
          {value > 0 && (
            <path
              d={ARC}
              pathLength={100}
              fill="none"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray="100 100"
              style={{ strokeDashoffset: 100 - value }}
              className={`gauge-fill ${tone.stroke}`}
            />
          )}
        </svg>
        <p className="absolute inset-x-0 bottom-1 text-center text-6xl leading-none font-semibold tracking-tight text-white">
          {shown}
        </p>
      </div>
      <div className="mt-1.5 grid grid-cols-[20%_1fr_20%] text-center text-xs text-navy-300" aria-hidden="true">
        <span>0</span>
        <span>out of 100</span>
        <span>100</span>
      </div>
    </div>
  )
}
