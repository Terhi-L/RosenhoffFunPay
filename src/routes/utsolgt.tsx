import { useEffect } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Screen, primaryButton } from '../components/Screen'
import { Slogan } from '../components/Slogan'
import { useBasket } from '../lib/basket'
import { useCheckout, useCheckoutItems } from '../lib/checkout'
import type { BasketItem } from '../lib/basket'

export const Route = createFileRoute('/utsolgt')({ component: SoldOut })

function pickSoldOut(items: Array<BasketItem>) {
  return (
    items.filter((item) => item.fought).at(-1) ??
    items.reduce((priciest, item) =>
      item.price > priciest.price ? item : priciest,
    )
  )
}

function SoldOut() {
  const navigate = useNavigate()
  const { remove } = useBasket()
  const { checkout, setCheckout } = useCheckout()
  const { items } = useCheckoutItems()
  const item =
    items.find((entry) => entry.slug === checkout.soldOutSlug) ??
    pickSoldOut(items)

  useEffect(() => {
    if (checkout.soldOutSlug !== item.slug) {
      setCheckout({ soldOutSlug: item.slug })
    }
  }, [checkout.soldOutSlug, item.slug, setCheckout])

  async function putBack() {
    await navigate({ to: '/hylle' })
    remove(item.slug)
    setCheckout({ soldOutSlug: null })
  }

  return (
    <Screen>
      <main className="flex flex-1 flex-col gap-[18px] px-6 pt-16">
        <span className="flex size-[72px] items-center justify-center rounded-[22px] bg-orange text-ink">
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3l9.5 17h-19z" />
            <path d="M12 10v4M12 17v.01" />
          </svg>
        </span>

        <div role="alert">
          <p className="m-0 text-[13px] font-bold tracking-[0.06em] text-alert uppercase">
            Betalingen ble avbrutt
          </p>
          <h1 className="mt-1.5 mb-0 font-display text-4xl leading-[1.05] text-plum">
            Varen er utsolgt.
          </h1>
          <p className="mt-2.5 mb-0 text-base leading-[1.45] text-muted">
            Noen kjøpte den siste {item.name} med kontanter 0,4 sekunder før
            deg.
          </p>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-white px-4 py-3.5">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="h-16 w-[52px] flex-none object-contain"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-16 w-[52px] flex-none items-end rounded-md bg-leaf p-[5px] text-[10px] leading-[1.1] font-bold text-white"
            >
              {item.name}
            </span>
          )}
          <div className="flex flex-1 flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span>På lager</span>
              <strong className="text-alert">0</strong>
            </div>
            <div className="flex justify-between">
              <span>I hånda di</span>
              <strong>1</strong>
            </div>
            <div className="text-xs text-muted">
              Den i hånda di er ikke registrert i systemet.
            </div>
          </div>
        </div>

        <p className="mt-1.5 mb-0 text-sm text-muted">
          Spørsmål? <s className="font-bold text-plum">Spør i kassa</s> Kassa er
          lagt ned.
        </p>
      </main>

      <div className="flex flex-col gap-2.5 px-4 pt-3 pb-5">
        <button type="button" onClick={putBack} className={primaryButton}>
          Legg varen tilbake på hylla
        </button>
        <Link
          to="/hjul"
          onClick={() => setCheckout({ wheelSpun: false })}
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl border-2 border-plum bg-white text-base font-bold text-plum no-underline"
        >
          Prøv igjen (snurr på nytt)
        </Link>
        <Slogan className="mt-1.5 text-center text-lg" />
      </div>
    </Screen>
  )
}
