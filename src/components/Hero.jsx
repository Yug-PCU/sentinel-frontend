import { ArrowDown, Check } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import HeroScene from './HeroScene.jsx'
import { buttonClass, CONTAINER_CLASS, LABEL_CLASS } from './ui.js'

const FEATURES = ['0–100 risk score and verdict', 'Warning signs ranked by severity', 'Evidence highlighted in the message']

export default function Hero() {
  // The radar only shows beside the copy on wide screens, so skip loading three.js elsewhere.
  const isWide = useMediaQuery('(min-width: 64rem)')

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden pt-28 pb-12 lg:pt-32">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
      <div className={`${CONTAINER_CLASS} relative grid items-center gap-10 lg:grid-cols-12`}>
        <div className="lg:col-span-7">
          <p className={LABEL_CLASS}>
            <span aria-hidden="true" className="size-1.5 bg-teal-300" />
            Investment scam detection
          </p>
          <h1
            id="hero-heading"
            className="mt-5 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-white sm:text-5xl xl:text-6xl"
          >
            Spot the scam <span className="text-teal-300">before it spots you.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-navy-200">
            Paste a text, DM, email, or social post you received, plus its link if it has one. Sentinel scores the
            scam risk, explains every warning sign, and shows you the exact phrases that gave it away.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#analyze" className={buttonClass('primary', 'lg')}>
              Analyze a message
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
            <a href="#red-flags" className={buttonClass('secondary', 'lg')}>
              Learn the red flags
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-200">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="size-4 text-teal-300" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative hidden h-[24rem] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_115%,rgb(45_212_191/0.22),transparent_60%),linear-gradient(180deg,#081529,#040b18)] lg:col-span-5 lg:block xl:h-[28rem]">
          {isWide && <HeroScene />}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
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
          <figcaption className="sr-only">
            Decorative 3D illustration: coins and red flags floating over a radar whose sweep highlights the red flags.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
