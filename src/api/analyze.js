import { ANALYZE_ENDPOINT, API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config.js'
import { AnalysisError } from './errors.js'
import { normalizeAnalysis } from './normalize.js'

const MAX_DETAIL_LENGTH = 300

/**
 * Analyze a message and return the normalized result from the backend.
 * @param {{ message: string, url: string | null }} input
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<import('./normalize.js').Analysis>}
 */
export async function analyzeMessage(input, { signal } = {}) {
  return normalizeAnalysis(await requestAnalysis(input, { signal }))
}

/**
 * POST { message, url } as JSON to the analysis endpoint and return the parsed response body.
 * Rejects with an AnalysisError on failure, or with the abort reason if `signal` aborts.
 */
export async function requestAnalysis(
  { message, url },
  { signal, endpoint = ANALYZE_ENDPOINT, timeoutMs = REQUEST_TIMEOUT_MS } = {},
) {
  signal?.throwIfAborted()

  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)
  const forwardAbort = () => controller.abort(signal.reason)
  signal?.addEventListener('abort', forwardAbort, { once: true })

  // A failed fetch or body read is a timeout, a cancellation, or a network problem.
  const requestError = (error) => {
    if (timedOut) {
      return new AnalysisError(
        'timeout',
        `The analysis service didn't respond within ${Math.round(timeoutMs / 1000)} seconds. Try again in a moment.`,
        { cause: error },
      )
    }
    if (signal?.aborted) return signal.reason ?? error
    return new AnalysisError(
      'network',
      "Couldn't connect to the analysis service. Check your connection and try again.",
      { cause: error },
    )
  }

  try {
    let response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message, url }),
        signal: controller.signal,
      })
    } catch (error) {
      throw requestError(error)
    }

    if (!response.ok) {
      throw new AnalysisError('http', describeStatus(response.status), {
        status: response.status,
        detail: (await readErrorDetail(response)) ?? devProxyHint(response.status),
      })
    }

    let text
    try {
      text = await response.text()
    } catch (error) {
      throw requestError(error)
    }
    try {
      return JSON.parse(text)
    } catch (error) {
      throw new AnalysisError(
        'invalid_response',
        "The analysis service sent a response Sentinel couldn't read.",
        { detail: 'The response body is not valid JSON.', cause: error },
      )
    }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
  }
}

function describeStatus(status) {
  if (status === 429) {
    return 'The analysis service is busy right now (HTTP 429). Wait a moment and try again.'
  }
  if (status === 502 || status === 503 || status === 504) {
    return `The analysis service isn't available right now (HTTP ${status}). Try again in a moment.`
  }
  if (status >= 500) {
    return `The analysis service ran into a problem (HTTP ${status}). Try again in a moment.`
  }
  return `The analysis service couldn't process this request (HTTP ${status}).`
}

// `npm run dev` only: the Vite proxy answers 502 when nothing is listening at its target.
function devProxyHint(status) {
  if (!import.meta.env.DEV || API_BASE_URL || status !== 502) return null
  return 'Dev server: the /analyze proxy got no answer from the backend. Check that the backend is running and that API_PROXY_TARGET (default http://localhost:8000) points to it.'
}

/** Pull a readable reason out of an error response (FastAPI, Flask, or Express style), if any. */
async function readErrorDetail(response) {
  let text
  try {
    text = (await response.text()).trim()
  } catch {
    return null
  }
  if (!text) return null

  const type = response.headers.get('content-type') ?? ''
  let detail = null
  if (type.includes('json')) {
    try {
      detail = messageFromBody(JSON.parse(text))
    } catch {
      detail = null
    }
  } else if (type.includes('text/plain')) {
    detail = text
  }
  if (!detail) return null
  return detail.length > MAX_DETAIL_LENGTH ? `${detail.slice(0, MAX_DETAIL_LENGTH - 1)}…` : detail
}

function messageFromBody(body) {
  const value = body?.detail ?? body?.error ?? body?.message
  if (typeof value === 'string') return value
  // FastAPI validation errors look like { detail: [{ loc, msg, type }, ...] }
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => (typeof item === 'string' ? item : (item?.msg ?? item?.message)))
      .filter((item) => typeof item === 'string' && item)
    return messages.length > 0 ? messages.join('; ') : null
  }
  return typeof value?.message === 'string' ? value.message : null
}
