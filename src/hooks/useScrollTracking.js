import { useEffect, useState } from 'react'

/**
 * Writes page scroll progress (0–1) to the --scroll-progress CSS variable on <html>,
 * so CSS can animate from it without re-rendering React on every frame.
 */
export function useScrollProgressVariable() {
  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    const update = () => {
      frame = 0
      const max = root.scrollHeight - window.innerHeight
      root.style.setProperty('--scroll-progress', max > 0 ? (window.scrollY / max).toFixed(4) : '0')
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
}

/** The id of the section crossing the middle of the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join(' ')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const id of key.split(' ')) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [key])

  return active
}
