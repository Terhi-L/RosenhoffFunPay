import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import {
  Screen,
  StepHeader,
  StepIntro,
  primaryButton,
} from '../components/Screen'
import { NeighbourSheet } from '../components/registration/NeighbourSheet'
import { COUNTRIES, useProfile } from '../lib/registration'
import type { Taste } from '../lib/registration'

export const Route = createFileRoute('/smak')({
  // ?nabo=1 opens the neighbour-discount popup on arrival.
  validateSearch: z.object({ nabo: z.coerce.boolean().optional() }),
  component: TasteProfile,
})

const countryLabel = (country: string) =>
  country === 'Norge' ? 'Norge (kjedelig)' : country

const tastes: Array<{ value: Taste; label: string }> = [
  { value: 'søtt', label: 'Søtt' },
  { value: 'salt', label: 'Salt' },
  { value: 'begge', label: 'Begge' },
]

function hungerText(hunger: number) {
  if (hunger <= 3) return 'Notert. Vi anbefaler likevel snacks.'
  if (hunger <= 7) return 'Notert. Vi anbefaler ekstra snacks.'
  return 'Notert. Vi anbefaler alt.'
}

function TasteProfile() {
  const { nabo } = Route.useSearch()
  const navigate = useNavigate()
  const { profile, setProfile } = useProfile()

  return (
    <Screen>
      <StepHeader step={3} back="/kode" />
      <main className="flex flex-col gap-6 px-6 pt-6 pb-2">
        <StepIntro title="La oss bli kjent">
          Vi bruker svarene til å anbefale varer til deg. Ganske mye.
        </StepIntro>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2.5 text-base font-bold">
            Hvilke land smaker du helst på?
          </legend>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((country) => {
              const on = profile.countries.includes(country)
              return (
                <button
                  key={country}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setProfile({
                      countries: on
                        ? profile.countries.filter((c) => c !== country)
                        : [...profile.countries, country],
                    })
                  }
                  className={`min-h-11 cursor-pointer rounded-full border-2 px-4 font-sans text-[15px] font-bold ${
                    on
                      ? 'border-plum bg-plum text-white'
                      : 'border-line-strong bg-white text-plum'
                  }`}
                >
                  {countryLabel(country)}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2.5 text-base font-bold">
            Søtt eller salt?
          </legend>
          <div className="grid grid-cols-3 overflow-hidden rounded-[14px] border-2 border-plum bg-white">
            {tastes.map(({ value, label }) => {
              const on = profile.taste === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setProfile({ taste: value })}
                  className={`min-h-12 cursor-pointer border-0 font-sans text-[15px] font-bold text-ink ${on ? 'bg-sun' : 'bg-white'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="sult" className="text-base font-bold">
            Hvor sulten er du akkurat nå?
          </label>
          <input
            id="sult"
            type="range"
            min={1}
            max={10}
            value={profile.hunger}
            onChange={(event) =>
              setProfile({ hunger: Number(event.target.value) })
            }
            aria-describedby="sult-svar"
            className="h-8 w-full accent-orange"
          />
          <div
            aria-hidden="true"
            className="flex justify-between text-[13px] text-muted"
          >
            <span>Mett</span>
            <span>Kan spise en hel hylle</span>
          </div>
          <p
            id="sult-svar"
            aria-live="polite"
            className="m-0 text-sm font-bold text-alert"
          >
            {hungerText(profile.hunger)}
          </p>
        </div>
      </main>

      <div className="mt-auto px-4 pt-3 pb-8">
        <Link to="/kundetype" className={primaryButton}>
          Fortsett
        </Link>
      </div>

      <NeighbourSheet
        open={!!nabo}
        onClose={() => navigate({ to: '/smak', search: {}, replace: true })}
      />
    </Screen>
  )
}
