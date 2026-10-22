import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'
import { SAMPLE_MESSAGES } from './data/samples.js'

// Mock results arrive after MOCK_DELAY_MS (1.2 s), so wait a little longer than that.
const RESULT_WAIT = { timeout: 4000 }

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

describe('Sentinel in mock mode (default)', () => {
  it('says it is using mock data', () => {
    renderApp()
    expect(screen.getByText('Mock data')).toBeInTheDocument()
    expect(screen.getByText(/your risk report will appear here/i)).toBeInTheDocument()
  })

  it('asks for a message before analyzing', async () => {
    const { user, messageField } = renderApp()
    await user.click(screen.getByRole('button', { name: /analyze message/i }))

    expect(screen.getByText(/paste the message you want to check/i)).toBeInTheDocument()
    expect(messageField).toHaveAttribute('aria-invalid', 'true')
    expect(messageField).toHaveFocus()
    expect(screen.getByText(/your risk report will appear here/i)).toBeInTheDocument()
  })

  it('rejects an invalid link', async () => {
    const { user, messageField, urlField } = renderApp()
    await user.type(messageField, 'Invest with me today')
    await user.type(urlField, 'not a link')
    await user.click(screen.getByRole('button', { name: /analyze message/i }))

    expect(screen.getByText(/doesn't look like a web address/i)).toBeInTheDocument()
    expect(urlField).toHaveFocus()
  })

  it('shows a loading state, then a clearly labeled mock report', async () => {
    const { user, messageField, urlField } = renderApp()
    const crypto = sample('crypto-vip')

    await user.click(screen.getByRole('button', { name: crypto.label }))
    expect(messageField).toHaveValue(crypto.message)
    expect(urlField).toHaveValue(crypto.url)

    await user.click(screen.getByRole('button', { name: /analyze message/i }))
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

    expect(await screen.findByText(/mock result — not a real analysis/i, {}, RESULT_WAIT)).toBeInTheDocument()
    const report = within(screen.getByRole('region', { name: /risk report/i }))
    expect(report.getByText('Mock result')).toBeInTheDocument()
    expect(report.getByRole('meter', { name: /risk score/i })).toHaveAttribute('aria-valuenow', '94')
    expect(report.getByText('Critical risk')).toBeInTheDocument()
    expect(report.getByText('Guaranteed high returns')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analyze message/i })).toBeEnabled()
  })

  it('submits with Ctrl+Enter from the message field', async () => {
    const { user, messageField } = renderApp()
    await user.click(screen.getByRole('button', { name: sample('statement-notice').label }))
    await user.click(messageField)
    await user.keyboard('{Control>}{Enter}{/Control}')

    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled()
    expect(await screen.findByText('Low risk', {}, RESULT_WAIT)).toBeInTheDocument()
  })

  it('can cancel an analysis in progress', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('button', { name: sample('real-estate').label }))
    await user.click(screen.getByRole('button', { name: /analyze message/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByRole('button', { name: /analyze message/i })).toBeEnabled()
    expect(screen.getByText(/your risk report will appear here/i)).toBeInTheDocument()
  })

  it('flags an outdated report and can start over', async () => {
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
