// Endless band of scam phrases, two rows moving in opposite directions.
// Decorative: the same red flags are explained in text in the Red flags section.
const PHRASES = [
  'Guaranteed returns',
  'Act now',
  'Crypto only',
  "Don't tell your bank",
  'Wrong number',
  'VIP group',
  'Zero risk',
  'Insider tip',
  'Limited spots',
  'Double your money',
]

function Row({ reverse, outline }) {
  const items = [...PHRASES, ...PHRASES]
  return (
    <div className="flex overflow-hidden">
      <ul
        className={`flex shrink-0 items-center gap-8 pr-8 motion-reduce:animate-none ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {[...items, ...items].map((phrase, index) => (
          <li key={index} className="flex items-center gap-8 whitespace-nowrap">
            <span className={`font-display text-[clamp(2rem,6vw,5rem)] leading-none font-black uppercase font-stretch-expanded ${outline ? 'text-outline' : 'text-navy-100'}`}>
              {phrase}
            </span>
            <span className="text-3xl text-risk-critical">✕</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Marquee() {
  return (
    <div aria-hidden="true" className="relative -rotate-2 overflow-hidden border-y border-white/10 bg-navy-900/80 py-6 hover:[&_ul]:[animation-play-state:paused]">
      <Row />
      <div className="mt-4">
        <Row reverse outline />
      </div>
    </div>
  )
}
