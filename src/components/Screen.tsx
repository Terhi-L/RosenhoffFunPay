import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from './icons'
import type { LinkProps } from '@tanstack/react-router'

export const primaryButton =
  'flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[14px] bg-flag text-[17px] font-bold text-white no-underline disabled:opacity-40'

export function Screen({
  className = 'bg-cream text-ink',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden font-sans ${className}`}
    >
      <div className="h-2 shrink-0 bg-[repeating-linear-gradient(90deg,var(--color-flag)_0_24px,#fff_24px_48px)]" />
      {children}
    </div>
  )
}

export function StepHeader({
  step,
  back,
}: {
  step: 1 | 2 | 3
  back: LinkProps['to']
}) {
  return (
    <>
      <nav className="flex items-center justify-between px-3 pt-3">
        <Link
          to={back}
          aria-label="Tilbake"
          className="flex size-11 items-center justify-center rounded-full text-navy"
        >
          <ArrowLeftIcon size={22} strokeWidth={2.2} />
        </Link>
        <span className="pr-3 text-sm font-bold text-navy">
          Steg {step} av 3
        </span>
      </nav>
      <div className="mx-6 mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full bg-store"
          style={{ width: `${(step / 3) * 100}%` }}
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
      <h1 className="m-0 font-display text-[32px] leading-[1.08] text-navy">
        {title}
      </h1>
      <p className="mt-2.5 text-base leading-[1.45] text-muted">{children}</p>
    </div>
  )
}
