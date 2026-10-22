/**
 * A failed analysis request. `kind` tells the UI what went wrong:
 * - "network": the analysis service couldn't be reached
 * - "timeout": it didn't answer within REQUEST_TIMEOUT_MS
 * - "http": it answered with a non-2xx status (see `status`)
 * - "invalid_response": it answered, but not with the expected JSON
 * `message` is written for users; `detail` holds technical context, if any.
 */
export class AnalysisError extends Error {
  constructor(kind, message, { status = null, detail = null, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'AnalysisError'
    this.kind = kind
    this.status = status
    this.detail = detail
  }
}
