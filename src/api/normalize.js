import { isKnownRiskLevel, normalizeRiskLevel, scoreToRiskLevel } from '../lib/risk.js'
import { AnalysisError } from './errors.js'

/**
 * @typedef {object} Warning
 * @property {string} id
 * @property {string} title
 * @property {string | null} description
 * @property {'low' | 'medium' | 'high' | 'critical' | null} severity
 * @property {string[]} evidence  Quoted snippets from the message, if the backend sends them.
 *
 * @typedef {object} Analysis
 * @property {number} riskScore  0–100
 * @property {string} riskLevel  "low" | "medium" | "high" | "critical", or another label from the backend
 * @property {Warning[]} warnings
 */

// Field names accepted for each warning, in order of preference.
const TITLE_FIELDS = ['title', 'name', 'label', 'type', 'category']
const DESCRIPTION_FIELDS = ['description', 'explanation', 'details', 'detail', 'reason', 'message']

/**
 * Check a POST /analyze response body and convert it to the shape the UI renders.
 * Throws AnalysisError("invalid_response") when required fields are missing or malformed.
 * @returns {Analysis}
 */
export function normalizeAnalysis(body) {
  if (!isObject(body)) throw invalidResponse('Expected a JSON object.')

  const riskScore = parseScore(body.risk_score)
  if (riskScore === null) throw invalidResponse('"risk_score" must be a number from 0 to 100.')

  if (body.warnings != null && !Array.isArray(body.warnings)) {
    throw invalidResponse('"warnings" must be a list.')
  }

  return {
    riskScore,
    riskLevel: normalizeRiskLevel(body.risk_level) ?? scoreToRiskLevel(riskScore),
    warnings: (body.warnings ?? []).map(normalizeWarning).filter(Boolean),
  }
}

function parseScore(value) {
  const score = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  return typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100
    ? score
    : null
}

/** Warnings may be plain strings or objects; anything else is skipped. */
function normalizeWarning(item, index) {
  const id = `warning-${index}`
  if (typeof item === 'string') {
    const title = item.trim()
    return title ? { id, title, description: null, severity: null, evidence: [] } : null
  }
  if (!isObject(item)) return null

  const description = firstText(item, DESCRIPTION_FIELDS)
  const title = firstText(item, TITLE_FIELDS) ?? description
  if (!title) return null
  const severity = normalizeRiskLevel(item.severity ?? item.level ?? item.risk_level)

  return {
    id,
    title,
    description: description === title ? null : description,
    severity: isKnownRiskLevel(severity) ? severity : null,
    evidence: toTextList(item.evidence),
  }
}

function firstText(object, fields) {
  for (const field of fields) {
    const value = object[field]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function toTextList(value) {
  const items = Array.isArray(value) ? value : [value]
  return items.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function invalidResponse(detail) {
  return new AnalysisError(
    'invalid_response',
    "The analysis service sent a response Sentinel couldn't read.",
    { detail },
  )
}
