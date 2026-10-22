// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { normalizeAnalysis } from './normalize.js'

function thrownBy(fn) {
  try {
    fn()
  } catch (error) {
    return error
  }
  throw new Error('Expected the function to throw')
}

describe('normalizeAnalysis', () => {
  it('accepts the documented response shape', () => {
    const body = {
      risk_score: 87,
      risk_level: 'high',
      warnings: [{ title: 'Guaranteed returns', description: 'Promises 40% a month.', severity: 'critical' }],
    }
    expect(normalizeAnalysis(body)).toEqual({
      riskScore: 87,
      riskLevel: 'high',
      warnings: [
        {
          id: 'warning-0',
          title: 'Guaranteed returns',
          description: 'Promises 40% a month.',
          severity: 'critical',
          evidence: [],
        },
      ],
    })
  })

  it('accepts warnings as plain strings', () => {
    const { warnings } = normalizeAnalysis({ risk_score: 60, risk_level: 'high', warnings: ['Urgency', 'Crypto only'] })
    expect(warnings.map((warning) => warning.title)).toEqual(['Urgency', 'Crypto only'])
    expect(warnings[0]).toMatchObject({ description: null, severity: null, evidence: [] })
  })

  it('reads common alternative field names', () => {
    const { warnings } = normalizeAnalysis({
      risk_score: 50,
      risk_level: 'medium',
      warnings: [
        { name: 'Urgency', explanation: 'The offer ends tonight.', level: 'HIGH', evidence: 'closes tonight' },
        { message: 'Asks for payment in crypto' },
      ],
    })
    expect(warnings).toEqual([
      {
        id: 'warning-0',
        title: 'Urgency',
        description: 'The offer ends tonight.',
        severity: 'high',
        evidence: ['closes tonight'],
      },
      { id: 'warning-1', title: 'Asks for payment in crypto', description: null, severity: null, evidence: [] },
    ])
  })

  it('skips empty and malformed warnings', () => {
    const { warnings } = normalizeAnalysis({ risk_score: 5, warnings: ['', null, 3, {}, '  Real one  '] })
    expect(warnings).toEqual([
      { id: 'warning-4', title: 'Real one', description: null, severity: null, evidence: [] },
    ])
  })

  it('normalizes risk level spelling and common synonyms', () => {
    expect(normalizeAnalysis({ risk_score: 40, risk_level: 'Moderate' }).riskLevel).toBe('medium')
    expect(normalizeAnalysis({ risk_score: 90, risk_level: 'HIGH_RISK' }).riskLevel).toBe('high')
    expect(normalizeAnalysis({ risk_score: 90, risk_level: 'Very high' }).riskLevel).toBe('critical')
    expect(normalizeAnalysis({ risk_score: 55, risk_level: 'Suspicious' }).riskLevel).toBe('suspicious')
  })

  it('falls back to score bands when risk_level is missing', () => {
    const levels = [0, 24, 25, 49, 50, 74, 75, 100].map((score) => normalizeAnalysis({ risk_score: score }).riskLevel)
    expect(levels).toEqual(['low', 'low', 'medium', 'medium', 'high', 'high', 'critical', 'critical'])
  })

  it('accepts a numeric string score and treats missing warnings as none', () => {
    expect(normalizeAnalysis({ risk_score: '72.5', risk_level: 'high' })).toEqual({
      riskScore: 72.5,
      riskLevel: 'high',
      warnings: [],
    })
  })

  it.each([
    ['a non-object body', 'oops'],
    ['an array body', []],
    ['null', null],
    ['a missing score', { risk_level: 'high' }],
    ['a word score', { risk_score: 'high' }],
    ['a score above 100', { risk_score: 101 }],
    ['a negative score', { risk_score: -1 }],
    ['warnings that are not a list', { risk_score: 50, warnings: 'Urgency' }],
  ])('rejects %s', (_, body) => {
    expect(thrownBy(() => normalizeAnalysis(body))).toMatchObject({
      name: 'AnalysisError',
      kind: 'invalid_response',
    })
  })
})
