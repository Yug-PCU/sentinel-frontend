// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SAMPLE_MESSAGES } from '../data/samples.js'
import { analyzeMessage, requestAnalysis } from './analyze.js'
import { MOCK_DELAY_MS } from './mock.js'

const INPUT = { message: 'Guaranteed 40% a month!', url: 'https://fast-returns.example' }

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

// A fetch that never answers, but rejects like the real one when its signal aborts.
function hangingFetch() {
  return vi.fn(
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }),
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('requestAnalysis', () => {
  it('POSTs { message, url } as JSON to /analyze and returns the body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ risk_score: 80, risk_level: 'high', warnings: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(requestAnalysis(INPUT)).resolves.toEqual({ risk_score: 80, risk_level: 'high', warnings: [] })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [endpoint, init] = fetchMock.mock.calls[0]
    expect(endpoint).toBe('/analyze')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', Accept: 'application/json' })
    expect(JSON.parse(init.body)).toEqual(INPUT)
  })

  it('sends url: null when no link was given', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ risk_score: 10 }))
    vi.stubGlobal('fetch', fetchMock)
    await requestAnalysis({ message: 'Hello', url: null })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ message: 'Hello', url: null })
  })

  it('turns an HTTP error into an AnalysisError with the server detail', async () => {
    const body = { detail: [{ loc: ['body', 'message'], msg: 'Field required', type: 'missing' }] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body, 422)))
    await expect(requestAnalysis(INPUT)).rejects.toMatchObject({
      name: 'AnalysisError',
      kind: 'http',
      status: 422,
      detail: 'Field required',
    })
  })

  it('reads a plain-text error body', async () => {
    const response = new Response('Analyzer crashed', { status: 500, headers: { 'Content-Type': 'text/plain' } })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    await expect(requestAnalysis(INPUT)).rejects.toMatchObject({ kind: 'http', status: 500, detail: 'Analyzer crashed' })
  })

  it('explains a 502 from the dev proxy when the backend is not running', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 502 })))
    const error = await requestAnalysis(INPUT).catch((reason) => reason)
    expect(error).toMatchObject({ kind: 'http', status: 502 })
    expect(error.message).toMatch(/isn't available right now \(HTTP 502\)/)
    expect(error.detail).toMatch(/API_PROXY_TARGET/)
  })

  it('reports a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    await expect(requestAnalysis(INPUT)).rejects.toMatchObject({ name: 'AnalysisError', kind: 'network' })
  })

  it('reports a body that is not JSON', async () => {
    const response = new Response('<html>Gateway</html>', { status: 200, headers: { 'Content-Type': 'text/html' } })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    await expect(requestAnalysis(INPUT)).rejects.toMatchObject({ kind: 'invalid_response' })
  })

  it('gives up after the timeout', async () => {
    vi.stubGlobal('fetch', hangingFetch())
    await expect(requestAnalysis(INPUT, { timeoutMs: 20 })).rejects.toMatchObject({ kind: 'timeout' })
  })

  it('rejects with the abort error, not an AnalysisError, when the caller cancels', async () => {
    vi.stubGlobal('fetch', hangingFetch())
    const controller = new AbortController()
    const pending = requestAnalysis(INPUT, { signal: controller.signal })
    controller.abort()
    const error = await pending.catch((reason) => reason)
    expect(error.name).toBe('AbortError')
  })
})

describe('analyzeMessage', () => {
  it('returns mock data without calling the network when mock mode is on', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const sample = SAMPLE_MESSAGES.find((item) => item.id === 'crypto-vip')

    const pending = analyzeMessage({ message: sample.message, url: sample.url }, { useMock: true })
    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS)

    await expect(pending).resolves.toMatchObject({ source: 'mock', riskScore: 94, riskLevel: 'critical' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('calls the backend and normalizes its response when mock mode is off', async () => {
    const body = { risk_score: '42', risk_level: 'Moderate', warnings: ['Unsolicited offer'] }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)))

    await expect(analyzeMessage(INPUT, { useMock: false })).resolves.toMatchObject({
      source: 'api',
      riskScore: 42,
      riskLevel: 'medium',
      warnings: [{ title: 'Unsolicited offer' }],
    })
  })
})
