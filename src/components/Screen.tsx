import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from './icons'
import type { LinkProps } from '@tanstack/react-router'

export const primaryButton =
  'flex min-h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-0 bg-leaf px-4 text-[17px] font-bold text-white no-underline disabled:cursor-not-allowed disabled:opacity-40'

const fruitStripe =
  'linear-gradient(90deg, #F28C28 0 16.6%, #F5C02B 16.6% 33.3%, #8DC63F 33.3% 50%, #3FA9DE 50% 66.6%, #6A4FB3 66.6% 83.3%, #EF5D78 83.3% 100%)'

export function Screen({
  className = 'bg-mint text-ink',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden font-sans ${className}`}
    >
      <div
        aria-hidden="true"
        className="h-2 shrink-0"
        style={{ background: fruitStripe }}
      />
      {children}
    </div>
  )
}

/**
 * `step` may be larger than `total` on purpose ("Steg 7 av 5"): the bar
 * caps at 100 % and the counter turns red.
 */
export function StepHeader({
  step,
  total = 5,
  back,
}: {
  step: number
  total?: number
  back: LinkProps['to']
}) {
  const over = step > total
  return (
    <>
      <nav className="flex items-center justify-between px-3 pt-3">
        <Link
          to={back}
          aria-label="Tilbake"
          className="flex size-11 items-center justify-center rounded-full text-plum"
        >
          <ArrowLeftIcon size={22} strokeWidth={2.2} />
        </Link>
        <span
          className={`pr-3 text-sm font-bold ${over ? 'text-alert' : 'text-plum'}`}
        >
          Steg {step} av {total}
        </span>
      </nav>
      <div className="mx-6 mt-2 h-1.5 shrink-0 overflow-hidden rounded-full bg-line">
        <div
          className="h-full bg-leaf"
          style={{ width: `${Math.min(step / total, 1) * 100}%` }}
        />
      </div>
    </>
  )
}

export function StepIntro({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className="m-0 font-display text-[32px] leading-[1.08] text-plum">
        {title}
      </h1>
      <p className="mt-2 mb-0 text-base leading-[1.45] text-muted">
        {children}
      </p>
    </div>
  )
}
