import { ClipboardCheck, ClipboardPaste, ScanSearch } from 'lucide-react'
import Reveal from './fx/Reveal.jsx'
import SectionHeader from './SectionHeader.jsx'
import { buttonClass } from './ui.js'

const STEPS = [
  {
    icon: ClipboardPaste,
    title: 'Paste the message',
    text: 'Copy the text, email, or DM exactly as you received it, plus the link if there is one.',
  },
  {
    icon: ScanSearch,
    title: 'Sentinel analyzes it',
    text: 'The message and link are checked for patterns that show up again and again in investment scams.',
  },
  {
    icon: ClipboardCheck,
    title: 'Review your risk report',
    text: 'See a 0–100 risk score, a risk category, and a plain-language explanation of every warning sign.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 px-4 py-24 sm:px-8 xl:pl-24">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader id="how-heading" index="002" eyebrow="How it works" title="Doubt in, clarity out" />

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-9">
            <p className="font-display text-[clamp(2rem,4.8vw,4.75rem)] leading-[1.02] font-medium tracking-[-0.03em] text-pretty text-white">
              <span className="inline-block w-[12%]" aria-hidden="true" />A suspicious message goes in.{' '}
              <span className="text-navy-300">A plain-language risk report comes out.</span>
            </p>
          </Reveal>
          <Reveal delay={150} className="flex items-end lg:col-span-3">
            <a href="#analyze" className={buttonClass('secondary')}>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-teal-300" />
              Start a scan
            </a>
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <Reveal as="li" key={title} delay={index * 120} className="group bg-navy-950 p-7 transition-colors hover:bg-navy-900 sm:p-9">
              <div className="flex items-start justify-between">
                <span
                  aria-hidden="true"
                  className="text-outline font-display text-7xl leading-none font-black transition-colors font-stretch-expanded group-hover:text-teal-300/90"
                >
                  0{index + 1}
                </span>
                <Icon className="size-6 text-teal-300" aria-hidden="true" />
              </div>
              <h3 className="mt-10 text-lg font-semibold text-white">
                <span className="sr-only">Step {index + 1}: </span>
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-200">{text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
