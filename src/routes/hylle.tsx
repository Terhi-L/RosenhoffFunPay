import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen, primaryButton } from '../components/Screen'
import { ArrowLeftIcon } from '../components/icons'
import productData from '../data/products.json'
import { alternativeFor, buildAisles, recommend } from '../data/shelf'
import type { CatalogProduct, ShelfProfile } from '../data/shelf'

export const Route = createFileRoute('/hylle')({ component: Shelf })

const catalog = productData as Array<CatalogProduct>
// TODO: read from the profile once /smak exists. This is the deep-link default.
const DEFAULT_PROFILE: ShelfProfile = {
  countries: ['USA', 'Canada'],
  taste: 'søtt',
}

const SIGNS = [
  'bg-flag text-white',
  'bg-store text-white',
  'bg-navy text-white',
  'bg-mustard text-ink',
  'bg-flag text-white',
  'bg-store text-white',
  'bg-navy text-white',
]
const MILK_SIGN = 'bg-[#1f74a8] text-white'

/** One metre per 18 px of scrolling left to go + shelf height still above you. */
const PX_PER_METRE = 18

function Shelf() {
  const aisles = useMemo(() => buildAisles(catalog), [])
  const recommended = useMemo(
    () => recommend(aisles, catalog, DEFAULT_PROFILE),
    [aisles],
  )
  const topPick = alternativeFor('', aisles, recommended)

  const [query, setQuery] = useState('melk')
  const [basket, setBasket] = useState<Set<string>>(new Set())
  const [distance, setDistance] = useState<number | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  const measure = () => {
    const el = scroller.current
    if (!el) return
    setDistance(
      Math.round(
        (el.scrollWidth - el.clientWidth - el.scrollLeft + el.scrollTop) /
          PX_PER_METRE,
      ),
    )
  }

  // Like the store: you arrive at the bottom left, and the milk is top right.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    measure()
  }, [])

  const toggle = (slug: string) =>
    setBasket((current) => {
      const next = new Set(current)
      if (!next.delete(slug)) next.add(slug)
      return next
    })

  const searchMessage = query.trim()
    ? `0 treff på «${query.trim()}». Mente du «${topPick?.name ?? 'noe annet'}»?`
    : 'Søket er i beta. Det har vært i beta lenge.'

  return (
    <Screen>
      <nav className="flex items-center px-3 pt-2">
        <Link
          to="/produkter"
          aria-label="Tilbake"
          className="flex size-11 items-center justify-center rounded-full text-navy"
        >
          <ArrowLeftIcon size={22} strokeWidth={2.2} />
        </Link>
      </nav>

      <div className="flex flex-col gap-2 px-4 pt-1 pb-2.5">
        <h1 className="m-0 mx-1 font-display text-[26px] leading-[1.1] text-navy">
          Plukk fra hylla
        </h1>
        <label className="sr-only" htmlFor="sok">
          Søk etter vare
        </label>
        <input
          id="sok"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Søk (beta)"
          className="h-12 w-full rounded-full border-2 border-sand-dark bg-white px-4 text-base"
        />
        <p aria-live="polite" className="m-0 mx-1.5 text-[13px] text-muted">
          {searchMessage}
        </p>
        <div className="mx-1 flex items-center justify-between text-[13px] font-bold">
          <span className="text-navy">Sveip sidelengs og opp</span>
          <span aria-live="polite" className="text-flag">
            {distance === null
              ? ''
              : distance <= 3
                ? 'Du er ved melka. Gratulerer.'
                : `${distance} m til melka`}
          </span>
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={measure}
        tabIndex={0}
        aria-label="Hyllene i butikken"
        className="h-[50dvh] min-h-64 flex-none overflow-auto border-y border-sand-dark bg-sand"
      >
        <div className="flex w-max gap-3.5 p-3">
          {aisles.map((aisle) => {
            const isMilk = aisle.no === aisles.length
            return (
              <section
                key={aisle.no}
                className="flex w-[560px] flex-none flex-col overflow-hidden rounded-[10px] bg-white"
              >
                <h2
                  className={`m-0 flex h-10 items-center px-3 text-sm font-bold ${
                    isMilk ? MILK_SIGN : SIGNS[(aisle.no - 1) % SIGNS.length]
                  }`}
                >
                  Gang {aisle.no} · {aisle.name}
                </h2>
                {aisle.shelves.map((shelf, shelfIndex) => (
                  <div
                    key={shelfIndex}
                    className="flex h-[176px] flex-col justify-end"
                  >
                    <div className="flex items-end gap-2 px-2.5">
                      {shelf.map((tile) => {
                        const picked = basket.has(tile.slug)
                        const isRecommended = recommended.includes(tile.slug)
                        if (!tile.inStock) {
                          return (
                            <div
                              key={tile.slug}
                              className="flex h-[132px] w-[84px] flex-none items-center justify-center rounded-md border border-dashed border-sand-dark text-xs font-bold text-muted"
                            >
                              Tomt
                            </div>
                          )
                        }
                        return (
                          <button
                            key={tile.slug}
                            type="button"
                            onClick={() => toggle(tile.slug)}
                            aria-pressed={picked}
                            aria-label={`${tile.name}${isRecommended ? ', anbefalt' : ''}, kr ${tile.price}`}
                            className={`relative flex h-[132px] w-[84px] flex-none flex-col rounded-md border bg-white p-1 text-left ${
                              picked
                                ? 'border-ink outline-[3px] outline-ink'
                                : 'border-sand'
                            }`}
                          >
                            <span className="flex min-h-0 flex-1 items-center justify-center">
                              {tile.image ? (
                                <img
                                  src={tile.image}
                                  alt=""
                                  loading="lazy"
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <span className="size-12 rounded-md bg-[#1f74a8]" />
                              )}
                            </span>
                            <span className="line-clamp-2 text-[10px] leading-[1.15] font-bold">
                              {tile.name}
                            </span>
                            <span className="text-[11px] font-bold text-flag">
                              {tile.price} kr
                            </span>
                            {isRecommended && (
                              <span className="absolute -top-2 -left-1 rounded-full border border-ink bg-mustard px-1.5 py-0.5 text-[10px] font-bold text-ink">
                                Anbefalt
                              </span>
                            )}
                            {picked && (
                              <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-store text-xs text-white">
                                ✓
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-1 h-3.5 bg-sand-dark shadow-[0_3px_0_#b3a98f]" />
                  </div>
                ))}
              </section>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-cream px-4 pt-2.5 pb-7">
        <div className="flex-1 text-sm leading-[1.3]">
          <strong className="text-base">{basket.size} registrert</strong>
          <br />
          <span className="text-muted">4 i kurven</span>
        </div>
        <Link to="/betaling" className={`${primaryButton} !w-auto px-6`}>
          Til betaling
        </Link>
      </div>
    </Screen>
  )
}
