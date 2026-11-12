import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen, primaryButton } from '../components/Screen'
import { ArrowLeftIcon } from '../components/icons'

export const Route = createFileRoute('/varer')({ component: Items })

// The scanner never works. Every retry is a little cheekier.
const MESSAGES = [
  'Fant ingen strekkode.',
  'Fant ingen strekkode. Den fant ingen i går heller.',
  'Skanneren tar en liten pause.',
  'Har du prøvd å slå den av og på?',
  'Skanneren er på ferie. Prøv hylla.',
]

function Items() {
  const [tries, setTries] = useState(1)

  return (
    <Screen>
      <nav className="flex items-center justify-between px-3 pt-3">
        <Link
          to="/"
          aria-label="Tilbake"
          className="flex size-11 items-center justify-center rounded-full text-navy"
        >
          <ArrowLeftIcon size={22} strokeWidth={2.2} />
        </Link>
        <span className="pr-3 text-sm font-bold text-navy">Steg 5 av 5</span>
      </nav>
      <div className="mx-6 mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
        <div className="h-full w-full bg-store" />
      </div>

      <main className="flex flex-1 flex-col gap-[18px] px-4 pt-6">
        <div className="px-2">
          <h1 className="m-0 font-display text-[30px] leading-[1.08] text-navy">
            Registrer varene i kurven
          </h1>
          <p className="mt-2 text-[15px] leading-[1.45] text-muted">
            Du har varer i kurven som ikke finnes i appen ennå. Det må vi gjøre
            noe med.
          </p>
        </div>

        <div className="relative flex h-[260px] flex-none items-center justify-center overflow-hidden rounded-[20px] bg-ink">
          <div className="h-[120px] w-60 rounded-[14px] border-[3px] border-dashed border-white/55" />
          <div className="absolute inset-x-4 top-4 flex items-center gap-2.5 rounded-xl bg-[#fff4d6] px-3 py-2.5 text-[#5a4300]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c25e0e"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="flex-none"
            >
              <path d="M12 3l9.5 17h-19z" />
              <path d="M12 10v4M12 17v.01" />
            </svg>
            <span
              aria-live="polite"
              className="text-sm leading-[1.35] font-bold"
            >
              {MESSAGES[Math.min(tries, MESSAGES.length) - 1]}
            </span>
          </div>
          <p className="absolute bottom-3.5 m-0 text-[13px] text-sand">
            Forsøk {tries} av ∞
          </p>
        </div>

        <button
          type="button"
          onClick={() => setTries(tries + 1)}
          className="min-h-[52px] rounded-2xl border-2 border-navy bg-white text-base font-bold text-navy"
        >
          Prøv å skanne igjen
        </button>

        <p className="m-0 flex items-center gap-3 rounded-2xl border border-sand bg-white px-4 py-3.5 text-sm leading-[1.45]">
          <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-[#3fa9de] text-ink">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18M7 3v18M17 3v18" />
            </svg>
          </span>
          <span>
            <strong>Tips:</strong> Finn varene på hylla i appen. Den er bygget
            akkurat som butikken.
          </span>
        </p>
      </main>

      <div className="px-4 pt-3 pb-8">
        <Link to="/hylle" className={primaryButton}>
          Finn varene på hylla
        </Link>
      </div>
    </Screen>
  )
}
