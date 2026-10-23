import { ArrowUp } from 'lucide-react'
import ScrambleText from './fx/ScrambleText.jsx'
import { buttonClass, LABEL_CLASS } from './ui.js'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 px-4 pt-20 pb-8 sm:px-8 xl:pl-24">
      <div className="mx-auto max-w-[96rem]">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className={LABEL_CLASS}>
              <span aria-hidden="true" className="size-1.5 bg-teal-300" />
              004 / Second opinion
            </p>
            <p className="mt-5 font-display text-[clamp(2.2rem,5vw,4.75rem)] leading-[0.92] font-black tracking-[-0.03em] text-white uppercase font-stretch-semi-expanded">
              Got a message that feels off?
            </p>
            <a href="#analyze" className={`${buttonClass('primary', 'lg')} mt-8`}>
              <ScrambleText text="Scan it now" trigger="hover" duration={400} />
            </a>
          </div>
          <div className="flex flex-col justify-end gap-6 text-sm text-pretty text-navy-300 lg:col-span-4 lg:col-start-9">
            <p>
              Sentinel gives an automated risk estimate, not financial or legal advice. Always verify an investment
              with your financial regulator before sending money.
            </p>
            <a
              href="#top"
              className="inline-flex w-fit items-center gap-2 rounded-sm font-mono text-[11px] tracking-[0.2em] text-navy-100 uppercase hover:text-teal-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
            >
              Back to top <ArrowUp className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="text-outline mt-20 font-display text-[16.5vw] leading-[0.8] font-black tracking-[-0.05em] uppercase select-none xl:text-[15vw]"
        >
          Sentinel
        </p>

        <div className={`${LABEL_CLASS} mt-8 flex-wrap justify-between gap-y-2 border-t border-white/10 pt-6`}>
          <span>© {YEAR} Sentinel</span>
          <span>Investment scam detection</span>
        </div>
      </div>
    </footer>
  )
}
