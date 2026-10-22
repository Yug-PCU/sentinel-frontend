import { getRiskLevelInfo } from '../lib/risk.js'
import { getRiskTone } from './riskTones.js'

// Risk category pill: colored icon plus a text label, so color never carries meaning alone.
export default function RiskBadge({ level }) {
  const { label } = getRiskLevelInfo(level)
  const tone = getRiskTone(level)
  const Icon = tone.icon
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold text-navy-50 ${tone.surface}`}
    >
      <Icon className={`size-4 ${tone.text}`} aria-hidden="true" />
      {label}
    </span>
  )
}
