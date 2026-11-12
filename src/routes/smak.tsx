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

/** The app's running commentary under each question. */
const verdict = 'mt-2 mb-0 text-sm font-bold text-alert empty:hidden'

const countryLabel = (country: string) =>
  country === 'Norge' ? 'Norge (kjedelig)' : country

const tastes: Array<{ value: Taste; label: string; verdict: string }> = [
  { value: 'søtt', label: 'Søtt', verdict: 'Søtt. Tannlegen din er varslet.' },
  { value: 'salt', label: 'Salt', verdict: 'Salt. Hjertet ditt er varslet.' },
  {
    value: 'begge',
    label: 'Begge',
    verdict: 'Begge. Selvfølgelig. Du er grunnen til at vi finnes.',
  },
]

// One roast per notch on the slider, 1 → 10.
const hungerVerdicts = [
  'Løgn. Ingen åpner en snacks-app mett.',
  'Mett, sier du. Det sa de forrige også.',
  'Notert og ignorert. Du får snacks likevel.',
  'Litt sulten. Det er sånn det alltid starter.',
  'Midt på treet. Lommeboka di har begynt å svette.',
  'Sulten nok til å ta dårlige valg. Vi elsker det.',
  'Nå snakker vi. Lageret er varslet.',
  'Aldri handle sulten, sier de. Vi sier ingenting.',
  'Du burde ikke slippes løs i en butikk nå. Velkommen inn.',
  'Vi har låst opp den farlige hylla. Kondolerer til kontoen din.',
]

function countryVerdict(countries: Array<string>) {
  if (countries.length === 0) return 'Ingen? Greit, da bestemmer vi.'
  if (countries.length === 1 && countries[0] === 'Norge')
    return 'Bare Norge. I en amerikansk butikk. Modig.'
  if (countries.length === COUNTRIES.length)
    return 'Alle sammen. Det er ikke smak, det er panikk.'
  return ''
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
          Svar ærlig. Alt du sier kan og vil bli brukt mot deg på hylla.
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
          <p aria-live="polite" className={verdict}>
            {countryVerdict(profile.countries)}
          </p>
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
          <p aria-live="polite" className={verdict}>
            {tastes.find(({ value }) => value === profile.taste)?.verdict}
          </p>
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
            <span>Mett (løgn)</span>
            <span>Farlig for lommeboka</span>
          </div>
          <p id="sult-svar" aria-live="polite" className={verdict}>
            {hungerVerdicts[profile.hunger - 1]}
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
