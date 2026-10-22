// Stand-in for the backend while it's being built. Returns canned POST /analyze
// responses after a short delay. Nothing here analyzes the message.
import { SAMPLE_MESSAGES } from '../data/samples.js'

export const MOCK_DELAY_MS = 1200

/** Canned responses, written in the exact JSON format the backend should return. */
export const MOCK_RESPONSES = {
  low: {
    risk_score: 8,
    risk_level: 'low',
    warnings: [
      {
        title: 'Account notices can be spoofed',
        description:
          "This notice doesn't show common scam signs, but scammers copy messages like it. Open your account through the official app or a web address you type yourself.",
        severity: 'low',
      },
    ],
  },
  medium: {
    risk_score: 44,
    risk_level: 'medium',
    warnings: [
      {
        title: 'Unsolicited investment offer',
        description:
          'The sender reached out to you first. Legitimate advisers rarely cold-message strangers with investment offers.',
        severity: 'medium',
      },
      {
        title: 'High projected returns',
        description:
          "Projected returns of 18–22% a year are well above typical real estate returns. Ask how the projection is calculated and what happens if it isn't met.",
        severity: 'medium',
      },
      {
        title: 'Large minimum investment',
        description:
          'A $10,000 minimum is a significant commitment. Verify the firm and the specific offering with your financial regulator before sending money.',
        severity: 'low',
      },
    ],
  },
  high: {
    risk_score: 78,
    risk_level: 'high',
    warnings: [
      {
        title: 'Unsolicited "wrong number" contact',
        description:
          'A stranger who texts the wrong number and then brings up investing is a common opening for relationship investment scams.',
        severity: 'high',
      },
      {
        title: 'Claims of insider information',
        description:
          'Tips based on news "before it goes public" are either false or illegal to trade on. Scammers use them to make a pitch feel exclusive.',
        severity: 'high',
      },
      {
        title: 'Unrealistic price prediction',
        description:
          'Predicting a stock will rise more than tenfold in a week is typical of pump-and-dump schemes, where promoters sell as new buyers push the price up.',
        severity: 'high',
      },
      {
        title: 'Invitation to a private trading group',
        description:
          'Private chat groups let scammers control what you see, often with fake screenshots of profits from other "members."',
        severity: 'medium',
      },
    ],
  },
  critical: {
    risk_score: 94,
    risk_level: 'critical',
    warnings: [
      {
        title: 'Guaranteed high returns',
        description:
          'The message promises 40% returns every month with "zero risk." No legitimate investment can guarantee returns, and 40% a month is far beyond what real markets deliver.',
        severity: 'critical',
      },
      {
        title: 'Payment in crypto to a personal wallet',
        description:
          "You're asked to send USDT to a wallet address. Crypto transfers are hard to trace and almost impossible to reverse, which is why scammers prefer them.",
        severity: 'critical',
      },
      {
        title: 'Told to keep it from your bank',
        description:
          '"Don\'t tell your bank" is a classic warning sign. Banks are often the first to spot and stop fraud, so scammers try to keep them out of the loop.',
        severity: 'high',
      },
      {
        title: 'Pressure to act immediately',
        description:
          '"Only 3 spots left" and "the offer closes tonight" create urgency so you don\'t take time to check the offer.',
        severity: 'high',
      },
      {
        title: 'Conditions on withdrawals',
        description:
          'Saying withdrawals unlock after you "hit your profit target" is a common way to get victims to deposit more before they can take money out.',
        severity: 'medium',
      },
    ],
  },
}

// Each built-in example gets the canned response written for it.
const SAMPLE_SCENARIOS = {
  'crypto-vip': 'critical',
  'wrong-number-stock': 'high',
  'real-estate': 'medium',
  'statement-notice': 'low',
}

const SCENARIOS = Object.keys(MOCK_RESPONSES)

/**
 * Choose which canned response to return. Built-in examples get their matching
 * response; any other text gets one picked from a hash of the message, so the
 * same text always shows the same mock result.
 */
export function pickMockScenario(message) {
  const sample = SAMPLE_MESSAGES.find((item) => item.message === message)
  if (sample) return SAMPLE_SCENARIOS[sample.id]
  return SCENARIOS[hashString(message) % SCENARIOS.length]
}

/** Resolve with a canned response body after `delayMs`, like a slow network request would. */
export function mockAnalyze({ message }, { signal, delayMs = MOCK_DELAY_MS } = {}) {
  const body = structuredClone(MOCK_RESPONSES[pickMockScenario(message)])
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason)
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve(body)
    }, delayMs)
    function onAbort() {
      clearTimeout(timer)
      reject(signal.reason)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

// 32-bit FNV-1a: a small, stable string hash.
function hashString(text) {
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
