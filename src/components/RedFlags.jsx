import { BadgeCheck, EyeOff, Timer, TrendingUp, UserX, Wallet } from 'lucide-react'
import Corners from './fx/Corners.jsx'
import Reveal from './fx/Reveal.jsx'
import TiltCard from './fx/TiltCard.jsx'
import SectionHeader from './SectionHeader.jsx'

const EGS = [
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
    <section id="red-flags" aria-labelledby="red-flags-heading" className="scroll-mt-20 px-4 py-24 sm:px-8 xl:pl-24">
      <div className="mx-auto max-w-[96rem]">
        <SectionHeader id="red-flags-heading" index="003" eyebrow="Red flags" title="Six signs of a scam">
          <p>
            Scammers change their stories, but their tactics rarely change. If a message shows any of these, slow down
            and verify before you send anything.
          </p>
        </SectionHeader>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EGS.map(({ icon: Icon, title, text }, index) => (
            <Reveal as="li" key={title} delay={(index % 3) * 110}>
              <TiltCard className="h-full rounded-[22px] border border-white/10 bg-navy-900/70 p-7 hover:border-teal-300/40">
                <Corners className="text-teal-300/70 opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100" />
                <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-navy-300 uppercase">
                  <span>RF / 0{index + 1}</span>
                  <Icon className="size-6 text-teal-300" aria-hidden="true" />
                </div>
                <h3 className="mt-10 text-xl font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-200">{text}</p>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
