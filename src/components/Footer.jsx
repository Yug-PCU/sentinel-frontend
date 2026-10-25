import { ArrowUp } from 'lucide-react'
import Logo from './Logo.jsx'
import { buttonClass, CONTAINER_CLASS } from './ui.js'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-900/40">
      <div className={`${CONTAINER_CLASS} py-14`}>
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-navy-900/75 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-white">Got a message that feels off?</p>
            <p className="mt-1 text-sm text-navy-200">Get a second opinion before you reply, click, or pay.</p>
          </div>
          <a href="#analyze" className={`${buttonClass('primary', 'lg')} shrink-0`}>
            Scan it now
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-6 text-sm text-navy-300 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="size-6" />
            <span className="font-display font-extrabold text-white">Sentinel</span>
            <span>© {YEAR}</span>
          </div>
          <p className="max-w-xl text-pretty">
            Sentinel gives an automated risk estimate, not financial or legal advice. Always verify an investment with
            your financial regulator before sending money.
          </p>
          <a
            href="#top"
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-sm text-navy-100 hover:text-teal-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
          >
            Back to top <ArrowUp className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
