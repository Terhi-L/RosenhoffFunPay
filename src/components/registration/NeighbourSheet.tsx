import { useEffect, useRef, useState } from 'react'
import { BottomSheet } from '../BottomSheet'
import { primaryButton } from '../Screen'
import { HomeIcon } from '../icons'
import { useRegistration } from '../../lib/registration'

type Phase = 'ask' | 'checking' | 'result'

const finePrint =
  'Naborabatten gjelder tirsdager mellom 09.00 og 09.15, på varer under 5 kr. Kan ikke kombineres med andre tilbud, eller med onsdager.'

/** "Bor du i nærheten?" – everyone lives exactly 501 m away. Canvas: Nabo. */
export function NeighbourSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { setNeighbour } = useRegistration()
  const [phase, setPhase] = useState<Phase>('ask')
  const [address, setAddress] = useState('')
  const continueButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (phase === 'checking') {
      const timer = setTimeout(() => {
        setNeighbour('nesten')
        setPhase('result')
      }, 1400)
      return () => clearTimeout(timer)
    }
    if (phase === 'result') continueButton.current?.focus()
  }, [phase, setNeighbour])

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      labelledBy="nabo-tittel"
      icon={
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-orange text-ink">
          <HomeIcon size={28} />
        </span>
      }
    >
      <div>
        <p className="m-0 text-xs font-bold tracking-[0.08em] text-alert uppercase">
          Vent, før du går videre
        </p>
        <h2
          id="nabo-tittel"
          className="mt-1.5 mb-0 font-display text-[28px] leading-[1.1] font-normal text-plum"
        >
          Bor du i nærheten?
        </h2>
        <p className="mt-2 mb-0 text-base leading-[1.45] text-muted">
          Naboer innen 500 meter fra Rosenhoffgate 3 får naborabatt.
        </p>
      </div>

      {phase === 'result' ? (
        <div className="rounded-2xl bg-fill px-4 py-3.5">
          <p className="m-0 font-display text-[22px] leading-[1.15] text-plum">
            Du bor 501 meter unna. Så nære!
          </p>
          <p className="mt-1.5 mb-0 text-sm leading-[1.45] text-muted">
            Naborabatten gjelder innen 500 meter. Vi har notert deg som
            nesten-nabo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor="adresse" className="text-sm font-bold">
            Hjemmeadresse
          </label>
          <input
            id="adresse"
            type="text"
            autoComplete="street-address"
            placeholder="F.eks. Rosenhoffgata 1"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="h-[54px] w-full min-w-0 rounded-[14px] border-2 border-line-strong bg-white px-3.5 font-sans text-[17px] text-ink outline-none placeholder:text-muted/60 focus:border-plum"
          />
        </div>
      )}

      <p className="m-0 rounded-[10px] bg-note px-3 py-2.5 text-xs leading-[1.45] text-note-ink">
        {finePrint}
      </p>

      {phase === 'result' ? (
        <button
          ref={continueButton}
          type="button"
          onClick={onClose}
          className={primaryButton}
        >
          Videre
        </button>
      ) : (
        <>
          <button
            type="button"
            aria-disabled={phase === 'checking'}
            onClick={() => phase === 'ask' && setPhase('checking')}
            className={`${primaryButton} ${phase === 'checking' ? 'opacity-70' : ''}`}
          >
            {phase === 'checking'
              ? 'Sjekker avstanden …'
              : 'Sjekk om jeg er nabo'}
          </button>
          <button
            type="button"
            onClick={() => {
              setNeighbour('nei')
              onClose()
            }}
            className="cursor-pointer self-center border-0 bg-transparent p-2.5 font-sans text-[15px] font-bold text-plum underline"
          >
            Nei takk, jeg bor langt unna
          </button>
        </>
      )}

      <p role="status" className="sr-only">
        {phase === 'checking'
          ? 'Sjekker avstanden …'
          : phase === 'result'
            ? 'Du bor 501 meter unna. Så nære!'
            : ''}
      </p>
    </BottomSheet>
  )
}
