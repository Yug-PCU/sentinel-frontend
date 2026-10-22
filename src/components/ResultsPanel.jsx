import {
  CircleX,
  Clock,
  Gauge,
  Hourglass,
  ListChecks,
  LoaderCircle,
  RotateCcw,
  ServerCrash,
  ShieldCheck,
  WifiOff,
} from 'lucide-react'
import { AnalysisError } from '../api/errors.js'
import { getRiskLevelInfo } from '../lib/risk.js'
import Corners from './fx/Corners.jsx'
import ScrambleText from './fx/ScrambleText.jsx'
import RiskReport from './RiskReport.jsx'
import SourceBadge from './SourceBadge.jsx'
import { buttonClass, CARD_CLASS, ICON_TILE_CLASS, LABEL_CLASS } from './ui.js'

const ERROR_COPY = {
  network: { title: "Can't reach the analysis service", icon: WifiOff },
  timeout: { title: 'The analysis took too long', icon: Hourglass },
  http: { title: 'The analysis service returned an error', icon: ServerCrash },
  invalid_response: { title: 'Unexpected response from the analysis service', icon: ServerCrash },
}
const FALLBACK_ERROR = { title: 'Something went wrong', icon: CircleX }

export default function ResultsPanel({ ref, status, result, error, isStale, onRetry, onReset }) {
  const isLoading = status === 'loading'
  // While a new analysis runs, the previous report stays visible but dimmed.
  const isRefreshing = isLoading && Boolean(result)

  return (
    <section
      ref={ref}
      aria-labelledby="results-heading"
      aria-busy={isLoading}
      className={`${CARD_CLASS} scroll-mt-24 p-5 sm:p-6`}
    >
      <Corners />
      <p className={LABEL_CLASS}>
        <span aria-hidden="true" className={`size-1.5 bg-teal-300 ${isLoading ? 'animate-blink' : ''}`} />
        Output / 02
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 id="results-heading" className="text-xl font-semibold tracking-tight text-white">
            Risk report
          </h3>
          {result && (
            <SourceBadge mock={result.source === 'mock'}>
              {result.source === 'mock' ? 'Mock result' : 'Live analysis'}
            </SourceBadge>
          )}
        </div>
        {isRefreshing ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-teal-200">
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
            Updating report…
          </p>
        ) : (
          result && (
            <p className="flex items-center gap-1.5 text-xs text-navy-300">
              <Clock className="size-3.5" aria-hidden="true" />
              <span>
                Analyzed at <time dateTime={result.analyzedAt.toISOString()}>{formatTime(result.analyzedAt)}</time>
              </span>
            </p>
          )
        )}
      </div>

      <div className="mt-5">
        {status === 'idle' && <EmptyState />}
        {isLoading && !result && <LoadingState />}
        {status === 'error' && <ErrorState error={error} onRetry={onRetry} />}
        {result && (status === 'success' || isRefreshing) && (
          <div inert={isRefreshing} className={`transition-opacity ${isRefreshing ? 'opacity-40' : ''}`}>
            <RiskReport result={result} isStale={isStale && !isRefreshing} onReset={onReset} />
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement(status, result, error)}
      </p>
    </section>
  )
}

function EmptyState() {
  const items = [
    { icon: Gauge, text: 'A risk score from 0 (low) to 100 (high)' },
    { icon: ShieldCheck, text: 'A risk category: low, medium, high, or critical' },
    { icon: ListChecks, text: 'Each warning sign, explained in plain language' },
  ]
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
      <div className={`${ICON_TILE_CLASS} size-14 rounded-2xl`}>
        <Gauge className="size-7" aria-hidden="true" />
      </div>
      <h4 className="mt-5 text-lg font-semibold text-white">Your risk report will appear here</h4>
      <p className="mt-2 max-w-sm text-sm text-navy-300">Paste a message and select Analyze. You'll get:</p>
      <ul className="mt-6 space-y-3 text-left text-sm text-navy-200">
        {items.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <Icon className="size-4 shrink-0 text-teal-300" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoadingState() {
  const pulse = 'animate-pulse rounded-md bg-navy-700/60 motion-reduce:animate-none'
  return (
    <div className="relative">
      <p className="flex items-center gap-3 text-sm font-medium text-navy-100">
        <LoaderCircle className="size-5 animate-spin text-teal-300" aria-hidden="true" />
        Analyzing message…
        <ScrambleText
          text="Scanning for red flags"
          trigger="view"
          duration={1200}
          aria-hidden="true"
          className="ml-auto hidden font-mono text-[11px] tracking-[0.16em] text-teal-200 uppercase sm:inline"
        />
      </p>
      <div aria-hidden="true" className="relative">
        {/* A scan line sweeping down over the placeholder report. */}
        <div className="pointer-events-none absolute inset-x-0 z-10 h-px animate-scan bg-linear-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_18px_2px_rgb(45_212_191/0.5)] motion-reduce:hidden" />
        <div className="mt-5 grid items-center gap-6 rounded-2xl border border-white/5 bg-navy-900/60 p-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:p-6">
          <div className={`${pulse} mx-auto aspect-[2/1] w-full max-w-60 rounded-t-full`} />
          <div className="space-y-3">
            <div className={`${pulse} h-3 w-24`} />
            <div className={`${pulse} h-8 w-36 rounded-full`} />
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-3 w-4/5`} />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-3 rounded-xl border border-white/5 bg-navy-900/60 p-4">
              <div className={`${pulse} size-5 shrink-0`} />
              <div className="flex-1 space-y-2">
                <div className={`${pulse} h-3 w-2/5`} />
                <div className={`${pulse} h-3 w-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }) {
  const { title, icon: Icon } = errorCopy(error)
  const message =
    error instanceof AnalysisError
      ? error.message
      : 'An unexpected error occurred while analyzing the message.'

  return (
    <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
      <div className="grid size-14 place-items-center rounded-2xl bg-red-400/10 text-red-300 ring-1 ring-red-400/25">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <h4 className="mt-5 text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 max-w-md text-sm text-pretty text-navy-200">{message}</p>
      {error?.detail && (
        <p className="mt-3 max-w-md rounded-lg bg-navy-950/70 px-3 py-2 font-mono text-xs break-words text-navy-300">
          {error.detail}
        </p>
      )}
      <button type="button" onClick={onRetry} className={`${buttonClass('primary')} mt-6`}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  )
}

function errorCopy(error) {
  return error instanceof AnalysisError && Object.hasOwn(ERROR_COPY, error.kind)
    ? ERROR_COPY[error.kind]
    : FALLBACK_ERROR
}

// Text for the screen reader live region.
function announcement(status, result, error) {
  if (status === 'loading') return 'Analyzing message…'
  if (status === 'error') return `Analysis failed. ${errorCopy(error).title}.`
  if (status === 'success' && result) {
    const { label } = getRiskLevelInfo(result.riskLevel)
    const count = result.warnings.length
    const prefix = result.source === 'mock' ? 'Mock result. ' : ''
    return `${prefix}Analysis complete: ${label}, score ${Math.round(result.riskScore)} out of 100, ${count} warning ${count === 1 ? 'sign' : 'signs'}.`
  }
  return ''
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
