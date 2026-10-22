import { useEffect, useRef, useState } from 'react'
import { USE_MOCK_API } from '../config.js'
import { useActiveSection, useScrollProgressVariable } from '../hooks/useScrollTracking.js'
import ScrambleText from './fx/ScrambleText.jsx'
import Logo from './Logo.jsx'
import SourceBadge from './SourceBadge.jsx'
import { buttonClass } from './ui.js'

const SECTIONS = [
  { id: 'analyze', label: 'Analyze', index: '01' },
  { id: 'how-it-works', label: 'How it works', index: '02' },
  { id: 'red-flags', label: 'Red flags', index: '03' },
]
const SECTION_IDS = ['top', ...SECTIONS.map((section) => section.id)]

/**
 * The HUD around the page: a hairline border inset from the window, a top bar
 * (menu, wordmark, section nav, mode badge, call to action), a side rail with
 * scroll progress on wide screens, and a full-screen menu.
 */
export default function Frame() {
  useScrollProgressVariable()
  const active = useActiveSection(SECTION_IDS)
  const activeIndex = SECTIONS.find((section) => section.id === active)?.index ?? '00'
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef(null)

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-2 z-40 rounded-[22px] border border-white/10 sm:inset-3" />

      <header className="fixed inset-x-2 top-2 z-50 sm:inset-x-3 sm:top-3">
        <div className="flex h-14 items-stretch rounded-t-[22px] border-b border-white/10 bg-navy-950/75 backdrop-blur-md">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="group grid w-14 shrink-0 place-items-center rounded-tl-[22px] border-r border-white/10 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-teal-300"
          >
            <span aria-hidden="true" className="relative block h-3 w-6">
              <span className={`absolute left-0 h-px w-6 bg-navy-50 transition-transform duration-300 ${menuOpen ? 'top-1.5 rotate-45' : 'top-0 group-hover:translate-x-1'}`} />
              <span className={`absolute left-0 h-px bg-navy-50 transition-[transform,width] duration-300 ${menuOpen ? 'top-1.5 w-6 -rotate-45' : 'top-3 w-4'}`} />
            </span>
          </button>

          <a href="#top" className="flex items-center gap-2.5 px-4 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-teal-300">
            <Logo className="size-7" />
            <span className="font-display text-lg font-black tracking-tight text-white uppercase font-stretch-semi-expanded">Sentinel</span>
          </a>

          <nav aria-label="Main" className="mx-auto hidden items-center gap-9 md:flex">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={active === section.id ? 'location' : undefined}
                className={`flex items-center gap-2 rounded-sm font-mono text-[11px] tracking-[0.16em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 ${
                  active === section.id ? 'text-white' : 'text-navy-300 hover:text-white'
                }`}
              >
                <span aria-hidden="true" className={`size-1.5 transition-colors ${active === section.id ? 'bg-teal-300' : 'bg-transparent'}`} />
                <ScrambleText text={section.label} trigger="hover" duration={450} />
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 pr-2 md:ml-0">
            <span className="hidden sm:inline-flex">
              <SourceBadge mock={USE_MOCK_API}>{USE_MOCK_API ? 'Mock data' : 'Live API'}</SourceBadge>
            </span>
            <a href="#analyze" className={`${buttonClass('primary')} px-4! py-2.5!`}>
              <ScrambleText text="Scan now" trigger="hover" duration={400} />
            </a>
          </div>
        </div>
      </header>

      <aside
        aria-hidden="true"
        className="pointer-events-none fixed top-[4.25rem] bottom-3 left-3 z-40 hidden w-14 flex-col items-center justify-between border-r border-white/10 py-8 xl:flex"
      >
        <span className="font-mono text-[11px] tracking-[0.2em] text-navy-300 [writing-mode:vertical-rl]">
          {activeIndex} / 03
        </span>
        <svg viewBox="0 0 40 40" className="size-9 text-teal-300" style={{ transform: 'rotate(calc(var(--scroll-progress, 0) * 360deg))' }}>
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 2v12M20 26v12M2 20h12M26 20h12" />
            <rect x="15" y="15" width="10" height="10" />
          </g>
        </svg>
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-28 w-px bg-white/10">
            <div className="absolute inset-0 origin-top bg-teal-300" style={{ transform: 'scaleY(var(--scroll-progress, 0))' }} />
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-navy-300 uppercase [writing-mode:vertical-rl]">Scroll</span>
        </div>
      </aside>

      {menuOpen && <SiteMenu active={active} onClose={() => setMenuOpen(false)} toggleRef={toggleRef} />}
    </>
  )
}

function SiteMenu({ active, onClose, toggleRef }) {
  const firstLinkRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    firstLinkRef.current?.focus()
    const toggle = toggleRef.current
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      toggle?.focus()
    }
  }, [onClose, toggleRef])

  return (
    <div
      id="site-menu"
      className="fixed inset-0 z-[45] flex flex-col justify-end overflow-y-auto bg-navy-950/95 px-6 pt-24 pb-10 backdrop-blur-xl transition-[opacity,translate] duration-500 sm:px-12 starting:-translate-y-4 starting:opacity-0"
    >
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <nav aria-label="Menu" className="relative">
        <ul className="space-y-2">
          {SECTIONS.map((section, index) => (
            <li key={section.id} className="flex items-start gap-4 border-b border-white/10 pb-2">
              <span className="mt-3 font-mono text-xs text-teal-300">{section.index}</span>
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={`#${section.id}`}
                onClick={onClose}
                aria-current={active === section.id ? 'location' : undefined}
                className="rounded-sm font-display text-[clamp(2.75rem,9vw,7rem)] leading-none font-black tracking-tight text-white uppercase transition-colors font-stretch-semi-expanded hover:text-teal-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
              >
                <ScrambleText text={section.label} trigger="both" duration={500} />
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="relative mt-10 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-[0.2em] text-navy-300 uppercase">
        <span>Sentinel / Investment scam detection</span>
        <SourceBadge mock={USE_MOCK_API}>{USE_MOCK_API ? 'Mock data' : 'Live API'}</SourceBadge>
      </div>
    </div>
  )
}
