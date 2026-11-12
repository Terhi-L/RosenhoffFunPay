import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Screen,
  StepHeader,
  StepIntro,
  primaryButton,
} from '../components/Screen'
import { ClockIcon } from '../components/icons'
import { formatPhone, useRegistration } from '../lib/registration'

export const Route = createFileRoute('/kode')({ component: Code })

const CODE_LENGTH = 6
const RESEND_SECONDS = 42

function Code() {
  const navigate = useNavigate()
  const { phone } = useRegistration()
  const [digits, setDigits] = useState<Array<string>>(
    Array(CODE_LENGTH).fill(''),
  )
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (secondsLeft === 0) return
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  function fill(from: number, value: string) {
    const typed = value.replace(/\D/g, '').slice(0, CODE_LENGTH - from)
    const next = [...digits]
    if (!typed) {
      next[from] = ''
    } else {
      typed.split('').forEach((digit, offset) => {
        next[from + offset] = digit
      })
      inputs.current[Math.min(from + typed.length, CODE_LENGTH - 1)]?.focus()
    }
    setDigits(next)
  }

  return (
    <Screen>
      <StepHeader step={2} back="/telefon" />
      <form
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          navigate({ to: '/betaling' })
        }}
      >
        <main className="flex flex-col gap-7 px-6 pt-8">
          <StepIntro title="Skriv inn koden">
            Vi har sendt en kode på 6 siffer til{' '}
            <strong className="text-ink">
              {phone ? `+47 ${formatPhone(phone)}` : 'nummeret ditt'}
            </strong>
            .{' '}
            <Link to="/telefon" className="font-bold text-navy underline">
              Endre
            </Link>
          </StepIntro>

          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 text-sm font-bold">Engangskode</legend>
            <div className="grid grid-cols-6 gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputs.current[index] = element
                  }}
                  aria-label={`Siffer ${index + 1}`}
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => fill(index, event.target.value)}
                  onPaste={(event) => {
                    event.preventDefault()
                    fill(index, event.clipboardData.getData('text'))
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !digit && index > 0) {
                      inputs.current[index - 1]?.focus()
                    }
                  }}
                  onFocus={(event) => event.target.select()}
                  className={`h-[60px] min-w-0 rounded-xl border-2 bg-white text-center text-[26px] font-bold text-navy outline-none focus:border-flag focus:shadow-[0_0_0_4px_rgba(200,16,46,0.15)] ${digit ? 'border-navy' : 'border-sand-dark'}`}
                />
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-2.5 text-sm text-muted">
            <ClockIcon size={18} />
            <span aria-live="polite">
              Ikke fått koden?{' '}
              {secondsLeft > 0 ? (
                `Send ny om 0:${String(secondsLeft).padStart(2, '0')}`
              ) : (
                <button
                  type="button"
                  onClick={() => setSecondsLeft(RESEND_SECONDS)}
                  className="cursor-pointer border-0 bg-transparent p-0 font-bold text-navy underline"
                >
                  Send ny kode
                </button>
              )}
            </span>
          </div>
        </main>

        <div className="mt-auto px-4 pt-4 pb-8">
          <button
            type="submit"
            disabled={digits.some((digit) => !digit)}
            className={primaryButton}
          >
            Bekreft
          </button>
        </div>
      </form>
    </Screen>
  )
}
