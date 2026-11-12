import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen, StepHeader, primaryButton } from '../components/Screen'
import { Wheel } from '../components/wheel/Wheel'
import {
  SPIN_MS,
  WINNING_INDEX,
  landingRotation,
  randomJitter,
} from '../components/wheel/segments'
import { useCheckout } from '../lib/checkout'

export const Route = createFileRoute('/hjul')({ component: WheelPage })

const spinButton =
  'min-h-14 w-full cursor-pointer rounded-2xl border-0 bg-sun text-[17px] font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60'

function WheelPage() {
  const { checkout, setCheckout } = useCheckout()
  const [spinRotation, setSpinRotation] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const done = checkout.wheelSpun
  const spinning = spinRotation !== null && !done
  const rotation = spinRotation ?? (done ? landingRotation(WINNING_INDEX) : 0)

  useEffect(() => () => clearTimeout(timer.current), [])

  function spin() {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    setSpinRotation(landingRotation(WINNING_INDEX, randomJitter()))
    timer.current = setTimeout(
      () => setCheckout({ wheelSpun: true }),
      reducedMotion ? 0 : SPIN_MS + 200,
    )
  }

  return (
    <Screen>
      <StepHeader step={7} back="/hylle" />

      <main className="flex flex-1 flex-col items-center gap-4 px-6 pt-5">
        <div className="self-stretch">
          <h1 className="m-0 font-display text-[30px] leading-[1.08] text-plum">
            Snurr for rabatt!
          </h1>
          <p className="mt-2 mb-0 text-[15px] leading-[1.45] text-muted">
            Alle vinner. Ett snurr per handel.
          </p>
        </div>

        <Wheel rotation={rotation} animate={spinRotation !== null} />

        <div aria-live="polite" className="self-stretch">
          {done && (
            <div className="rounded-2xl bg-ink px-4 py-3.5 text-white">
              <p className="m-0 text-[13px] font-bold text-sun">Gratulerer!</p>
              <p className="mt-1 mb-0 text-[17px] font-bold">
                Du vant +15 % premiumtillegg.
              </p>
              <p className="mt-1 mb-0 text-[13px] text-line">
                Hjulet er helt tilfeldig. Ifølge hjulet.
              </p>
            </div>
          )}
        </div>
      </main>

      <div className="flex flex-col gap-2.5 px-4 pt-3 pb-8">
        {done ? (
          <>
            <Link to="/betaling" className={primaryButton}>
              Godta og gå videre
            </Link>
            <p className="m-0 text-center text-[13px] text-muted">
              Du har brukt ditt ene snurr.
            </p>
          </>
        ) : (
          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            className={spinButton}
          >
            {spinning ? 'Snurrer…' : 'Snurr hjulet'}
          </button>
        )}
      </div>
    </Screen>
  )
}
