import { FlaskConical } from 'lucide-react'

// Pill that says whether data is mock (violet, flask icon) or from the live API (teal dot).
export default function SourceBadge({ mock, children }) {
  if (mock) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/35 bg-violet-400/10 px-2.5 py-0.5 text-xs font-semibold text-violet-100">
        <FlaskConical className="size-3.5 text-violet-300" aria-hidden="true" />
        {children}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-0.5 text-xs font-semibold text-teal-100">
      <span className="size-1.5 rounded-full bg-teal-300" aria-hidden="true" />
      {children}
    </span>
  )
}
