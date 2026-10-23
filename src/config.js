// App settings, read from Vite env variables at build time.
// Copy .env.example to .env.local to change them, then restart `npm run dev`.
const env = import.meta.env

function readPositiveNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

/** Backend origin, e.g. "https://api.example.com". Empty means the frontend's own origin. */
export const API_BASE_URL = String(env.VITE_API_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '')

/** Where analysis requests are sent. */
export const ANALYZE_ENDPOINT = `${API_BASE_URL}/analyze`

/** How long to wait for the backend before showing a timeout error. */
export const REQUEST_TIMEOUT_MS = readPositiveNumber(env.VITE_REQUEST_TIMEOUT_MS, 30_000)

export const MAX_MESSAGE_LENGTH = 5_000
export const MAX_URL_LENGTH = 2_048
