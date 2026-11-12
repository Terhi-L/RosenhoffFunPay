import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Screen,
  StepHeader,
  StepIntro,
  primaryButton,
} from '../components/Screen'
import { formatPhone, useRegistration } from '../lib/registration'

export const Route = createFileRoute('/telefon')({ component: Phone })

const checkbox = 'm-0 size-[22px] flex-none accent-store'
const checkboxLabel =
  'flex cursor-pointer items-start gap-3 text-sm leading-[1.45]'

function Phone() {
  const navigate = useNavigate()
  const { phone, setPhone } = useRegistration()
  const [terms, setTerms] = useState(false)

  return (
    <Screen>
      <StepHeader step={1} back="/" />
      <form
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          navigate({ to: '/kode' })
        }}
      >
        <main className="flex flex-col gap-6 px-6 pt-8">
          <StepIntro title="Hva er mobilnummeret ditt?">
            Vi sender deg en engangskode på SMS. Nummeret blir brukeren din i
            hurtigkassa.
          </StepIntro>

          <div className="flex flex-col gap-2">
            <label htmlFor="mobil" className="text-sm font-bold">
              Mobilnummer
            </label>
            <div className="flex h-14 items-stretch overflow-hidden rounded-[14px] border-2 border-navy bg-white">
              <span className="flex items-center border-r border-sand bg-[#f6f1e3] px-3.5 text-[17px] font-bold text-navy">
                +47
              </span>
              <input
                id="mobil"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="912 34 567"
                value={formatPhone(phone)}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, '').slice(0, 8))
                }
                className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-lg font-semibold text-ink outline-none placeholder:text-sand-dark"
              />
            </div>
          </div>

          <label className={checkboxLabel}>
            <input
              type="checkbox"
              checked={terms}
              onChange={(event) => setTerms(event.target.checked)}
              className={checkbox}
            />
            <span>
              Jeg godtar{' '}
              <a href="#" className="font-bold text-navy underline">
                vilkårene for hurtigkasse
              </a>{' '}
              og at Norway Americana lagrer handlehistorikken min.
            </span>
          </label>

          <label className={checkboxLabel}>
            <input type="checkbox" className={checkbox} />
            <span>
              Send meg tilbud og nyheter – nye godterier fra USA og Canada
              først.
            </span>
          </label>
        </main>

        <div className="mt-auto flex flex-col gap-3 px-4 pt-4 pb-8">
          <button
            type="submit"
            disabled={phone.length !== 8 || !terms}
            className={primaryButton}
          >
            Send kode
          </button>
          <p className="m-0 text-center text-[13px] text-muted">
            Vi deler aldri nummeret ditt med andre.
          </p>
        </div>
      </form>
    </Screen>
  )
}
