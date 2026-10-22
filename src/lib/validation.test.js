// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { normalizeUrl, validateAnalysisInput } from './validation.js'

describe('validateAnalysisInput', () => {
  it('trims the message and sends url: null when no link is given', () => {
    expect(validateAnalysisInput({ message: '  Double your money!  ', url: '   ' })).toEqual({
      values: { message: 'Double your money!', url: null },
      errors: null,
    })
  })

  it('requires a message', () => {
    const { errors } = validateAnalysisInput({ message: '   ', url: '' })
    expect(errors.message).toMatch(/paste the message/i)
  })

  it('rejects messages over 5,000 characters', () => {
    const { errors } = validateAnalysisInput({ message: 'a'.repeat(5001), url: '' })
    expect(errors.message).toMatch(/5,001 characters/)
  })

  it('reports message and link problems together', () => {
    const { errors } = validateAnalysisInput({ message: '', url: 'not a link' })
    expect(Object.keys(errors)).toEqual(['message', 'url'])
  })
})

describe('normalizeUrl', () => {
  it('adds https:// when the scheme is missing', () => {
    expect(normalizeUrl('fast-returns.example/join')).toEqual({ url: 'https://fast-returns.example/join' })
  })

  it('keeps http and https links exactly as typed', () => {
    expect(normalizeUrl(' http://Example.com/Path?q=1 ')).toEqual({ url: 'http://Example.com/Path?q=1' })
  })

  it.each(['not a link', 'example', 'https://', 'http://exa mple.com'])('rejects %j', (value) => {
    expect(normalizeUrl(value).error).toMatch(/doesn't look like a web address/)
  })

  it('rejects schemes other than http and https', () => {
    expect(normalizeUrl('ftp://example.com/file').error).toMatch(/only http/i)
  })
})
