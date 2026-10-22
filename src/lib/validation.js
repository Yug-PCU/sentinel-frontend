import { MAX_MESSAGE_LENGTH, MAX_URL_LENGTH } from '../config.js'

const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i
const INVALID_URL = "That doesn't look like a web address. Example: https://example.com/offer"

const formatCount = (count) => count.toLocaleString('en-US')

/**
 * Check the analyzer form and build the request payload.
 * `errors` is null when the input is valid.
 * @param {{ message: string, url: string }} form
 * @returns {{ values: { message: string, url: string | null | undefined }, errors: { message?: string, url?: string } | null }}
 */
export function validateAnalysisInput({ message, url }) {
  const errors = {}
  const trimmedMessage = message.trim()

  if (!trimmedMessage) {
    errors.message = 'Paste the message you want to check.'
  } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    errors.message = `This message is ${formatCount(trimmedMessage.length)} characters. Shorten it to ${formatCount(MAX_MESSAGE_LENGTH)} or fewer.`
  }

  const link = normalizeUrl(url)
  if (link.error) errors.url = link.error

  return {
    values: { message: trimmedMessage, url: link.url },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

/**
 * Validate the optional link field.
 * Returns { url: null } when empty, { url } when valid (https:// is added if the
 * scheme is missing, otherwise the link is kept exactly as typed), or { error }.
 */
export function normalizeUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return { url: null }
  if (trimmed.length > MAX_URL_LENGTH) {
    return { error: `Links can be up to ${formatCount(MAX_URL_LENGTH)} characters.` }
  }
  if (/\s/.test(trimmed)) return { error: INVALID_URL }

  const candidate = SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`
  let parsed
  try {
    parsed = new URL(candidate)
  } catch {
    return { error: INVALID_URL }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'Only http:// and https:// links can be checked.' }
  }
  if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
    return { error: INVALID_URL }
  }
  return { url: candidate }
}
