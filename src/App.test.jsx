import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { SAMPLE_MESSAGES } from './data/samples.js'

const RESULT_WAIT = { timeout: 4000 }

const REPORT = {
  risk_score: 82,
  risk_level: 'critical',
  warnings: [
    {
      title: 'Guaranteed high returns',
      description: 'No legitimate investment can guarantee returns.',
      severity: 'critical',
      evidence: ['guarantees 40% returns'],
    },
  ],
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function renderApp() {
  const user = userEvent.setup()
  render(<App />)
  return {
    user,
    messageField: screen.getByLabelText(/investment message/i),
    urlField: screen.getByLabelText(/link from the message/i),
  }
}

const sample = (id) => SAMPLE_MESSAGES.find((item) => item.id === id)

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(REPORT)))
})

describe('Sentinel analyzer', () => {
  it('starts with the analyzer and an empty report', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: /scan a message/i })).toBeInTheDocument()
    expect(screen.getByText(/your risk report will appear here/i)).toBeInTheDocument()
    expect(screen.queryByText(/mock data|live api/i)).not.toBeInTheDocument()
  })

  it('asks for a message before analyzing', async () => {
    const { user, messageField } = renderApp()
    await user.click(screen.getByRole('button', { name: /analyze message/i }))

    expect(screen.getByText(/paste the message you want to check/i)).toBeInTheDocument()
    expect(messageField).toHaveAttribute('aria-invalid', 'true')
    expect(messageField).toHaveFocus()
    expect(screen.getByText(/your risk report will appear here/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects an invalid link', async () => {
    const { user, messageField, urlField } = renderApp()
    await user.type(messageField, 'Invest with me today')
    await user.type(urlField, 'not a link')
    await user.click(screen.getByRole('button', { name: /analyze message/i }))

    expect(screen.getByText(/doesn't look like a web address/i)).toBeInTheDocument()
    expect(urlField).toHaveFocus()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows a loading state, then the backend report', async () => {
    let resolveRequest
    const pending = new Promise((resolve) => {
      resolveRequest = resolve
    })
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending))
    const { user, messageField, urlField } = renderApp()
    const crypto = sample('crypto-vip')

    await user.click(screen.getByRole('button', { name: crypto.label }))
    expect(messageField).toHaveValue(crypto.message)
    expect(urlField).toHaveValue(crypto.url)

    await user.click(screen.getByRole('button', { name: /analyze message/i }))
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

    resolveRequest(jsonResponse(REPORT))

    expect(await screen.findByText('Guaranteed high returns', {}, RESULT_WAIT)).toBeInTheDocument()
    const report = within(screen.getByRole('region', { name: /risk report/i }))
    expect(report.getByRole('meter', { name: /risk score/i })).toHaveAttribute('aria-valuenow', '82')
    expect(report.getByText('Critical risk')).toBeInTheDocument()
    expect(report.getByText(/guarantees 40% returns/i)).toBeInTheDocument()
    expect(screen.queryByText(/what was analyzed/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analyze message/i })).toBeEnabled()
  })

  it('submits with Ctrl+Enter from the message field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ risk_score: 5, risk_level: 'low', warnings: [] })),
    )
    const { user, messageField } = renderApp()
    await user.click(screen.getByRole('button', { name: sample('statement-notice').label }))
    await user.click(messageField)
    await user.keyboard('{Control>}{Enter}{/Control}')

    expect(await screen.findByText('Low risk', {}, RESULT_WAIT)).toBeInTheDocument()
  })

  it('can cancel an analysis in progress', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          }),
      ),
    )
    const { user } = renderApp()
    await user.click(screen.getByRole('button', { name: sample('real-estate').label }))
    await user.click(screen.getByRole('button', { name: /analyze message/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByRole('button', { name: /analyze message/i })).toBeEnabled()
    expect(screen.getByText(/your risk report will appear here/i)).toBeInTheDocument()
  })

  it('flags an outdated report and can start over', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ risk_score: 72, risk_level: 'high', warnings: [] })),
    )
    const { user, messageField } = renderApp()
    await user.click(screen.getByRole('button', { name: sample('wrong-number-stock').label }))
    await user.click(screen.getByRole('button', { name: /analyze message/i }))
    expect(await screen.findByText('High risk', {}, RESULT_WAIT)).toBeInTheDocument()
    expect(screen.queryByText(/changed the message or link/i)).not.toBeInTheDocument()

    await user.type(messageField, ' Reply STOP to opt out.')
    expect(screen.getByText(/changed the message or link/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /analyze another message/i }))
    expect(messageField).toHaveValue('')
    expect(messageField).toHaveFocus()
    expect(screen.getByText(/your risk report will appear here/i)).toBeInTheDocument()
  })
})
