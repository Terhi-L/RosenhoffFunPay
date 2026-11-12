import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Screen, StepHeader, primaryButton } from '../components/Screen'
import {
  expiryError,
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
} from '../lib/card'
import { formatNok, useCheckout, useCheckoutItems } from '../lib/checkout'

export const Route = createFileRoute('/betaling')({ component: Payment })

const cardSchema = z.object({
  number: z
    .string()
    .refine(isValidCardNumber, 'Skriv inn et gyldig kortnummer.'),
  expiry: z.string().superRefine((value, context) => {
    const message = expiryError(value)
    if (message) context.addIssue({ code: 'custom', message })
  }),
  cvc: z.string().regex(/^\d{3}$/, 'CVC er 3 siffer.'),
})

const PROCESSING_LINES = [
  'Kontakter butikken…',
  'Teller hyllene…',
  'Noen står i kassa…',
  'Vent, vi har jo ikke kassa…',
]
const LINE_MS = 800

const label = 'text-sm font-bold'
const input =
  'h-[54px] min-w-0 rounded-[14px] border-2 bg-white px-3.5 text-[17px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted focus:border-plum'
const errorText = 'm-0 text-[13px] font-bold text-alert'

function Payment() {
  const navigate = useNavigate()
  const { checkout } = useCheckout()
  const { count, subtotal } = useCheckoutItems()
  const total = subtotal * (1 + checkout.surchargePct / 100)
  const [line, setLine] = useState<number | null>(null)
  const processing = line !== null

  const form = useForm({
    defaultValues: { number: '', expiry: '', cvc: '' },
    validators: { onSubmit: cardSchema },
    onSubmit: () => setLine(0),
  })

  useEffect(() => {
    if (line === null) return
    const timer = setTimeout(() => {
      if (line === PROCESSING_LINES.length - 1) {
        navigate({ to: '/utsolgt' })
      } else {
        setLine(line + 1)
      }
    }, LINE_MS)
    return () => clearTimeout(timer)
  }, [line, navigate])

  return (
    <Screen>
      <StepHeader step={8} back="/hjul" />
      <form
        noValidate
        inert={processing}
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <main className="flex flex-col gap-4 px-6 pt-5">
          <h1 className="m-0 font-display text-[30px] leading-[1.08] text-plum">
            Nesten ferdig
          </h1>

          <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px]">
            <div className="flex justify-between gap-3">
              <span>
                {count} {count === 1 ? 'vare' : 'varer'}
              </span>
              <span>{formatNok(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3 font-bold text-alert">
              <span>Appgebyr (lykkehjulet)</span>
              <span>+{checkout.surchargePct} %</span>
            </div>
            <div className="my-1 h-px bg-line" />
            <div className="flex justify-between gap-3 text-[17px] font-bold">
              <span>Totalt</span>
              <span>{formatNok(total)}</span>
            </div>
          </div>

          <form.Field name="number">
            {(field) => {
              const error = field.state.meta.errors[0]?.message
              return (
                <div className="flex flex-col gap-2">
                  <label htmlFor="kort" className={label}>
                    Kortnummer
                  </label>
                  <input
                    id="kort"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(formatCardNumber(event.target.value))
                    }
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(error)}
                    aria-describedby="kort-hjelp"
                    className={`${input} ${error ? 'border-alert' : 'border-line-strong'}`}
                  />
                  <div id="kort-hjelp" className="flex flex-col gap-1">
                    {error && <p className={errorText}>{error}</p>}
                    <p className="m-0 text-[13px] text-muted">
                      Testkort: 4925 0000 0000 0004
                    </p>
                  </div>
                </div>
              )
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="expiry">
              {(field) => {
                const error = field.state.meta.errors[0]?.message
                return (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="utlop" className={label}>
                      Utløpsdato
                    </label>
                    <input
                      id="utlop"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM / ÅÅ"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(formatExpiry(event.target.value))
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'utlop-feil' : undefined}
                      className={`${input} ${error ? 'border-alert' : 'border-line-strong'}`}
                    />
                    {error && (
                      <p id="utlop-feil" className={errorText}>
                        {error}
                      </p>
                    )}
                  </div>
                )
              }}
            </form.Field>

            <form.Field name="cvc">
              {(field) => {
                const error = field.state.meta.errors[0]?.message
                return (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="cvc" className={label}>
                      CVC
                    </label>
                    <input
                      id="cvc"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value.replace(/\D/g, '').slice(0, 3),
                        )
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'cvc-feil' : undefined}
                      className={`${input} ${error ? 'border-alert' : 'border-line-strong'}`}
                    />
                    {error && (
                      <p id="cvc-feil" className={errorText}>
                        {error}
                      </p>
                    )}
                  </div>
                )
              }}
            </form.Field>
          </div>

          <div className="flex items-start gap-2.5 rounded-[14px] bg-fill px-3.5 py-3 text-[13px] leading-[1.45] text-leaf-dark">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className="mt-px flex-none"
            >
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 11v6M12 7.5v.01" />
            </svg>
            <span>
              Før betalingen går gjennom, dobbeltsjekker vi lagerstatus i
              butikken. For sikkerhets skyld.
            </span>
          </div>
        </main>

        <div className="mt-auto px-4 pt-4 pb-8">
          <button type="submit" className={primaryButton}>
            Betal {formatNok(total)}
          </button>
        </div>
      </form>

      {processing && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink/80 px-6">
          <div
            role="status"
            className="flex w-full max-w-[340px] flex-col items-center gap-4 rounded-2xl bg-white px-6 py-8 text-center"
          >
            <span
              aria-hidden="true"
              className="size-10 animate-spin rounded-full border-4 border-line border-t-leaf motion-reduce:animate-none"
            />
            <p className="m-0 text-[17px] font-bold text-plum">
              {PROCESSING_LINES[line]}
            </p>
          </div>
        </div>
      )}
    </Screen>
  )
}
