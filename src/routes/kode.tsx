import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Screen,
  StepHeader,
  StepIntro,
  primaryButton,
} from '../components/Screen'
import { ClockIcon } from '../components/icons'
import { SmsNotification } from '../components/registration/SmsNotification'
import { formatPhone, useRegistration } from '../lib/registration'
import type { Sms } from '../components/registration/SmsNotification'

export const Route = createFileRoute('/kode')({ component: Code })

const CODE_LENGTH = 6
const RESEND_SECONDS = 42
const SMS_DELAY_MS = 2200
const SMS_SHOWN_MS = 15000

function smsText(count: number, code: string) {
  if (count === 1)
    return `Koden din er ${code}. Ikke del den med noen. Ikke engang kassa, den er lagt ned.`
  if (count === 2)
    return `Ny kode: ${code}. Den forrige var også fin, men nå er den utløpt.`
  return `Kode nummer ${count}: ${code}. Vi begynner å lure litt på deg.`
}

function Code() {
  const navigate = useNavigate()
  const { phone } = useRegistration().account
  const [digits, setDigits] = useState<Array<string>>(
    Array(CODE_LENGTH).fill(''),
  )
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  // How many SMSes we've "sent"; each bump delivers a new one after a delay.
  const [sent, setSent] = useState(1)
  const [sms, setSms] = useState<Sms | null>(null)
  const [smsVisible, setSmsVisible] = useState(false)

  useEffect(() => {
    if (secondsLeft === 0) return
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  useEffect(() => {
    const timer = setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      setSms({ code, text: smsText(sent, code) })
      setSmsVisible(true)
    }, SMS_DELAY_MS)
    return () => clearTimeout(timer)
  }, [sent])

  useEffect(() => {
    if (!smsVisible) return
    const timer = setTimeout(() => setSmsVisible(false), SMS_SHOWN_MS)
    return () => clearTimeout(timer)
  }, [smsVisible, sms])

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
      <StepHeader step={2} back="/konto" />
      <form
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          navigate({ to: '/smak', search: { nabo: 1 } })
        }}
      >
        <main className="flex flex-col gap-7 px-6 pt-8">
          <StepIntro title="Skriv inn koden">
            Vi har sendt en kode på 6 siffer til{' '}
            <strong className="text-ink">
              {phone ? `+47 ${formatPhone(phone)}` : 'nummeret ditt'}
            </strong>
            .{' '}
            <Link to="/konto" className="font-bold text-plum underline">
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
                  className={`h-[60px] min-w-0 rounded-xl border-2 bg-white text-center font-sans text-[26px] font-bold text-plum outline-none focus:border-orange focus:shadow-[0_0_0_4px_rgba(242,140,40,0.25)] ${digit ? 'border-plum' : 'border-line-strong'}`}
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
                  onClick={() => {
                    setSecondsLeft(RESEND_SECONDS)
                    setSent(sent + 1)
                  }}
                  className="cursor-pointer border-0 bg-transparent p-0 font-sans text-sm font-bold text-plum underline"
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

      <SmsNotification
        sms={sms}
        visible={smsVisible}
        onTap={() => {
          if (!sms) return
          setDigits(sms.code.split(''))
          setSmsVisible(false)
          inputs.current[CODE_LENGTH - 1]?.focus()
        }}
      />
    </Screen>
  )
}
