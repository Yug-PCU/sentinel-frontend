import { Check, Info } from 'lucide-react'
import { getRiskLevelInfo } from '../lib/risk.js'
import RiskBadge from './RiskBadge.jsx'
import RiskGauge from './RiskGauge.jsx'
import WarningList from './WarningList.jsx'
import { buttonClass } from './ui.js'

export default function RiskReport({ result, isStale, onReset }) {
  const { riskScore, riskLevel, warnings } = result
  const info = getRiskLevelInfo(riskLevel)

  return (
    <div className="space-y-6">
      {isStale && (
        <div className="flex items-start gap-3 rounded-xl border border-teal-400/25 bg-teal-400/5 p-3 text-sm text-navy-100">
          <Info className="mt-0.5 size-4 shrink-0 text-teal-300" aria-hidden="true" />
          <p>You've changed the message or link since this report. Analyze again to update it.</p>
        </div>
      )}

      <div className="grid items-center gap-6 rounded-2xl border border-white/5 bg-navy-900/60 p-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:p-6">
        <RiskGauge score={riskScore} level={riskLevel} label={info.label} />
        <div className="text-center sm:text-left">
          <RiskBadge level={riskLevel} />
          <p className="mt-3 text-pretty text-navy-100">{info.summary}</p>
        </div>
      </div>

      <section aria-labelledby="warnings-heading">
        <h4 id="warnings-heading" className="flex items-center gap-2 font-semibold text-white">
          Warning signs
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-navy-200">
            {warnings.length}
          </span>
        </h4>
        <WarningList warnings={warnings} />
      </section>

      <section aria-labelledby="advice-heading">
        <h4 id="advice-heading" className="font-semibold text-white">
          What to do next
        </h4>
        <ul className="mt-3 space-y-2.5">
          {info.advice.map((tip) => (
            <li key={tip} className="flex gap-3 text-sm text-navy-200">
              <Check className="mt-0.5 size-4 shrink-0 text-teal-300" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-end border-t border-white/5 pt-5">
        <button type="button" onClick={onReset} className={buttonClass('secondary')}>
          Analyze another message
        </button>
      </div>
    </div>
  )
}
