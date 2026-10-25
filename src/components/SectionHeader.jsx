import { LABEL_CLASS } from './ui.js'

export default function SectionHeader({ id, eyebrow, title, children }) {
  return (
    <div className="max-w-3xl">
      <p className={LABEL_CLASS}>
        <span aria-hidden="true" className="size-1.5 shrink-0 bg-teal-300" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
        {title}
      </h2>
      {children && <div className="mt-3 text-pretty text-navy-200">{children}</div>}
    </div>
  )
}
