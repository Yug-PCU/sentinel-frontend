import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery.js'

const INTERACTIVE = 'a, button, input, textarea, summary, [data-cursor]'

export default function Cursor() {
  const finePointer = useFinePointer()
  const reduceMotion = useReducedMotion()
  const enabled = finePointer && !reduceMotion
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined
    const target = { x: -100, y: -100 }
    const dot = { x: -100, y: -100 }
    const ring = { x: -100, y: -100 }
    let hovering = false
    let frame = 0

    const onMove = (event) => {
      target.x = event.clientX
      target.y = event.clientY
      hovering = Boolean(event.target.closest?.(INTERACTIVE))
    }
    const tick = () => {
      dot.x += (target.x - dot.x) * 0.35
      dot.y += (target.y - dot.y) * 0.35
      ring.x += (target.x - ring.x) * 0.14
      ring.y += (target.y - ring.y) * 0.14
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) scale(${hovering ? 1.8 : 1})`
        ringRef.current.style.opacity = hovering ? '0.9' : '0.5'
      }
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    frame = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <div ref={ringRef} className="absolute top-0 left-0 -mt-5 -ml-5 size-10 rounded-full border border-teal-300 transition-[scale,opacity] duration-300" />
      <div ref={dotRef} className="absolute top-0 left-0 -mt-1 -ml-1 size-2 rounded-full bg-teal-300" />
    </div>
  )
}
