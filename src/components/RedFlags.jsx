import { BadgeCheck, EyeOff, Timer, TrendingUp, UserX, Wallet } from 'lucide-react'
import Reveal from './fx/Reveal.jsx'
import SectionHeader from './SectionHeader.jsx'
import { CONTAINER_CLASS, ICON_TILE_CLASS } from './ui.js'

const RED_FLAGS = [
  {
    icon: TrendingUp,
    title: 'Guaranteed high returns',
    text: 'Promises like "double your money" or "a guaranteed 30% a month." Every real investment carries risk.',
  },
  {
    icon: Timer,
    title: 'Pressure to act now',
    text: '"Only 3 spots left" or "the offer ends tonight" is meant to stop you from checking the details.',
  },
  {
    icon: Wallet,
    title: 'Unusual ways to pay',
    text: 'Requests for crypto, gift cards, or wire transfers to a personal account. These payments are hard to trace or reverse.',
  },
  {
    icon: UserX,
    title: 'Contact out of nowhere',
    text: 'A stranger, a "wrong number" text, or a new online friend who steers the conversation toward investing.',
  },
  {
    icon: EyeOff,
    title: 'Secrecy and exclusivity',
    text: '"Keep this between us" or "don\'t tell your bank." Legitimate firms never ask you to hide an investment.',
  },
  {
    icon: BadgeCheck,
    title: "Credentials you can't verify",
    text: "Firms or advisers your financial regulator has no record of, and look-alike websites or apps that aren't in official stores.",
  },
]

export default function RedFlags() {
  return (
    <section id="red-flags" aria-labelledby="red-flags-heading" className={`${CONTAINER_CLASS} scroll-mt-20 py-20`}>
      <SectionHeader id="red-flags-heading" eyebrow="Red flags" title="Six signs of a scam">
        <p>
          Scammers change their stories, but their tactics rarely change. If a message shows any of these, slow down
          and verify before you send anything.
        </p>
      </SectionHeader>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RED_FLAGS.map(({ icon: Icon, title, text }, index) => (
          <Reveal
            as="li"
            key={title}
            delay={(index % 3) * 80}
            className="rounded-2xl border border-white/10 bg-navy-900/70 p-6 transition-colors hover:border-teal-300/40"
          >
            <div className={`${ICON_TILE_CLASS} size-10`}>
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-200">{text}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
