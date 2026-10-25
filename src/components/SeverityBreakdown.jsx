import { SEVERITY_LABELS } from '../lib/risk.js'
import { SEVERITY_ORDER } from '../lib/report.js'
import { getRiskTone } from './riskTones.js'

const ROWS = [
  ...SEVERITY_ORDER.map((key) => ({ key, label: SEVERITY_LABELS[key], tone: getRiskTone(key) })),
  { key: 'unrated', label: 'Unrated', tone: getRiskTone(null) },
]

/**
 * Share of warning signs at each severity: a stacked bar (decorative) plus a
 * legend that lists every count, so the numbers never depend on color.
 */
export default function SeverityBreakdown({ counts, total }) {
  const rows = ROWS.filter(({ key }) => counts[key] > 0)

  return (
    <div>
      <div aria-hidden="true" className="flex h-2.5 gap-0.5">
        {rows.map(({ key, label, tone }) => (
          <div
            key={key}
            title={`${label}: ${counts[key]}`}
            style={{ flexGrow: counts[key] }}
            className={`rounded-sm ${tone.fill}`}
          />
        ))}
      </div>
      <ul aria-label="Warning signs by severity" className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-200">
        {ROWS.filter(({ key }) => key !== 'unrated' || counts.unrated > 0).map(({ key, label, tone }) => {
          const Icon = tone.icon
          const count = counts[key]
          return (
            <li key={key} className={`flex items-center gap-1.5 ${count === 0 ? 'opacity-50' : ''}`}>
              <Icon className={`size-4 ${tone.text}`} aria-hidden="true" />
              {label}{' '}
              <span className="font-semibold text-white tabular-nums">{count}</span>
              <span className="sr-only"> of {total}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
