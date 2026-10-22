import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView } from '../../hooks/useInView.js'
import { useReducedMotion } from '../../hooks/useMediaQuery.js'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>'

/**
 * Text that "decodes" from random glyphs into place, left to right.
 * trigger: "view" (when it scrolls into view), "hover" (when the surrounding
 * link or button is hovered or focused), or "both".
 * Screen readers and tests always get the real text; the animated copy is aria-hidden.
 */
export default function ScrambleText({ text, as: Tag = 'span', trigger = 'view', duration = 700, className = '', ...rest }) {
  const reduceMotion = useReducedMotion()
  const [ref, inView] = useInView()
  const [display, setDisplay] = useState(text)
  const frameRef = useRef(0)

  // Restart the animation; the start time is read inside the first frame.
  const run = useCallback(() => {
    if (reduceMotion) return
    cancelAnimationFrame(frameRef.current)
    let start = 0
    const step = (now) => {
      if (!start) start = now
      const progress = Math.min(1, (now - start) / duration)
      const settled = Math.floor(progress * text.length)
      let next = text.slice(0, settled)
      for (let index = settled; index < text.length; index += 1) {
        const char = text[index]
        next += char === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setDisplay(next)
      if (progress < 1) frameRef.current = requestAnimationFrame(step)
    }
    frameRef.current = requestAnimationFrame(step)
  }, [reduceMotion, duration, text])

  useEffect(() => {
    if (trigger !== 'hover' && inView) run()
  }, [inView, trigger, run])

  useEffect(() => {
    if (trigger === 'view') return undefined
    const target = ref.current?.closest('a, button') ?? ref.current
    if (!target) return undefined
    target.addEventListener('pointerenter', run)
    target.addEventListener('focus', run)
    return () => {
      target.removeEventListener('pointerenter', run)
      target.removeEventListener('focus', run)
    }
  }, [trigger, ref, run])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  return (
    <Tag ref={ref} className={className} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{reduceMotion ? text : display}</span>
    </Tag>
  )
}
