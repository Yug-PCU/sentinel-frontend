import { useCallback, useSyncExternalStore } from 'react'

/** Live result of a CSS media query. False where matchMedia isn't available. */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia?.(query)
      list?.addEventListener('change', onChange)
      return () => list?.removeEventListener('change', onChange)
    },
    [query],
  )
  const getSnapshot = () => window.matchMedia?.(query).matches ?? false
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

