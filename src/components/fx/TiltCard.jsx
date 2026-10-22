import { useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery.js'

/**
 * Card that tilts toward the pointer, with a soft glare that follows it.
 * Only on mouse/trackpad devices and when motion is allowed.
 */
export default function TiltCard({ as: Tag = 'div', className = '', children, maxTilt = 7, ...rest }) {
  const finePointer = useFinePointer()
  const reduceMotion = useReducedMotion()
  const enabled = finePointer && !reduceMotion
  const ref = useRef(null)

  function handleMove(event) {
    const element = ref.current
    if (!enabled || !element) return
    const box = element.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    element.style.setProperty('--rx', `${(0.5 - y) * maxTilt * 2}deg`)
    element.style.setProperty('--ry', `${(x - 0.5) * maxTilt * 2}deg`)
    element.style.setProperty('--mx', `${x * 100}%`)
    element.style.setProperty('--my', `${y * 100}%`)
  }

  function handleLeave() {
    const element = ref.current
    if (!element) return
    element.style.setProperty('--rx', '0deg')
    element.style.setProperty('--ry', '0deg')
  }

  return (
    <Tag
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`group/tilt relative transition-transform duration-300 ease-out [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] ${className}`}
      {...rest}
    >
      {enabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: 'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgb(70 236 213 / 0.10), transparent 45%)' }}
        />
      )}
      {children}
    </Tag>
  )
}
