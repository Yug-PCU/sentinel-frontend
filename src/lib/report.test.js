import { describe, expect, it } from 'vitest'
import { annotateMessage, countBySeverity, formatReportText, highestSeverity, linkHost, rankWarnings } from './report.js'

const warning = (title, severity, evidence = []) => ({ id: title, title, description: null, severity, evidence })

describe('rankWarnings', () => {
  it('orders by severity, keeps backend order for ties, and numbers the result', () => {
    const ranked = rankWarnings([
      warning('a', 'medium'),
      warning('b', null),
      warning('c', 'critical'),
      warning('d', 'medium'),
    ])
    expect(ranked.map((item) => [item.number, item.title])).toEqual([
      [1, 'c'],
      [2, 'a'],
      [3, 'd'],
      [4, 'b'],
    ])
  })
})

describe('countBySeverity and highestSeverity', () => {
  it('counts each rating and treats a missing one as unrated', () => {
    const warnings = [warning('a', 'high'), warning('b', 'high'), warning('c', null)]
    expect(countBySeverity(warnings)).toEqual({ critical: 0, high: 2, medium: 0, low: 0, unrated: 1 })
    expect(highestSeverity(warnings)).toBe('high')
    expect(highestSeverity([warning('c', null)])).toBeNull()
  })
})

describe('annotateMessage', () => {
  it('highlights evidence case-insensitively and reports quotes it cannot find', () => {
    const ranked = rankWarnings([warning('Returns', 'critical', ['GUARANTEES 40%', 'not in the text'])])
    const { segments, located, total } = annotateMessage('Our bot guarantees 40% a month.', ranked)

    expect(segments).toEqual([
      { text: 'Our bot ', mark: null },
      { text: 'guarantees 40%', mark: { numbers: [1], severity: 'critical' } },
      { text: ' a month.', mark: null },
    ])
    expect([located, total]).toEqual([1, 2])
  })

  it('merges overlapping evidence into one highlight with the higher severity', () => {
    const ranked = rankWarnings([warning('Pressure', 'medium', ['closes tonight']), warning('Urgency', 'high', ['offer closes'])])
    const { segments } = annotateMessage('The offer closes tonight!', ranked)

    expect(segments).toEqual([
      { text: 'The ', mark: null },
      { text: 'offer closes tonight', mark: { numbers: [1, 2], severity: 'high' } },
      { text: '!', mark: null },
    ])
  })

  it('returns the message as one plain segment when there is no evidence', () => {
    expect(annotateMessage('Hello', []).segments).toEqual([{ text: 'Hello', mark: null }])
  })
})

describe('linkHost', () => {
  it('returns the hostname, or null without a link', () => {
    expect(linkHost('https://vip-returns.example/join?ref=1')).toBe('vip-returns.example')
    expect(linkHost(null)).toBeNull()
  })
})

describe('formatReportText', () => {
  it('includes the score, ranked warnings with evidence, advice, and the message', () => {
    const text = formatReportText({
      riskScore: 86.6,
      riskLevel: 'critical',
      warnings: [warning('Pressure', 'medium'), warning('Guaranteed returns', 'critical', ['40% a month'])],
      input: { message: 'Join now, 40% a month', url: 'https://x.example' },
      analyzedAt: new Date(2026, 0, 1),
    })

    expect(text).toContain('Risk score: 87/100 (Critical risk)')
    expect(text).toContain('Link: https://x.example')
    expect(text).toMatch(/1\. Guaranteed returns \[Critical\]\n {3}> "40% a month"\n2\. Pressure \[Medium\]/)
    expect(text).toContain('RECOMMENDED ACTIONS')
    expect(text).toContain('Join now, 40% a month')
  })
})
