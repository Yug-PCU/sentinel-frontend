import { CircleCheck, TriangleAlert } from 'lucide-react'
import { SEVERITY_LABELS } from '../lib/risk.js'
import { getRiskTone } from './riskTones.js'

export default function WarningList({ warnings }) {
  if (warnings.length === 0) {
    return (
      <div className="mt-3 flex gap-3 rounded-xl border border-white/5 bg-navy-900/60 p-4">
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
        <li key={warning.id} className="flex gap-3 rounded-xl border border-white/5 bg-navy-900/60 p-4">
          <TriangleAlert
            className={`mt-0.5 size-5 shrink-0 ${getRiskTone(warning.severity).text}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="font-medium text-white">{warning.title}</p>
              {warning.severity && (
                <span className="text-xs font-medium text-navy-200">
                  {SEVERITY_LABELS[warning.severity]} severity
                </span>
              )}
            </div>
            {warning.description && (
              <p className="mt-1 text-sm leading-relaxed text-pretty text-navy-200">{warning.description}</p>
            )}
            {warning.evidence.length > 0 && (
              <ul className="mt-2 space-y-1">
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
