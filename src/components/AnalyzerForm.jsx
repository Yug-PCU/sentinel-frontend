import { CircleAlert, Link2, LoaderCircle, Lock, RotateCcw, ScanSearch, X } from 'lucide-react'
import { MAX_MESSAGE_LENGTH } from '../config.js'
import { SAMPLE_MESSAGES } from '../data/samples.js'
import { buttonClass, CARD_CLASS } from './ui.js'

const formatCount = (count) => count.toLocaleString('en-US')

const isMac = /mac/i.test(globalThis.navigator?.userAgentData?.platform ?? globalThis.navigator?.platform ?? '')
const SHORTCUT_MODIFIER = isMac ? '⌘' : 'Ctrl'

const KBD_CLASS = 'rounded-md border border-navy-500 bg-navy-800 px-1.5 py-0.5 font-sans text-[11px] text-navy-200'

function fieldClass(hasError) {
  return [
    'block w-full rounded-xl border bg-navy-800/80 px-3.5 py-3 text-base text-navy-50 shadow-inner shadow-black/20 transition-colors placeholder:text-navy-300 focus:ring-2 focus:outline-hidden',
    hasError
      ? 'border-red-400/80 focus:border-red-400 focus:ring-red-400/30'
      : 'border-navy-400 hover:border-navy-300 focus:border-teal-400 focus:ring-teal-400/30',
  ].join(' ')
}

function FieldError({ id, children }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm text-red-300">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

export default function AnalyzerForm({
  message,
  url,
  errors,
  isLoading,
  messageRef,
  urlRef,
  onMessageChange,
  onUrlChange,
  onSubmit,
  onCancel,
  onClear,
  onSample,
}) {
  const isOverLimit = message.trim().length > MAX_MESSAGE_LENGTH
  const canClear = Boolean(message || url)

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit()
  }

  function handleMessageKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby="analyzer-heading"
      className={`${CARD_CLASS} p-5 sm:p-6`}
    >
      <h3 id="analyzer-heading" className="text-xl font-semibold tracking-tight text-white">
        Message
      </h3>
      <p className="mt-1 text-sm text-pretty text-navy-300">Paste the investment offer exactly as you received it.</p>

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="message" className="text-sm font-medium text-navy-100">
            Investment message
          </label>
          <span
            id="message-count"
            className={`text-xs tabular-nums ${isOverLimit ? 'font-semibold text-red-300' : 'text-navy-300'}`}
          >
            {formatCount(message.length)} / {formatCount(MAX_MESSAGE_LENGTH)}
          </span>
        </div>
        <textarea
          id="message"
          ref={messageRef}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={handleMessageKeyDown}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          rows={8}
          placeholder="Paste the text, email, DM, or social media post you received…"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-count message-error' : 'message-count'}
          className={`${fieldClass(errors.message)} mt-2 min-h-40 resize-y`}
        />
        {errors.message && <FieldError id="message-error">{errors.message}</FieldError>}
      </div>

      <div className="mt-4">
        <p id="samples-label" className="font-mono text-[11px] tracking-[0.16em] text-navy-300 uppercase">
          Try an example
        </p>
        <div role="group" aria-labelledby="samples-label" className="mt-2 flex flex-wrap gap-2">
          {SAMPLE_MESSAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isLoading}
              onClick={() => onSample(sample)}
              className="flex items-center gap-2 rounded-lg border border-navy-500 bg-navy-800/60 px-3 py-1.5 text-xs font-medium text-navy-200 transition-colors hover:border-teal-400/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="url" className="text-sm font-medium text-navy-100">
          Link from the message <span className="font-normal text-navy-300">(optional)</span>
        </label>
        <div className="relative mt-2">
          <Link2
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-navy-300"
            aria-hidden="true"
          />
          <input
            id="url"
            ref={urlRef}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://…"
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? 'url-error' : 'url-hint'}
            className={`${fieldClass(errors.url)} pl-10`}
          />
        </div>
        {errors.url ? (
          <FieldError id="url-error">{errors.url}</FieldError>
        ) : (
          <p id="url-hint" className="mt-2 text-xs text-navy-300">
            Copy the link instead of opening it. There's no need to visit a suspicious site.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isLoading} className={`${buttonClass('primary')} grow sm:grow-0`}>
          {isLoading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            <>
              <ScanSearch className="size-4" aria-hidden="true" />
              Analyze message
            </>
          )}
        </button>
        {isLoading ? (
          <button type="button" onClick={onCancel} className={buttonClass('secondary')}>
            <X className="size-4" aria-hidden="true" />
            Cancel
          </button>
        ) : (
          <button type="button" onClick={onClear} disabled={!canClear} className={buttonClass('ghost')}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Clear
          </button>
        )}
        {/* Hidden at lg, where the two-column form is too narrow to fit it beside the buttons. */}
        <p className="ml-auto hidden items-center gap-1 text-xs text-navy-300 sm:flex lg:hidden xl:flex">
          <kbd className={KBD_CLASS}>{SHORTCUT_MODIFIER}</kbd>+<kbd className={KBD_CLASS}>Enter</kbd>
          <span className="sr-only">to analyze</span>
        </p>
      </div>

      <p className="mt-5 flex items-start gap-2 border-t border-white/5 pt-4 text-xs text-navy-300">
        <Lock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
        Don't include passwords, card numbers, or one-time codes. Sentinel only needs the message itself.
      </p>
    </form>
  )
}
