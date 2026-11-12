import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen, StepHeader, primaryButton } from '../components/Screen'

export const Route = createFileRoute('/varer')({ component: Items })

// The scanner never works. Every retry is a little cheekier.
const MESSAGES = [
  'Fant ingen strekkode.',
  'Fant ingen strekkode. Den fant ingen i går heller.',
  'Skanneren tar en liten pause.',
  'Har du prøvd å slå den av og på?',
  'Skanneren er på ferie. Prøv hylla.',
]

// What it thinks it found each time. Never a barcode, never right.
const SIGHTINGS = [
  { label: 'Ingenting (99 % sikker)', x: 30, y: 38 },
  { label: 'Fingeren din. Kr 0', x: 64, y: 62 },
  { label: 'Ligner på melk. Er ikke melk', x: 42, y: 30 },
  { label: 'Taket. Ikke til salgs', x: 70, y: 40 },
  { label: 'Deg selv. Allerede registrert', x: 36, y: 66 },
]
const SCAN_MS = 1400

const keyframes = `
@keyframes laser { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(114px) } }
@keyframes pop { 0% { transform: scale(0.9); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
`

function Items() {
  const [tries, setTries] = useState(1)
  const [scanning, setScanning] = useState(false)
  const [sighting, setSighting] = useState<(typeof SIGHTINGS)[number] | null>(
    null,
  )
  const video = useRef<HTMLVideoElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const scan = () => {
    if (scanning) return
    setScanning(true)
    setSighting(null)
    timer.current = setTimeout(() => {
      // a short buzz on phones that can; the scanner is very sorry
      if ('vibrate' in navigator) navigator.vibrate([60, 40, 60])
      setSighting(SIGHTINGS[(tries - 1) % SIGHTINGS.length])
      setTries(tries + 1)
      setScanning(false)
    }, SCAN_MS)
  }

  // Open the real camera so it looks like it should work. Nothing is ever
  // read from it. No camera or no permission just leaves the dark box.
  useEffect(() => {
    // mediaDevices is missing outside secure contexts
    if (!('mediaDevices' in navigator)) return
    let stream: MediaStream | undefined
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((media) => {
        if (cancelled) return media.getTracks().forEach((track) => track.stop())
        stream = media
        if (video.current) video.current.srcObject = media
      })
      .catch(() => {})
    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <Screen>
      <StepHeader step={5} back="/kundetype" />

      <main className="flex flex-1 flex-col gap-[18px] px-4 pt-6">
        <div className="px-2">
          <h1 className="m-0 font-display text-[30px] leading-[1.08] text-plum">
            Registrer varene i kurven
          </h1>
          <p className="mt-2 text-[15px] leading-[1.45] text-muted">
            Du har varer i kurven som ikke finnes i appen ennå. Det må vi gjøre
            noe med.
          </p>
        </div>

        <div className="relative flex h-[260px] flex-none items-center justify-center overflow-hidden rounded-[20px] bg-ink">
          <video
            ref={video}
            autoPlay
            muted
            playsInline
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
          />
          <style>{keyframes}</style>
          <div className="relative h-[120px] w-60 overflow-hidden rounded-[14px] border-[3px] border-dashed border-white/55">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 bg-alert shadow-[0_0_12px_3px_rgba(184,50,77,0.7)] motion-reduce:animate-none"
              style={{
                animation: `laser ${scanning ? 0.45 : 2.4}s ease-in-out infinite`,
              }}
            />
          </div>
          {sighting && !scanning && (
            <div
              key={tries}
              role="status"
              className="absolute -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none"
              style={{
                left: `${sighting.x}%`,
                top: `${sighting.y}%`,
                animation: 'pop 0.35s ease-out',
              }}
            >
              <span className="block h-9 w-14 rounded-md border-2 border-sun" />
              <span className="mt-1 block w-max max-w-52 rounded-full bg-sun px-2.5 py-1 text-xs font-bold text-ink">
                Fant: {sighting.label}
              </span>
            </div>
          )}
          <div className="absolute inset-x-4 top-4 flex items-center gap-2.5 rounded-xl bg-[#fff4d6] px-3 py-2.5 text-[#5a4300]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c25e0e"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="flex-none"
            >
              <path d="M12 3l9.5 17h-19z" />
              <path d="M12 10v4M12 17v.01" />
            </svg>
            <span
              aria-live="polite"
              className="text-sm leading-[1.35] font-bold"
            >
              {scanning
                ? 'Skanner… Ikke beveg deg. Eller varen.'
                : MESSAGES[Math.min(tries, MESSAGES.length) - 1]}
            </span>
          </div>
          <p className="absolute bottom-3.5 m-0 text-[13px] text-line">
            Forsøk {tries} av ∞
          </p>
        </div>

        <button
          type="button"
          onClick={scan}
          disabled={scanning}
          className="min-h-[52px] cursor-pointer rounded-2xl border-2 border-plum bg-white text-base font-bold text-plum disabled:cursor-wait disabled:opacity-60"
        >
          {scanning
            ? 'Skanner…'
            : tries > MESSAGES.length
              ? 'Prøv igjen (det hjelper ikke)'
              : 'Prøv å skanne igjen'}
        </button>

        <p className="m-0 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-sm leading-[1.45]">
          <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-[#3fa9de] text-ink">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18M7 3v18M17 3v18" />
            </svg>
          </span>
          <span>
            <strong>Tips:</strong> Finn varene på hylla i appen. Den er bygget
            akkurat som butikken.
          </span>
        </p>
      </main>

      <div className="px-4 pt-3 pb-8">
        <Link
          to="/hylle"
          className={`${primaryButton} ${tries > MESSAGES.length ? 'animate-pulse motion-reduce:animate-none' : ''}`}
        >
          Finn varene på hylla
        </Link>
      </div>
    </Screen>
  )
}
