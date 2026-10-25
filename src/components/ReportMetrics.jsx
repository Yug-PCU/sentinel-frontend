import { SEVERITY_LABELS } from '../lib/risk.js'
import { getRiskTone } from './riskTones.js'

function Tile({ label, value, detail, title }) {
  return (
    <div className="min-w-0 bg-navy-900 p-4">
      <dt className="font-mono text-[11px] tracking-[0.14em] text-navy-300 uppercase">{label}</dt>
      <dd title={title} className="mt-2 truncate text-lg font-semibold text-white tabular-nums">
        {value}
      </dd>
      <dd className="mt-0.5 truncate text-xs text-navy-300">{detail}</dd>
    </div>
  )
}

/** Headline numbers for a report: findings, top severity, evidence coverage, and the link. */
export default function ReportMetrics({ counts, total, highest, evidence, host }) {
  const serious = counts.critical + counts.high
  const HighestIcon = getRiskTone(highest).icon

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
      <Tile
        label="Warning signs"
        value={total}
        detail={total === 0 ? 'None detected' : `${serious} critical or high`}
      />
      <Tile
        label="Top severity"
        value={
          highest ? (
            <span className="flex items-center gap-1.5">
              <HighestIcon className={`size-4 shrink-0 ${getRiskTone(highest).text}`} aria-hidden="true" />
              {SEVERITY_LABELS[highest]}
            </span>
          ) : (
            'None'
          )
        }
        detail={highest ? `${counts[highest]} at this level` : 'No rated findings'}
      />
      <Tile
        label="Evidence"
        value={evidence.total === 0 ? 'None' : `${evidence.located} / ${evidence.total}`}
        detail={evidence.total === 0 ? 'No quotes returned' : 'Found in the message'}
      />
      <Tile
        label="Link"
        value={host ?? 'None'}
        title={host ?? undefined}
        detail={host ? 'Included in the scan' : 'Message text only'}
      />
    </dl>
  )
}
