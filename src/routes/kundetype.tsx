import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Screen,
  StepHeader,
  StepIntro,
  primaryButton,
} from '../components/Screen'
import { CheckIcon, InfoIcon } from '../components/icons'
import { useProfile } from '../lib/registration'
import type { Cereal, CustomerType } from '../lib/registration'

export const Route = createFileRoute('/kundetype')({ component: BuyerType })

const verdicts: Record<Cereal | 'none', string> = {
  none: 'Det finnes ingen feil svar. Nesten.',
  reese: 'Sterkt valg. Peanøttsmør-laget ønsker deg velkommen.',
  lucky: 'Magisk valg. Marshmallow-laget jubler.',
}

const cereals: Array<{ value: Cereal; label: string }> = [
  { value: 'reese', label: "Reese's Puffs" },
  { value: 'lucky', label: 'Lucky Charms' },
]

function Check() {
  return <CheckIcon size={22} strokeWidth={3} className="flex-none text-leaf" />
}

function CardText({ title, text }: { title: React.ReactNode; text: string }) {
  return (
    <span className="flex-1">
      <span className="flex items-center gap-2 text-base font-bold">
        {title}
      </span>
      <span className="block text-sm text-muted">{text}</span>
    </span>
  )
}

const card = (on: boolean) =>
  `rounded-[14px] border-2 ${on ? 'border-leaf bg-fill' : 'border-line-strong bg-white'}`

const cardButton =
  'flex min-h-16 w-full cursor-pointer items-center gap-3.5 px-4 py-3 text-left font-sans text-ink'

function BuyerType() {
  const navigate = useNavigate()
  const { profile, setProfile } = useProfile()
  const [infoOpen, setInfoOpen] = useState(false)
  const { customerType, cereal } = profile
  const pick = (value: CustomerType) => setProfile({ customerType: value })
  const ready = customerType !== null && cereal !== null

  return (
    <Screen>
      <StepHeader step={4} back="/smak" />
      <main className="flex flex-col gap-5 px-6 pt-6 pb-2">
        <StepIntro title="Hva slags kunde er du?">
          Så vi vet hvilke favoritter vi skal ta inn mer av.
        </StepIntro>

        <div
          role="group"
          aria-label="Kundetype"
          className="flex flex-col gap-2.5"
        >
          <button
            type="button"
            aria-pressed={customerType === 'snacksjeger'}
            onClick={() => pick('snacksjeger')}
            className={`${cardButton} ${card(customerType === 'snacksjeger')}`}
          >
            <CardText title="Snacksjeger" text="Innom for godteri og brus" />
            {customerType === 'snacksjeger' && <Check />}
          </button>

          <button
            type="button"
            aria-pressed={customerType === 'hjemlengsel'}
            onClick={() => pick('hjemlengsel')}
            className={`${cardButton} ${card(customerType === 'hjemlengsel')}`}
          >
            <CardText
              title="Hjemlengsel"
              text="Jeg savner smaken av USA eller Canada"
            />
            {customerType === 'hjemlengsel' && <Check />}
          </button>

          <div className={`overflow-hidden ${card(customerType === 'pro')}`}>
            <div className="flex items-center">
              <button
                type="button"
                aria-pressed={customerType === 'pro'}
                onClick={() => pick('pro')}
                className={`${cardButton} border-0 bg-transparent pr-1`}
              >
                <CardText
                  title={
                    <>
                      Pro-kunde
                      <span className="rounded-full bg-sun px-1.5 py-0.5 text-[11px] font-bold text-plum">
                        PRO
                      </span>
                    </>
                  }
                  text="Jeg handler for flere enn meg selv"
                />
                {customerType === 'pro' && <Check />}
              </button>
              <button
                type="button"
                aria-label="Hva er en pro-kunde?"
                aria-expanded={infoOpen}
                aria-controls="pro-info"
                onClick={() => setInfoOpen(!infoOpen)}
                className="mr-2 flex size-12 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-plum"
              >
                <InfoIcon size={22} />
              </button>
            </div>
            <div
              id="pro-info"
              hidden={!infoOpen}
              className="mx-3 mb-3 rounded-[10px] bg-plum px-3.5 py-3 text-sm leading-[1.45] text-white"
            >
              <p className="m-0 mb-1.5 font-bold text-sun">
                Hva er en pro-kunde?
              </p>
              <p className="m-0">
                For deg som handler i større mengder: kiosk, kafé, forening,
                fest eller storfamilie. Du får kolli-priser, faktura til
                bedriften og beskjed når favorittene er tilbake på hylla.
              </p>
            </div>
          </div>
        </div>

        <section
          aria-labelledby="frokost-tittel"
          className="flex flex-col gap-3 rounded-[14px] border-2 border-dashed border-orange bg-white px-4 pt-3.5 pb-4"
        >
          <div>
            <p className="m-0 text-xs font-bold tracking-[0.08em] text-alert uppercase">
              Ett siste krav før du slipper inn
            </p>
            <h2
              id="frokost-tittel"
              className="mt-1 mb-0 font-display text-xl leading-[1.15] font-normal text-plum"
            >
              Reese's Puffs eller Lucky Charms?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {cereals.map(({ value, label }) => {
              const on = cereal === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setProfile({ cereal: value })}
                  className={`min-h-12 cursor-pointer rounded-full border-2 border-plum font-sans text-[15px] font-bold ${on ? 'bg-plum text-white' : 'bg-white text-plum'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p
            aria-live="polite"
            className="m-0 text-sm leading-[1.4] text-muted"
          >
            {verdicts[cereal ?? 'none']}
          </p>
        </section>
      </main>

      <div className="mt-auto px-4 pt-3 pb-8">
        <button
          type="button"
          disabled={!ready}
          title={ready ? undefined : 'Velg kundetype og svar på spørsmålet'}
          onClick={() => navigate({ to: '/varer' })}
          className={primaryButton}
        >
          Fortsett til varene
        </button>
      </div>
    </Screen>
  )
}
