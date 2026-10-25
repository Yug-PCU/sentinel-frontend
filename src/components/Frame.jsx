import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useActiveSection } from '../hooks/useScrollTracking.js'
import Logo from './Logo.jsx'
import { buttonClass, CONTAINER_CLASS } from './ui.js'

const SECTIONS = [
  { id: 'analyze', label: 'Analyze' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'red-flags', label: 'Red flags' },
]
const SECTION_IDS = ['top', ...SECTIONS.map((section) => section.id)]

const LINK_FOCUS = 'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300'

export default function Frame() {
  const active = useActiveSection(SECTION_IDS)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const linkClass = (id) =>
    `${LINK_FOCUS} text-sm font-medium transition-colors ${active === id ? 'text-white' : 'text-navy-300 hover:text-white'}`

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-navy-950/80 backdrop-blur-md">
      <div className={`${CONTAINER_CLASS} flex h-16 items-center gap-8`}>
        <a href="#top" className={`${LINK_FOCUS} flex items-center gap-2.5`}>
          <Logo className="size-7" />
          <span className="font-display text-lg font-extrabold tracking-tight text-white">Sentinel</span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={active === section.id ? 'location' : undefined}
              className={linkClass(section.id)}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a href="#analyze" className={`${buttonClass('primary')} hidden sm:inline-flex`}>
            Scan a message
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className={`${buttonClass('ghost')} px-2.5! md:hidden`}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="site-menu" aria-label="Menu" className="border-t border-white/10 md:hidden">
          <ul className={`${CONTAINER_CLASS} py-3`}>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active === section.id ? 'location' : undefined}
                  className={`${linkClass(section.id)} block py-2.5 text-base`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
