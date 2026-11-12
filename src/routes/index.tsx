import { useEffect } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen, primaryButton } from '../components/Screen'
import { Slogan } from '../components/Slogan'
import { FruitIllustration } from '../components/FruitIllustration'
import {
  ArrowRightIcon,
  CardIcon,
  ExitIcon,
  OrangeSliceIcon,
  ScanIcon,
} from '../components/icons'
import { clearSessionStores } from '../lib/store'

export const Route = createFileRoute('/')({ component: Welcome })

const steps = [
  {
    icon: ScanIcon,
    color: 'bg-orange-deep',
    title: 'Lag en konto',
    text: 'Og fortell oss litt om deg selv',
  },
  {
    icon: CardIcon,
    color: 'bg-grape',
    title: 'Plukk varene i appen',
    text: 'Akkurat som i butikken, bare på mobilen',
  },
  {
    icon: ExitIcon,
    color: 'bg-melon-deep',
    title: 'Betal og gå',
    text: 'Hvis alt går som det skal',
  },
]

function Welcome() {
  // Open /?reset=1 before a demo run to forget everything from the last one.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('reset')) {
      clearSessionStores()
      window.location.replace('/')
    }
  }, [])

  return (
    <Screen>
      <header className="flex items-center justify-between px-6 pt-[18px] pb-1.5">
        <div className="flex items-center gap-2">
          <OrangeSliceIcon />
          <span className="font-display text-[17px] tracking-[0.02em] text-plum">
            NORWAY AMERICANA
          </span>
        </div>
        <span className="rounded-full bg-sun px-[9px] py-1 text-xs font-bold text-ink">
          Alle dager 9–23
        </span>
      </header>

      <Slogan className="mx-6 mt-1.5 mb-3.5 origin-left -rotate-2 text-[28px]" />

      <section className="mx-4 flex flex-col overflow-hidden rounded-3xl bg-leaf px-[22px] pt-6 text-white">
        <p className="m-0 mb-2.5 self-start rounded-full bg-white px-2.5 py-1 text-xs font-bold tracking-[0.08em] text-ink uppercase">
          Nyhet i butikken
        </p>
        <h1 className="m-0 font-display text-[42px] leading-[1.02] text-sun [text-shadow:3px_3px_0_var(--color-leaf-dark)]">
          Kassa er lagt ned.
        </h1>
        <p className="mt-3 mb-0 text-base leading-[1.45]">
          Ikke tenk på det. Appen vår gjør alt kassa gjorde. Nesten.
        </p>
        <FruitIllustration className="-mx-1.5 mt-2.5 -mb-1.5 block" />
      </section>

      <ol className="mx-4 mt-[18px] mb-0 flex list-none flex-col gap-2.5 p-0">
        {steps.map(({ icon: Icon, color, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-white px-4 py-3"
          >
            <span
              className={`flex size-10 flex-none items-center justify-center rounded-full text-white ${color}`}
            >
              <Icon />
            </span>
            <div>
              <p className="m-0 text-base font-bold">{title}</p>
              <p className="mt-0.5 mb-0 text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex flex-col gap-3 px-4 pt-3.5 pb-[30px]">
        <Link to="/konto" className={primaryButton}>
          Last ned appen og registrer deg
          <ArrowRightIcon size={18} strokeWidth={2.4} />
        </Link>
        <p className="m-0 text-center text-sm text-muted">
          Tar bare noen minutter ·{' '}
          <Link to="/konto" className="font-bold text-plum underline">
            Jeg har allerede konto
          </Link>
        </p>
      </div>
    </Screen>
  )
}
