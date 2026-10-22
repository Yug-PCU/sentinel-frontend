import { Check, ChevronDown, FlaskConical, Info } from 'lucide-react'
import { getRiskLevelInfo } from '../lib/risk.js'
import RiskBadge from './RiskBadge.jsx'
import RiskGauge from './RiskGauge.jsx'
import WarningList from './WarningList.jsx'
import { buttonClass } from './ui.js'

export default function RiskReport({ result, isStale, onReset }) {
  const { riskScore, riskLevel, warnings, source, input } = result
  const info = getRiskLevelInfo(riskLevel)

  return (
    <div className="space-y-6">
      {source === 'mock' && (
        <div className="flex gap-3 rounded-xl border border-violet-400/30 bg-violet-400/10 p-4">
          <FlaskConical className="mt-0.5 size-5 shrink-0 text-violet-300" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-violet-50">Mock result — not a real analysis</p>
            <p className="mt-1 text-violet-100/85">
              The backend isn't connected yet, so this report is sample data built into the frontend.
              Your message wasn't actually analyzed.
            </p>
          </div>
        </div>
      )}

      {isStale && (
        <div className="flex items-start gap-3 rounded-xl border border-teal-400/25 bg-teal-400/5 p-3 text-sm text-navy-100">
          <Info className="mt-0.5 size-4 shrink-0 text-teal-300" aria-hidden="true" />
          <p>You've changed the message or link since this report. Analyze again to update it.</p>
        </div>
      )}

      <div className="grid items-center gap-6 rounded-2xl border border-white/5 bg-navy-900/60 p-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:p-6">
        <RiskGauge score={riskScore} level={riskLevel} label={info.label} />
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold tracking-wider text-navy-300 uppercase">Risk category</p>
          <div className="mt-2">
            <RiskBadge level={riskLevel} />
          </div>
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

      <details className="group rounded-xl border border-white/5 bg-navy-900/40 text-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-medium text-navy-100 select-none focus-visible:outline-2 focus-visible:outline-teal-300 [&::-webkit-details-marker]:hidden">
          What was analyzed
          <ChevronDown className="size-4 text-navy-300 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <dl className="space-y-3 px-4 pb-4">
          <div>
            <dt className="text-xs text-navy-300">
              Message ({input.message.length.toLocaleString('en-US')} characters)
            </dt>
            <dd className="mt-1 max-h-40 overflow-y-auto break-words whitespace-pre-wrap text-navy-200">
              {input.message}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-navy-300">Link</dt>
            <dd className="mt-1 break-all text-navy-200">{input.url ?? 'None provided'}</dd>
          </div>
        </dl>
      </details>

      <div className="flex flex-col-reverse gap-4 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-navy-300">This score is an automated estimate, not financial advice.</p>
        <button type="button" onClick={onReset} className={buttonClass('secondary')}>
          Analyze another message
        </button>
      </div>
    </div>
  )
}
