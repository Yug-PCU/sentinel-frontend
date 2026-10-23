import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('Sentinel connected to the backend', () => {
  it('posts to /analyze, explains server errors, and shows the live result on retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ detail: 'Model is still loading' }, 503))
      .mockResolvedValueOnce(
        jsonResponse({
          risk_score: 63,
          risk_level: 'High',
          warnings: [
            { title: 'Pressure to act fast', explanation: 'Says the offer ends tonight.', severity: 'medium' },
            'Unregistered seller',
          ],
        }),
      )
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/investment message/i), 'Act now: 30% monthly returns!')
    await user.type(screen.getByLabelText(/link from the message/i), 'fast-returns.example/join')
    await user.click(screen.getByRole('button', { name: /analyze message/i }))

    expect(await screen.findByRole('heading', { name: /analysis service returned an error/i })).toBeInTheDocument()
    expect(screen.getByText(/isn't available right now \(HTTP 503\)/i)).toBeInTheDocument()
    expect(screen.getByText('Model is still loading')).toBeInTheDocument()

    const [endpoint, init] = fetchMock.mock.calls[0]
    expect(endpoint).toBe('/analyze')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({
      message: 'Act now: 30% monthly returns!',
      url: 'https://fast-returns.example/join',
    })

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('Pressure to act fast')).toBeInTheDocument()
    expect(screen.getByText('Says the offer ends tonight.')).toBeInTheDocument()
    expect(screen.getByText('Unregistered seller')).toBeInTheDocument()
    expect(screen.getByText('High risk')).toBeInTheDocument()
    expect(screen.getByRole('meter', { name: /risk score/i })).toHaveAttribute('aria-valuenow', '63')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('shows a network error when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/investment message/i), 'Guaranteed returns, no risk')
    await user.click(screen.getByRole('button', { name: /analyze message/i }))

    expect(await screen.findByRole('heading', { name: /can't reach the analysis service/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
