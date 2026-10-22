import { useRef, useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis.js'
import { validateAnalysisInput } from '../lib/validation.js'
import AnalyzerForm from './AnalyzerForm.jsx'
import ResultsPanel from './ResultsPanel.jsx'
import SectionHeader from './SectionHeader.jsx'

// On narrow screens the report sits below the form, so bring it into view when analysis starts.
function revealResults(element) {
  if (!element) return
  const { top } = element.getBoundingClientRect()
  if (top >= 0 && top < window.innerHeight * 0.6) return
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

export default function Analyzer() {
  const [message, setMessage] = useState('')
  const [url, setUrl] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const analysis = useAnalysis()
  const messageRef = useRef(null)
  const urlRef = useRef(null)
  const resultsRef = useRef(null)

  // The report is stale once the form no longer matches what was analyzed.
  const { result } = analysis
  const current = result ? validateAnalysisInput({ message, url }).values : null
  const isStale = Boolean(result) && (current.message !== result.input.message || current.url !== result.input.url)

  function handleSubmit() {
    const { values, errors } = validateAnalysisInput({ message, url })
    setFieldErrors(errors ?? {})
    if (errors) {
      const firstInvalid = errors.message ? messageRef.current : urlRef.current
      firstInvalid?.focus()
      return
    }
    analysis.analyze(values)
    revealResults(resultsRef.current)
  }

  function handleMessageChange(value) {
    setMessage(value)
    if (fieldErrors.message) setFieldErrors((previous) => ({ ...previous, message: undefined }))
  }

  function handleUrlChange(value) {
    setUrl(value)
    if (fieldErrors.url) setFieldErrors((previous) => ({ ...previous, url: undefined }))
  }

  function handleSample(sample) {
    setMessage(sample.message)
    setUrl(sample.url ?? '')
    setFieldErrors({})
  }

  function handleStartOver() {
    analysis.reset()
    setMessage('')
    setUrl('')
    setFieldErrors({})
    messageRef.current?.focus()
  }

  return (
    <section id="analyze" aria-labelledby="analyze-heading" className="scroll-mt-20 px-4 pt-16 pb-24 sm:px-8 xl:pl-24">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader id="analyze-heading" index="001" eyebrow="Analyze" title="Scan a message">
          <p>
            Paste the message below, plus its link if it has one. You'll get a 0–100 risk score and an explanation of
            every warning sign.
          </p>
        </SectionHeader>
      </div>
      <div className="mx-auto mt-10 grid max-w-[96rem] gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <AnalyzerForm
            message={message}
            url={url}
            errors={fieldErrors}
            isLoading={analysis.status === 'loading'}
            messageRef={messageRef}
            urlRef={urlRef}
            onMessageChange={handleMessageChange}
            onUrlChange={handleUrlChange}
            onSubmit={handleSubmit}
            onCancel={analysis.cancel}
            onClear={handleStartOver}
            onSample={handleSample}
          />
        </div>
        <div className="lg:col-span-7">
          <ResultsPanel
            ref={resultsRef}
            status={analysis.status}
            result={result}
            error={analysis.error}
            isStale={isStale}
            onRetry={analysis.retry}
            onReset={handleStartOver}
          />
        </div>
      </div>
    </section>
  )
}
