import { useEffect, useRef, useState } from 'react'

/**
 * Returns [ref, inView]. inView turns true once the element scrolls into view
 * (and stays true when `once`). Without IntersectionObserver it's true at once.
 */
export function useInView({ once = true, rootMargin = '0px 0px -12% 0px' } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [once, rootMargin])

  return [ref, inView]
}
