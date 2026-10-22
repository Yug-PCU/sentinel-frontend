// Risk levels the UI knows how to present. The backend decides the level; the
// score bands in scoreToRiskLevel are only used when a response omits risk_level.
export const RISK_LEVELS = {
  low: {
    label: 'Low risk',
    summary: 'No strong signs of an investment scam were found in this message.',
    advice: [
      'Messages like this can still be faked, so reach the company through its official app or a web address you type yourself.',
      'Never share passwords, one-time codes, or crypto wallet recovery phrases.',
    ],
  },
  medium: {
    label: 'Medium risk',
    summary: 'Some warning signs. Verify the offer independently before going any further.',
    advice: [
      "Don't send money until you've confirmed the person and firm are registered with your financial regulator.",
      'Search the company name together with "scam" or "complaints".',
      "Take your time. A real opportunity won't disappear because you checked it first.",
    ],
  },
  high: {
    label: 'High risk',
    summary: 'Several strong warning signs of an investment scam.',
    advice: [
      "Don't send money, crypto, or personal details.",
      "Stop replying, and don't open links or install apps the sender suggests.",
      'If you want to invest, find a registered firm yourself instead of using this contact.',
    ],
  },
  critical: {
    label: 'Critical risk',
    summary: 'This message closely matches known investment scam patterns.',
    advice: [
      "Don't send any money or crypto. Payments to scammers are rarely recoverable.",
      'Block the sender and report the message to your bank and local fraud authorities.',
      "If you've already paid, contact your bank or exchange right away.",
    ],
  },
}

export const SEVERITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }

const UNKNOWN_LEVEL_ADVICE = [
  "Don't send money until you've verified the person and firm independently.",
  'Review the warning signs above before you decide anything.',
]

const LEVEL_ALIASES = {
  minimal: 'low',
  none: 'low',
  safe: 'low',
  moderate: 'medium',
  elevated: 'medium',
  severe: 'critical',
  extreme: 'critical',
  'very high': 'critical',
}

export function isKnownRiskLevel(level) {
  return typeof level === 'string' && Object.hasOwn(RISK_LEVELS, level)
}

/**
 * Normalize a level from the backend: "High", "HIGH_RISK" and "moderate" become
 * "high", "high" and "medium". Unrecognized words come back lowercased so the UI
 * can still show them.
 */
export function normalizeRiskLevel(value) {
  if (typeof value !== 'string') return null
  const words = value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ')
    .replace(/ risk$/, '')
  if (!words) return null
  return Object.hasOwn(LEVEL_ALIASES, words) ? LEVEL_ALIASES[words] : words
}

/** Fallback category for responses without risk_level (bands: 0–24, 25–49, 50–74, 75–100). */
export function scoreToRiskLevel(score) {
  if (score < 25) return 'low'
  if (score < 50) return 'medium'
  if (score < 75) return 'high'
  return 'critical'
}

/** Label, summary, and advice for a level, with a generic fallback for unrecognized levels. */
export function getRiskLevelInfo(level) {
  if (isKnownRiskLevel(level)) return RISK_LEVELS[level]
  return {
    label: level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown',
    summary:
      "The analysis service returned a risk category Sentinel doesn't recognize. Use the score and warning signs to judge the message.",
    advice: UNKNOWN_LEVEL_ADVICE,
  }
}
