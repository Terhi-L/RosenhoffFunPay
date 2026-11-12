import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen } from '../components/Screen'
import { CheckIcon, PinIcon, ScanIcon, StarIcon } from '../components/icons'

export const Route = createFileRoute('/ferdig')({ component: Done })

function Done() {
  return (
    <Screen className="bg-store text-white">
      <StarIcon
        size={300}
        className="absolute top-[60px] -right-[90px] text-white opacity-[0.08]"
      />

      <main className="relative flex flex-1 flex-col items-start gap-5 px-7 pt-24">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-mustard text-navy">
          <CheckIcon size={36} strokeWidth={3} />
        </span>
        <p className="mt-2 mb-0 origin-left -rotate-2 font-display text-[22px] text-mustard">
          Vi gjør handelen gøy!
        </p>
        <h1 className="m-0 font-display text-[44px] leading-[1.02] tracking-[-0.01em]">
          Du er klar for hurtigkasse.
        </h1>
        <p className="m-0 text-[17px] leading-[1.45] text-[#e6f2ec]">
          Ta en kurv, skann varene med mobilen og betal når du er ferdig. Ingen
          kø, ingen stress.
        </p>

        <div className="mt-3 flex w-full items-center gap-3 rounded-[14px] border border-white/20 bg-white/10 px-4 py-3.5">
          <PinIcon size={22} className="flex-none" />
          <span className="text-sm leading-[1.4]">
            <strong>Rosenhoffgate 3, Oslo</strong>
            <br />
            Åpent alle dager 9–23
          </span>
        </div>
      </main>

      <div className="relative px-4 pt-4 pb-8">
        <Link
          to="/"
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-[14px] bg-white text-[17px] font-bold text-navy no-underline"
        >
          <ScanIcon />
          Start handelen
        </Link>
      </div>
    </Screen>
  )
}
