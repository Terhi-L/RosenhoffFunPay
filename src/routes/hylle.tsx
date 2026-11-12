import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen, StepHeader, primaryButton } from '../components/Screen'
import productData from '../data/products.json'
import { useBasket } from '../lib/basket'
import {
  alternativeFor,
  buildAisles,
  findProduct,
  recommend,
} from '../data/shelf'
import type { CatalogProduct, ShelfProduct, ShelfProfile } from '../data/shelf'

export const Route = createFileRoute('/hylle')({ component: Shelf })

const catalog = productData as Array<CatalogProduct>
// TODO: read from the profile once /smak exists. This is the deep-link default.
const DEFAULT_PROFILE: ShelfProfile = {
  countries: ['USA', 'Canada'],
  taste: 'søtt',
}

const SIGNS = [
  'bg-alert text-white',
  'bg-leaf text-white',
  'bg-plum text-white',
  'bg-sun text-ink',
  'bg-alert text-white',
  'bg-leaf text-white',
  'bg-plum text-white',
]
const MILK_SIGN = 'bg-[#1f74a8] text-white'

/** One metre per 18 px between the middle of what you see and the product. */
const PX_PER_METRE = 18
/** Further away than this is as cold as it gets. */
const COLDEST_METRES = 200
/** Close enough to say you've found it. */
const FOUND_METRES = 4
/** The target tile starts glowing from here. */
const GLOW_METRES = 12

/** Hot-and-cold wording by distance in metres, coldest first. */
const TEMPERATURES = [
  { from: 150, label: 'Iskaldt' },
  { from: 100, label: 'Kaldt' },
  { from: 60, label: 'Kjølig' },
  { from: 30, label: 'Lunken' },
  { from: GLOW_METRES, label: 'Varm' },
  { from: FOUND_METRES, label: 'Het' },
  { from: 0, label: 'Du brenner!' },
]
const temperature = (metres: number) =>
  TEMPERATURES.find((t) => metres >= t.from) ?? TEMPERATURES[0]

function Shelf() {
  const aisles = useMemo(() => buildAisles(catalog), [])
  const recommended = useMemo(
    () => recommend(aisles, catalog, DEFAULT_PROFILE),
    [aisles],
  )
  const topPick = alternativeFor('', aisles, recommended)

  const [query, setQuery] = useState('')
  const target = useMemo(() => findProduct(aisles, query), [aisles, query])
  const { items, add, remove } = useBasket()
  const picked = useMemo(() => new Set(items.map((item) => item.slug)), [items])
  const [distance, setDistance] = useState<number | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  // Metres from the middle of what you see to the searched product.
  const measure = () => {
    const el = scroller.current
    const tile = target
      ? el?.querySelector(`[data-slug="${target.slug}"]`)
      : null
    if (!el || !tile) return setDistance(null)
    const box = el.getBoundingClientRect()
    const at = tile.getBoundingClientRect()
    setDistance(
      Math.round(
        Math.hypot(
          at.left + at.width / 2 - (box.left + box.width / 2),
          at.top + at.height / 2 - (box.top + box.height / 2),
        ) / PX_PER_METRE,
      ),
    )
  }

  // Like the store: you arrive at the bottom left, and the milk is top right.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(measure, [target])

  const toggle = (tile: ShelfProduct) => {
    if (picked.has(tile.slug)) {
      remove(tile.slug)
      return
    }
    add(
      {
        slug: tile.slug,
        name: tile.name,
        price: tile.price,
        image: tile.image ?? undefined,
      },
      { wasRecommended: recommended.includes(tile.slug) },
    )
  }

  const searchMessage = target
    ? `0 treff på «${query.trim()}». Men vi kan si om du er varm eller kald.`
    : query.trim()
      ? `0 treff på «${query.trim()}». Mente du «${topPick?.name ?? 'noe annet'}»?`
      : 'Søket er i beta. Det har vært i beta lenge.'
  const found = target && distance !== null && distance <= FOUND_METRES
  const heat =
    distance === null ? 0 : Math.max(0, 1 - distance / COLDEST_METRES)

  return (
    <Screen>
      <StepHeader step={6} back="/varer" />

      <div className="flex flex-col gap-2 px-4 pt-1 pb-2.5">
        <h1 className="m-0 mx-1 font-display text-[26px] leading-[1.1] text-plum">
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
          className="h-12 w-full rounded-full border-2 border-line-strong bg-white px-4 text-base"
        />
        <p aria-live="polite" className="m-0 mx-1.5 text-[13px] text-muted">
          {searchMessage}
        </p>
        {target && distance !== null ? (
          <div className="mx-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-[13px] font-bold">
              <span aria-live="polite" className="text-alert">
                {found
                  ? `Du er ved ${target.name}. Gratulerer.`
                  : temperature(distance).label}
              </span>
              <span className="text-plum">
                {found ? '' : `${distance} m til ${target.name}`}
              </span>
            </div>
            <div
              role="img"
              aria-label={`Temperatur: ${temperature(distance).label}`}
              className="relative h-2 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-sky), var(--color-sun), var(--color-alert))',
              }}
            >
              <span
                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-white transition-[left] duration-200"
                style={{ left: `${heat * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="m-0 mx-1 text-[13px] font-bold text-plum">
            Sveip sidelengs og opp
          </p>
        )}
      </div>

      <div
        ref={scroller}
        onScroll={measure}
        tabIndex={0}
        aria-label="Hyllene i butikken"
        className="h-[50dvh] min-h-64 flex-none overflow-auto border-y border-line-strong bg-line"
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
                        const isPicked = picked.has(tile.slug)
                        const isRecommended = recommended.includes(tile.slug)
                        if (!tile.inStock) {
                          return (
                            <div
                              key={tile.slug}
                              className="flex h-[132px] w-[84px] flex-none items-center justify-center rounded-md border border-dashed border-line-strong text-xs font-bold text-muted"
                            >
                              Tomt
                            </div>
                          )
                        }
                        return (
                          <button
                            key={tile.slug}
                            type="button"
                            data-slug={tile.slug}
                            onClick={() => toggle(tile)}
                            aria-pressed={isPicked}
                            aria-label={`${tile.name}${isRecommended ? ', anbefalt' : ''}, kr ${tile.price}`}
                            className={`relative flex h-[132px] w-[84px] flex-none flex-col rounded-md border bg-white p-1 text-left ${
                              isPicked
                                ? 'border-ink outline-[3px] outline-ink'
                                : 'border-line'
                            } ${
                              tile.slug === target?.slug &&
                              distance !== null &&
                              distance <= GLOW_METRES
                                ? 'animate-pulse ring-4 ring-alert motion-reduce:animate-none'
                                : ''
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
                                <span
                                  className="size-12 rounded-md"
                                  style={{
                                    background: tile.accent ?? '#1f74a8',
                                  }}
                                />
                              )}
                            </span>
                            <span className="line-clamp-2 text-[10px] leading-[1.15] font-bold">
                              {tile.name}
                            </span>
                            <span className="text-[11px] font-bold text-alert">
                              {tile.price} kr
                            </span>
                            {isRecommended && (
                              <span className="absolute -top-2 -left-1 rounded-full border border-ink bg-sun px-1.5 py-0.5 text-[10px] font-bold text-ink">
                                Anbefalt
                              </span>
                            )}
                            {isPicked && (
                              <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-leaf text-xs text-white">
                                ✓
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-1 h-3.5 bg-line-strong shadow-[0_3px_0_#b3a98f]" />
                  </div>
                ))}
              </section>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-mint px-4 pt-2.5 pb-7">
        <div className="flex-1 text-sm leading-[1.3]">
          <strong className="text-base">{picked.size} registrert</strong>
          <br />
          <span className="text-muted">4 i kurven</span>
        </div>
        <Link to="/hjul" className={`${primaryButton} !w-auto px-6`}>
          Til betaling
        </Link>
      </div>
    </Screen>
  )
}
