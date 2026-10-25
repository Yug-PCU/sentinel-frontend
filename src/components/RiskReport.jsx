import { Check, ClipboardCopy, Info, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getRiskLevelInfo } from '../lib/risk.js'
import { annotateMessage, countBySeverity, formatReportText, highestSeverity, linkHost, rankWarnings } from '../lib/report.js'
import AnnotatedMessage from './AnnotatedMessage.jsx'
import ReportMetrics from './ReportMetrics.jsx'
import RiskBadge from './RiskBadge.jsx'
import RiskGauge from './RiskGauge.jsx'
import SeverityBreakdown from './SeverityBreakdown.jsx'
import WarningList from './WarningList.jsx'
import { buttonClass } from './ui.js'

export default function RiskReport({ result, isStale, onReset }) {
  const { riskScore, riskLevel, warnings, input } = result
  const info = getRiskLevelInfo(riskLevel)

  const analysis = useMemo(() => {
    const ranked = rankWarnings(warnings)
    return {
      ranked,
      counts: countBySeverity(warnings),
      highest: highestSeverity(warnings),
      evidence: annotateMessage(input.message, ranked),
    }
  }, [warnings, input.message])
  const { ranked, counts, highest, evidence } = analysis

  return (
    <div className="space-y-7">
      {isStale && (
        <div className="flex items-start gap-3 rounded-xl border border-teal-400/25 bg-teal-400/5 p-3 text-sm text-navy-100">
          <Info className="mt-0.5 size-4 shrink-0 text-teal-300" aria-hidden="true" />
          <p>You've changed the message or link since this report. Analyze again to update it.</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid items-center gap-6 rounded-xl border border-white/5 bg-navy-950/60 p-5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:p-6">
          <RiskGauge score={riskScore} level={riskLevel} label={info.label} />
          <div className="text-center sm:text-left">
            <p className="font-mono text-[11px] tracking-[0.14em] text-navy-300 uppercase">Verdict</p>
            <div className="mt-2">
              <RiskBadge level={riskLevel} />
            </div>
            <p className="mt-3 text-pretty text-navy-100">{info.summary}</p>
          </div>
        </div>
        <ReportMetrics
          counts={counts}
          total={warnings.length}
          highest={highest}
          evidence={evidence}
          host={linkHost(input.url)}
        />
      </div>

      <section aria-labelledby="warnings-heading">
        <div className="flex items-center gap-2">
          <h4 id="warnings-heading" className="font-semibold text-white">
            Warning signs
          </h4>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-navy-200 tabular-nums">
            {warnings.length}
          </span>
          {warnings.length > 1 && <span className="ml-auto text-xs text-navy-300">Most severe first</span>}
        </div>
        {warnings.length > 0 && (
          <div className="mt-3">
            <SeverityBreakdown counts={counts} total={warnings.length} />
          </div>
        )}
        <WarningList warnings={ranked} />
      </section>

      {evidence.located > 0 && <AnnotatedMessage {...evidence} />}

      <section aria-labelledby="advice-heading">
        <h4 id="advice-heading" className="font-semibold text-white">
          Recommended actions
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
        <p className="text-xs text-navy-300">Automated risk estimate, not financial or legal advice.</p>
        <div className="flex flex-wrap gap-2">
          <CopyReportButton result={result} />
          <button type="button" onClick={onReset} className={buttonClass('secondary')}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Analyze another message
          </button>
        </div>
      </div>
    </div>
  )
}

const COPY_LABELS = { idle: 'Copy report', copied: 'Copied', failed: "Couldn't copy" }

/** Copies a plain-text report, ready to paste into a message to a bank or fraud hotline. */
function CopyReportButton({ result }) {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (status === 'idle') return undefined
    const timer = setTimeout(() => setStatus('idle'), 2000)
    return () => clearTimeout(timer)
  }, [status])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatReportText(result))
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  const Icon = status === 'copied' ? Check : ClipboardCopy
  return (
    <button type="button" onClick={handleCopy} className={buttonClass('ghost')}>
      <Icon className="size-4" aria-hidden="true" />
      <span aria-live="polite">{COPY_LABELS[status]}</span>
    </button>
  )
}
