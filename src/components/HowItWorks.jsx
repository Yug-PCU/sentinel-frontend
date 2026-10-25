import { ClipboardCheck, ClipboardPaste, ScanSearch } from 'lucide-react'
import Reveal from './fx/Reveal.jsx'
import SectionHeader from './SectionHeader.jsx'
import { CONTAINER_CLASS } from './ui.js'

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
    title: 'Review the evidence',
    text: 'Get a 0–100 risk score, each warning sign ranked by severity, and the exact phrases that triggered it.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className={`${CONTAINER_CLASS} scroll-mt-20 py-20`}>
      <SectionHeader id="how-heading" eyebrow="How it works" title="A suspicious message in, an evidence-backed report out" />

      <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <Reveal as="li" key={title} delay={index * 100} className="bg-navy-950 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span aria-hidden="true" className="font-mono text-xs font-semibold text-teal-300">
                Step 0{index + 1}
              </span>
              <Icon className="size-5 text-teal-300" aria-hidden="true" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-white">
              <span className="sr-only">Step {index + 1}: </span>
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-200">{text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
