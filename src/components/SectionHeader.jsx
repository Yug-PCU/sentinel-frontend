import ScrambleText from './fx/ScrambleText.jsx'
import { LABEL_CLASS } from './ui.js'

/** Grid-lined section header: index label, giant decoding title, optional side note. */
export default function SectionHeader({ id, index, eyebrow, title, children }) {
  return (
    <div className="grid border-y border-white/10 lg:grid-cols-12">
      <p className={`${LABEL_CLASS} border-b border-white/10 py-4 lg:col-span-2 lg:items-start lg:border-r lg:border-b-0 lg:py-8`}>
        <span aria-hidden="true" className="size-1.5 shrink-0 bg-teal-300" />
        {index} / {eyebrow}
      </p>
      <ScrambleText
        as="h2"
        id={id}
        text={title}
        duration={900}
        className="py-6 font-display text-[clamp(2.4rem,6.4vw,6.5rem)] leading-[0.88] font-black tracking-[-0.035em] text-white uppercase font-stretch-semi-expanded lg:col-span-7 lg:px-8 lg:py-8"
      />
      {children && (
        <div className="flex items-end border-t border-white/10 py-6 text-pretty text-navy-200 lg:col-span-3 lg:border-t-0 lg:border-l lg:py-8 lg:pl-8">
          {children}
        </div>
      )}
    </div>
  )
}
