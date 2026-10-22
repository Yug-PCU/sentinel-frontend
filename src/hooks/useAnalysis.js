import { useCallback, useEffect, useRef, useState } from 'react'
import { analyzeMessage } from '../api/analyze.js'
import { AnalysisError } from '../api/errors.js'

const IDLE = { status: 'idle', result: null, error: null, lastInput: null }

/**
 * Runs analyses and tracks their state.
 * status: "idle" | "loading" | "success" | "error"
 * result: the latest successful analysis (kept while a new one loads), plus the
 *         `input` it was made from and `analyzedAt`.
 * Starting a new analysis cancels the one in flight.
 */
export function useAnalysis() {
  const [state, setState] = useState(IDLE)
  const controllerRef = useRef(null)

  const analyze = useCallback(async (input) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState((previous) => ({ ...previous, status: 'loading', error: null, lastInput: input }))

    try {
      const analysis = await analyzeMessage(input, { signal: controller.signal })
      if (controller.signal.aborted) return
      setState({
        status: 'success',
        result: { ...analysis, input, analyzedAt: new Date() },
        error: null,
        lastInput: input,
      })
    } catch (error) {
      if (controller.signal.aborted) return
      // AnalysisErrors are expected failures; anything else is a bug worth logging.
      if (!(error instanceof AnalysisError)) console.error(error)
      setState({ status: 'error', result: null, error, lastInput: input })
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [])

  const { lastInput } = state
  const retry = useCallback(() => {
    if (lastInput) analyze(lastInput)
  }, [analyze, lastInput])

  // Stop waiting and go back to the previous report, if there was one.
  const cancel = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setState((previous) => {
      if (previous.status !== 'loading') return previous
      return previous.result ? { ...previous, status: 'success' } : IDLE
    })
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setState(IDLE)
  }, [])

  useEffect(() => () => controllerRef.current?.abort(), [])

  return { ...state, analyze, retry, cancel, reset }
}
