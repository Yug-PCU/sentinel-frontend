// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { SAMPLE_MESSAGES } from '../data/samples.js'
import { MOCK_RESPONSES, mockAnalyze, pickMockScenario } from './mock.js'
import { normalizeAnalysis } from './normalize.js'

describe('mock backend', () => {
  it('gives every built-in example the response written for it', () => {
    const scenarios = Object.fromEntries(SAMPLE_MESSAGES.map((sample) => [sample.id, pickMockScenario(sample.message)]))
    expect(scenarios).toEqual({
      'crypto-vip': 'critical',
      'wrong-number-stock': 'high',
      'real-estate': 'medium',
      'statement-notice': 'low',
    })
  })

  it('always picks the same response for the same text', () => {
    const message = 'Join my exclusive forex signals group'
    expect(pickMockScenario(message)).toBe(pickMockScenario(message))
    expect(Object.keys(MOCK_RESPONSES)).toContain(pickMockScenario(message))
  })

  it.each(Object.entries(MOCK_RESPONSES))('%s response follows the backend contract', (level, body) => {
    const analysis = normalizeAnalysis(body)
    expect(analysis.riskLevel).toBe(level)
    expect(analysis.warnings.length).toBeGreaterThan(0)
    expect(analysis.warnings.every((warning) => warning.title && warning.description && warning.severity)).toBe(true)
  })

  it('resolves with a copy, so callers cannot change the canned data', async () => {
    const body = await mockAnalyze({ message: SAMPLE_MESSAGES[0].message }, { delayMs: 0 })
    body.warnings.length = 0
    expect(MOCK_RESPONSES.critical.warnings.length).toBeGreaterThan(0)
  })

  it('can be cancelled', async () => {
    const controller = new AbortController()
    const pending = mockAnalyze({ message: 'anything' }, { signal: controller.signal, delayMs: 10_000 })
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })
})
