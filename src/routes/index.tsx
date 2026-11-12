import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen, primaryButton } from '../components/Screen'
import {
  ArrowRightIcon,
  CardIcon,
  ExitIcon,
  ScanIcon,
  StarIcon,
} from '../components/icons'

export const Route = createFileRoute('/')({ component: Welcome })

const steps = [
  {
    icon: ScanIcon,
    title: 'Skann strekkoden',
    text: "Fra Reese's Puffs til Lucky Charms",
  },
  {
    icon: CardIcon,
    title: 'Betal i appen',
    text: 'Kort eller Vipps, lagret trygt',
  },
  {
    icon: ExitIcon,
    title: 'Gå rett ut',
    text: 'Vis kvitteringen ved døra',
  },
]

function Welcome() {
  return (
    <Screen>
      <header className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <StarIcon className="text-flag" />
          <span className="font-display text-[17px] tracking-[0.02em] text-navy">
            NORWAY AMERICANA
          </span>
        </div>
        <span className="rounded-full bg-mustard px-2 py-1 text-xs font-bold text-navy">
          9–23
        </span>
      </header>
      <p className="mx-6 mb-3 origin-left -rotate-2 font-display text-[26px] leading-[1.1] text-flag">
        Vi gjør handelen gøy!
      </p>

      <section className="relative mx-4 mt-2 overflow-hidden rounded-[20px] bg-store px-6 pt-7 pb-6 text-white">
        <StarIcon
          size={160}
          className="absolute -top-9 -right-9 text-white opacity-[0.12]"
        />
        <p className="mb-2.5 text-[13px] font-bold tracking-[0.08em] text-mustard uppercase">
          Nyhet: hurtigkasse
        </p>
        <h1 className="m-0 font-display text-[40px] leading-[1.02] tracking-[-0.01em]">
          Hopp over køen.
        </h1>
        <p className="mt-3.5 text-base leading-[1.45] text-[#e6f2ec]">
          Skann varene mens du handler, betal på mobilen og gå rett ut.
        </p>
      </section>

      <ol className="mx-4 mt-6 flex list-none flex-col gap-3 p-0">
        {steps.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-3.5 rounded-[14px] border border-sand bg-white px-4 py-3.5"
          >
            <span className="flex size-10 flex-none items-center justify-center rounded-full bg-navy text-white">
              <Icon />
            </span>
            <div>
              <p className="m-0 text-base font-bold">{title}</p>
              <p className="mt-0.5 text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex flex-col gap-3 px-4 pt-4 pb-8">
        <Link to="/telefon" className={primaryButton}>
          Registrer deg for hurtigkasse
          <ArrowRightIcon size={18} strokeWidth={2.4} />
        </Link>
        <p className="m-0 text-center text-sm text-muted">
          Tar under ett minutt ·{' '}
          <Link to="/telefon" className="font-bold text-navy underline">
            Jeg har allerede konto
          </Link>
        </p>
      </div>
    </Screen>
  )
}
