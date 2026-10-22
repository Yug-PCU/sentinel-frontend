import { ArrowDownRight } from 'lucide-react'
import ScrambleText from './fx/ScrambleText.jsx'
import HeroScene from './HeroScene.jsx'
import { buttonClass, LABEL_CLASS } from './ui.js'

const FEATURES = ['Risk score from 0 to 100', 'Every warning sign explained', 'Checks the link too']

function Plus({ className = '' }) {
  return (
    <svg viewBox="0 0 12 12" className={`size-3 text-navy-300 ${className}`} aria-hidden="true">
      <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative px-4 pt-24 sm:px-8 sm:pt-28 xl:pl-24">
      <div className="mx-auto max-w-[96rem]">
        <div className={`${LABEL_CLASS} justify-between`}>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-1.5 bg-teal-300" />
            000 / Investment scam detection
          </span>
          <span className="hidden sm:block">Paste · Scan · Understand</span>
        </div>

        <h1
          id="hero-heading"
          className="mt-8 font-display text-[clamp(2.3rem,8.4vw,9.75rem)] leading-[0.86] font-black tracking-[-0.04em] text-white uppercase font-stretch-semi-expanded"
        >
          <span className="sr-only">Spot the scam before it costs you.</span>
          <span aria-hidden="true" className="block">
            <ScrambleText text="Spot the scam" duration={900} />
          </span>
          <span aria-hidden="true" className="flex items-start gap-3 pl-[9vw]">
            <span className="mt-[0.5em] font-mono text-[11px] font-medium tracking-normal text-teal-300 sm:text-xs">[01]</span>
            <ScrambleText text="before it" duration={900} />
          </span>
          <span aria-hidden="true" className="block text-teal-300">
            <ScrambleText text="costs you." duration={1000} />
          </span>
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <ul className="space-y-3 font-mono text-[11px] tracking-[0.16em] text-navy-300 uppercase lg:col-span-4">
            {FEATURES.map((feature, index) => (
              <li key={feature} className="flex items-center gap-3 border-b border-white/10 pb-3">
                <span className="text-teal-300">0{index + 1}</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-lg leading-relaxed text-pretty text-navy-200 sm:text-xl">
              Paste a message you received, whether it's a text, DM, email, or social post. Sentinel rates its scam
              risk from 0 to 100 and explains each warning sign in plain language.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#analyze" className={buttonClass('primary', 'lg')}>
                <ScrambleText text="Analyze a message" trigger="hover" duration={500} />
                <ArrowDownRight className="size-4" aria-hidden="true" />
              </a>
              <a href="#red-flags" className={buttonClass('secondary', 'lg')}>
                <span aria-hidden="true" className="size-1.5 rounded-full bg-teal-300" />
                <ScrambleText text="Learn the red flags" trigger="hover" duration={500} />
              </a>
            </div>
          </div>
        </div>

        <figure className="relative mt-14 h-[56vh] min-h-[22rem] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_115%,rgb(45_212_191/0.22),transparent_60%),linear-gradient(180deg,#081529,#040b18)] lg:h-[76vh]">
          <HeroScene />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <span className={LABEL_CLASS}>
                <span className="size-1.5 animate-blink bg-teal-300" />
                Scam radar
              </span>
              <ul className="space-y-2 text-right font-mono text-[11px] tracking-[0.16em] text-navy-200 uppercase">
                <li className="flex items-center justify-end gap-2">
                  Money <span className="size-2.5 rounded-full bg-teal-300" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  Red flag <span className="size-2.5 rotate-45 bg-risk-critical" />
                </li>
              </ul>
            </div>
            <p className="hidden font-mono text-[11px] tracking-[0.16em] text-navy-300 uppercase [@media(hover:hover)]:block">
              Move your cursor to disturb the field
            </p>
          </div>
          <figcaption className="sr-only">
            Decorative 3D illustration: coins and red flags floating over a radar whose sweep highlights the red flags.
          </figcaption>
        </figure>

        <div aria-hidden="true" className="flex items-center justify-between py-5 font-mono text-[11px] tracking-[0.2em] text-navy-300 uppercase">
          <Plus />
          <Plus className="hidden sm:block" />
          <span>Scroll to analyze</span>
          <Plus className="hidden sm:block" />
          <Plus />
        </div>
      </div>
    </section>
  )
}
