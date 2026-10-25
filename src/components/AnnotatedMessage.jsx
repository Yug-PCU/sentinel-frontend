import { getRiskTone } from './riskTones.js'

/** The analyzed message with each piece of evidence highlighted and linked to its warning sign. */
export default function AnnotatedMessage({ segments, located, total }) {
  return (
    <section aria-labelledby="evidence-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 id="evidence-heading" className="font-semibold text-white">
          Evidence in context
        </h4>
        <p className="text-xs text-navy-300">
          {located} of {total} quoted {total === 1 ? 'phrase' : 'phrases'} found in your message
        </p>
      </div>
      <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-white/5 bg-navy-950/60 p-4 text-sm leading-7 break-words whitespace-pre-wrap text-navy-200">
        {segments.map((segment, index) =>
          segment.mark ? (
            <mark
              key={index}
              className={`rounded-sm px-0.5 text-navy-50 underline decoration-2 underline-offset-4 ${getRiskTone(segment.mark.severity).highlight}`}
            >
              {segment.text}
              <sup className="ml-0.5 font-mono text-[10px] no-underline">
                {segment.mark.numbers.map((number, position) => (
                  <span key={number}>
                    {position > 0 && ','}
                    <a
                      href={`#finding-${number}`}
                      aria-label={`Warning sign ${number}`}
                      className="rounded-sm text-navy-100 hover:text-teal-300 focus-visible:outline-2 focus-visible:outline-teal-300"
                    >
                      {number}
                    </a>
                  </span>
                ))}
              </sup>
            </mark>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </div>
    </section>
  )
}
