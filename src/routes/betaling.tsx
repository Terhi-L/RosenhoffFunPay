import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Screen,
  StepHeader,
  StepIntro,
  primaryButton,
} from '../components/Screen'
import { CardIcon, LockIcon } from '../components/icons'

export const Route = createFileRoute('/betaling')({ component: Payment })

type Method = 'vipps' | 'kort'

function Payment() {
  const [method, setMethod] = useState<Method>('vipps')

  const option = (value: Method) =>
    `flex min-h-[72px] cursor-pointer items-center gap-3.5 rounded-[14px] bg-white px-4 py-3.5 ${
      method === value ? 'border-2 border-store' : 'border border-sand-dark'
    }`
  const radio = (value: Method) => ({
    type: 'radio',
    name: 'betaling',
    checked: method === value,
    onChange: () => setMethod(value),
    className: 'm-0 size-[22px] flex-none accent-store',
  })

  return (
    <Screen>
      <StepHeader step={3} back="/kode" />
      <main className="flex flex-col gap-6 px-6 pt-8">
        <StepIntro title="Hvordan vil du betale?">
          Du belastes først når du trykker Betal i kassa. Du kan endre dette
          senere.
        </StepIntro>

        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-2 text-sm font-bold">Betalingsmåte</legend>
          <label className={option('vipps')}>
            <input {...radio('vipps')} />
            <span className="flex-1">
              <span className="block text-base font-bold">Vipps</span>
              <span className="block text-sm text-muted">
                Godkjenn hvert kjøp i Vipps
              </span>
            </span>
            <span className="rounded-full bg-mustard px-2 py-1 text-xs font-bold text-navy">
              Raskest
            </span>
          </label>
          <label className={option('kort')}>
            <input {...radio('kort')} />
            <span className="flex-1">
              <span className="block text-base font-bold">Betalingskort</span>
              <span className="block text-sm text-muted">
                Visa eller Mastercard
              </span>
            </span>
            <CardIcon size={22} className="text-navy" />
          </label>
        </fieldset>

        <div className="flex items-start gap-3 rounded-[14px] bg-[#eaf3ee] px-4 py-3.5 text-sm leading-[1.45] text-[#0b4f3a]">
          <LockIcon className="mt-px flex-none" />
          <span>
            Kortdata lagres kryptert hos betalingsleverandøren, aldri i
            butikken.
          </span>
        </div>
      </main>

      <div className="mt-auto px-4 pt-4 pb-8">
        <Link to="/ferdig" className={primaryButton}>
          Fullfør registrering
        </Link>
      </div>
    </Screen>
  )
}
