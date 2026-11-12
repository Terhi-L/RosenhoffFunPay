import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import {
  Screen,
  StepHeader,
  StepIntro,
  primaryButton,
} from '../components/Screen'
import { formatPhone, useRegistration } from '../lib/registration'

export const Route = createFileRoute('/konto')({ component: CreateAccount })

const accountSchema = z.object({
  phone: z
    .string()
    .regex(
      /^[49]\d{7}$/,
      'Skriv et norsk mobilnummer: 8 siffer som starter på 4 eller 9.',
    ),
  email: z.email(
    'Skriv en gyldig e-postadresse, for eksempel kari@eksempel.no.',
  ),
  name: z
    .string()
    .refine(
      (name) => name.trim().split(/\s+/).length >= 2,
      'Skriv både fornavn og etternavn.',
    ),
  terms: z
    .boolean()
    .refine((accepted) => accepted, 'Du må godta vilkårene. Alle 14 sidene.'),
})

// "Creating the account" – the bar goes backwards once, for fun.
const progressSteps = [
  { value: 18, text: 'Oppretter konto …' },
  { value: 47, text: 'Oppretter konto …' },
  { value: 72, text: 'Oppretter konto …' },
  { value: 39, text: 'Oi. Litt tilbake.' },
  { value: 86, text: 'Oppretter konto …' },
  { value: 100, text: 'Konto opprettet.' },
]

const inputBase =
  'h-[54px] w-full min-w-0 rounded-[14px] border-2 bg-white px-3.5 font-sans text-[17px] font-semibold text-ink outline-none focus:border-plum'

/** First error, shown only once the person has left the field. */
function errorText(meta: { isBlurred: boolean; errors: Array<unknown> }) {
  if (!meta.isBlurred) return undefined
  const first = meta.errors[0]
  if (typeof first === 'string') return first
  return (first as { message?: string } | undefined)?.message
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null
  return (
    <p id={id} className="m-0 text-sm font-semibold text-alert">
      {text}
    </p>
  )
}

function CreateAccount() {
  const navigate = useNavigate()
  const { account, setAccount } = useRegistration()
  const [progress, setProgress] = useState<number | null>(null)

  const form = useForm({
    defaultValues: { ...account, terms: false },
    validators: { onChange: accountSchema },
    onSubmit: ({ value }) => {
      setAccount({
        phone: value.phone,
        email: value.email.trim(),
        name: value.name.trim(),
      })
      setProgress(0)
    },
  })

  useEffect(() => {
    if (progress === null) return
    const last = progress === progressSteps.length - 1
    const timer = setTimeout(
      () => (last ? navigate({ to: '/kode' }) : setProgress(progress + 1)),
      progress === 3 ? 900 : 450,
    )
    return () => clearTimeout(timer)
  }, [progress, navigate])

  return (
    <Screen>
      <StepHeader step={1} back="/" />
      <form
        noValidate
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <main className="flex flex-col gap-[18px] px-6 pt-7 pb-2">
          <StepIntro title="Lag en konto">
            Tre felt, så er du i gang. Lover.
          </StepIntro>

          <form.Field name="phone">
            {(field) => {
              const error = errorText(field.state.meta)
              return (
                <div className="flex flex-col gap-2">
                  <label htmlFor="mobil" className="text-sm font-bold">
                    Mobilnummer
                  </label>
                  <div
                    className={`flex h-[54px] items-stretch overflow-hidden rounded-[14px] border-2 bg-white focus-within:border-plum ${error ? 'border-alert' : 'border-line-strong'}`}
                  >
                    <span className="flex items-center border-r border-line bg-fill px-3.5 text-[17px] font-bold text-plum">
                      +47
                    </span>
                    <input
                      id="mobil"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="912 34 567"
                      value={formatPhone(field.state.value)}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value.replace(/\D/g, '').slice(0, 8),
                        )
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={!!error}
                      aria-describedby={error ? 'mobil-feil' : undefined}
                      className="min-w-0 flex-1 border-0 bg-transparent px-3.5 font-sans text-[17px] font-semibold text-ink outline-none placeholder:text-muted/60"
                    />
                  </div>
                  <FieldError id="mobil-feil" text={error} />
                </div>
              )
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const error = errorText(field.state.meta)
              return (
                <div className="flex flex-col gap-2">
                  <label htmlFor="epost" className="text-sm font-bold">
                    E-post
                  </label>
                  <input
                    id="epost"
                    type="email"
                    autoComplete="email"
                    placeholder="kari@eksempel.no"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'epost-feil' : undefined}
                    className={`${inputBase} placeholder:text-muted/60 ${error ? 'border-alert' : 'border-line-strong'}`}
                  />
                  <FieldError id="epost-feil" text={error} />
                </div>
              )
            }}
          </form.Field>

          <form.Field name="name">
            {(field) => {
              const error = errorText(field.state.meta)
              return (
                <div className="flex flex-col gap-2">
                  <label htmlFor="navn" className="text-sm font-bold">
                    Fullt navn
                  </label>
                  <input
                    id="navn"
                    type="text"
                    autoComplete="name"
                    placeholder="Kari Nordmann"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'navn-feil' : undefined}
                    className={`${inputBase} placeholder:text-muted/60 ${error ? 'border-alert' : 'border-line-strong'}`}
                  />
                  <FieldError id="navn-feil" text={error} />
                </div>
              )
            }}
          </form.Field>

          <form.Field name="terms">
            {(field) => {
              const error = errorText(field.state.meta)
              return (
                <div className="flex flex-col gap-2">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-[1.45]">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.checked)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={!!error}
                      aria-describedby={error ? 'vilkar-feil' : undefined}
                      className="m-0 size-[22px] flex-none accent-leaf"
                    />
                    <span>
                      Jeg godtar <strong>vilkårene</strong> (14 sider, men de er
                      gøy).
                    </span>
                  </label>
                  <FieldError id="vilkar-feil" text={error} />
                </div>
              )
            }}
          </form.Field>
        </main>

        <div className="mt-auto px-4 pt-3 pb-8">
          {progress === null ? (
            <form.Subscribe
              selector={(state) =>
                accountSchema.safeParse(state.values).success
              }
            >
              {(valid) => (
                <button
                  type="submit"
                  disabled={!valid}
                  className={primaryButton}
                >
                  Opprett konto
                </button>
              )}
            </form.Subscribe>
          ) : (
            <div className="flex min-h-14 flex-col justify-center gap-2">
              <p
                aria-live="polite"
                className={`m-0 text-sm font-bold ${progress === 3 ? 'text-alert' : 'text-plum'}`}
              >
                {progressSteps[progress].text}
              </p>
              <div
                role="progressbar"
                aria-label="Oppretter konto"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressSteps[progress].value}
                className="h-3 overflow-hidden rounded-full bg-line"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${progress === 3 ? 'bg-orange' : 'bg-leaf'}`}
                  style={{ width: `${progressSteps[progress].value}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </Screen>
  )
}
