import { CircleCheck } from 'lucide-react'
import { SEVERITY_LABELS } from '../lib/risk.js'
import { getRiskTone } from './riskTones.js'

function SeverityTag({ severity }) {
  const tone = getRiskTone(severity)
  const Icon = tone.icon
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium text-navy-50 ${tone.surface}`}
    >
      <Icon className={`size-3.5 ${tone.text}`} aria-hidden="true" />
      {severity ? `${SEVERITY_LABELS[severity]} severity` : 'Unrated'}
    </span>
  )
}

/** Warning signs from rankWarnings: most severe first, numbered to match the evidence highlights. */
export default function WarningList({ warnings }) {
  if (warnings.length === 0) {
    return (
      <div className="mt-3 flex gap-3 rounded-xl border border-white/5 bg-navy-950/60 p-4">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-risk-low" aria-hidden="true" />
        <div>
          <p className="font-medium text-white">No warning signs detected</p>
          <p className="mt-1 text-sm text-navy-200">
            That's a good sign, but stay careful. New scams don't always match known patterns.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ol className="mt-3 space-y-3">
      {warnings.map((warning) => (
        <li
          key={warning.id}
          id={`finding-${warning.number}`}
          className="flex scroll-mt-24 gap-4 rounded-xl border border-white/5 bg-navy-950/60 p-4 target:border-teal-400/50"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-white/5 font-mono text-xs font-semibold text-navy-100"
          >
            {String(warning.number).padStart(2, '0')}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              <p className="font-medium text-white">{warning.title}</p>
              <SeverityTag severity={warning.severity} />
            </div>
            {warning.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-navy-200">{warning.description}</p>
            )}
            {warning.evidence.length > 0 && (
              <ul aria-label="Evidence" className="mt-3 space-y-1.5">
                {warning.evidence.map((quote, index) => (
                  <li
                    key={`${warning.id}-${index}`}
                    className="border-l-2 border-navy-500 pl-3 text-sm text-navy-300 italic"
                  >
                    “{quote}”
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
