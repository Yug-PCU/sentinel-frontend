import { getRiskLevelInfo, SEVERITY_LABELS } from './risk.js'

// Most severe first. Warnings without a severity sort after all rated ones.
export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low']

function severityRank(severity) {
  const rank = SEVERITY_ORDER.indexOf(severity)
  return rank === -1 ? SEVERITY_ORDER.length : rank
}

/**
 * Warnings ordered by severity (stable, so the backend's order breaks ties),
 * each with a 1-based `number` used to cross-reference evidence highlights.
 */
export function rankWarnings(warnings) {
  return warnings
    .map((warning, index) => ({ warning, index }))
    .sort((a, b) => severityRank(a.warning.severity) - severityRank(b.warning.severity) || a.index - b.index)
    .map(({ warning }, index) => ({ ...warning, number: index + 1 }))
}

/** Count of warnings per severity, plus `unrated` for warnings without one. */
export function countBySeverity(warnings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, unrated: 0 }
  for (const { severity } of warnings) {
    if (severity && Object.hasOwn(counts, severity)) counts[severity] += 1
    else counts.unrated += 1
  }
  return counts
}

/** The most severe rating among the warnings, or null if none are rated. */
export function highestSeverity(warnings) {
  return SEVERITY_ORDER.find((severity) => warnings.some((warning) => warning.severity === severity)) ?? null
}

/**
 * Locate each warning's evidence quotes in the original message (case-insensitive)
 * and split the message into plain and highlighted segments. Overlapping matches
 * merge into one highlight that lists every warning number it belongs to and
 * takes the most severe rating among them.
 * Expects warnings from rankWarnings (each has a `number`).
 * @returns {{ segments: Array<{ text: string, mark: null | { numbers: number[], severity: string | null } }>, located: number, total: number }}
 */
export function annotateMessage(message, rankedWarnings) {
  const haystack = message.toLowerCase()
  const ranges = []
  let total = 0
  let located = 0

  for (const warning of rankedWarnings) {
    for (const quote of warning.evidence) {
      total += 1
      const needle = quote.toLowerCase()
      let from = haystack.indexOf(needle)
      if (from === -1) continue
      located += 1
      while (from !== -1) {
        ranges.push({ start: from, end: from + needle.length, number: warning.number, severity: warning.severity })
        from = haystack.indexOf(needle, from + needle.length)
      }
    }
  }

  ranges.sort((a, b) => a.start - b.start || b.end - a.end)
  const merged = []
  for (const range of ranges) {
    const last = merged.at(-1)
    if (last && range.start < last.end) {
      last.end = Math.max(last.end, range.end)
      if (!last.numbers.includes(range.number)) last.numbers.push(range.number)
      if (severityRank(range.severity) < severityRank(last.severity)) last.severity = range.severity
    } else {
      merged.push({ start: range.start, end: range.end, numbers: [range.number], severity: range.severity })
    }
  }

  const segments = []
  let cursor = 0
  for (const { start, end, numbers, severity } of merged) {
    if (start > cursor) segments.push({ text: message.slice(cursor, start), mark: null })
    segments.push({ text: message.slice(start, end), mark: { numbers: numbers.sort((a, b) => a - b), severity } })
    cursor = end
  }
  if (cursor < message.length) segments.push({ text: message.slice(cursor), mark: null })

  return { segments, located, total }
}

/** Hostname of the submitted link, or null when no link was analyzed. */
export function linkHost(url) {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/** Plain-text version of a report, for pasting into an email to a bank or a fraud report. */
export function formatReportText(result) {
  const { riskScore, riskLevel, warnings, input, analyzedAt } = result
  const info = getRiskLevelInfo(riskLevel)
  const ranked = rankWarnings(warnings)
  const lines = [
    'SENTINEL RISK REPORT',
    `Analyzed: ${analyzedAt.toLocaleString()}`,
    `Risk score: ${Math.round(riskScore)}/100 (${info.label})`,
    info.summary,
  ]
  if (input.url) lines.push(`Link: ${input.url}`)

  lines.push('', `WARNING SIGNS (${ranked.length})`)
  if (ranked.length === 0) lines.push('None detected.')
  for (const warning of ranked) {
    const severity = warning.severity ? ` [${SEVERITY_LABELS[warning.severity]}]` : ''
    lines.push(`${warning.number}. ${warning.title}${severity}`)
    if (warning.description) lines.push(`   ${warning.description}`)
    for (const quote of warning.evidence) lines.push(`   > "${quote}"`)
  }

  lines.push('', 'RECOMMENDED ACTIONS', ...info.advice.map((tip) => `- ${tip}`))
  lines.push('', 'MESSAGE ANALYZED', input.message)
  lines.push('', 'Automated risk estimate, not financial or legal advice.')
  return lines.join('\n')
}
