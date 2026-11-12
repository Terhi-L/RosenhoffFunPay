import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Screen } from '../components/Screen'
import { ArrowLeftIcon } from '../components/icons'
import productData from '../data/products.json'

export const Route = createFileRoute('/produkter')({ component: Products })

interface Product {
  slug: string
  name: string
  url: string
  image: string | null
  price: number | null
  currency: string
  inStock: boolean
  categories: Array<string>
}

const products = productData as Array<Product>
const PAGE_SIZE = 40

const topCategory = (path: string) => path.split(' > ')[0]
const categories = Array.from(
  products
    .flatMap((product) => product.categories.map(topCategory))
    .reduce((counts, name) => {
      counts.set(name, (counts.get(name) ?? 0) + 1)
      return counts
    }, new Map<string, number>()),
).sort((a, b) => b[1] - a[1])

function Products() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter(
      (product) =>
        (!category ||
          product.categories.some((path) => topCategory(path) === category)) &&
        (!needle || product.name.toLowerCase().includes(needle)),
    )
  }, [query, category])

  return (
    <Screen>
      <header className="flex items-center gap-1 px-3 pt-3">
        <Link
          to="/"
          aria-label="Tilbake"
          className="flex size-11 items-center justify-center rounded-full text-navy"
        >
          <ArrowLeftIcon size={22} strokeWidth={2.2} />
        </Link>
        <h1 className="m-0 font-display text-[26px] text-navy">Produkter</h1>
      </header>

      <div className="px-4 pt-2">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setVisible(PAGE_SIZE)
          }}
          placeholder="Søk etter produkt"
          aria-label="Søk etter produkt"
          className="min-h-12 w-full rounded-[14px] border border-sand bg-white px-4 text-base"
        />
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {[null, ...categories.map(([name]) => name)].map((name) => (
            <button
              key={name ?? 'all'}
              type="button"
              onClick={() => {
                setCategory(name)
                setVisible(PAGE_SIZE)
              }}
              className={`flex-none rounded-full border px-3.5 py-2 text-sm font-bold whitespace-nowrap ${
                category === name
                  ? 'border-navy bg-navy text-white'
                  : 'border-sand bg-white text-navy'
              }`}
            >
              {name ?? 'Alle'}
            </button>
          ))}
        </div>
      </div>

      <p className="mx-4 mt-3 mb-0 text-sm text-muted">
        {matches.length} produkter
      </p>

      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-4">
        {matches.slice(0, visible).map((product) => (
          <li
            key={product.slug}
            className="flex flex-col overflow-hidden rounded-[14px] border border-sand bg-white"
          >
            <div className="flex aspect-square items-center justify-center bg-white p-2">
              {product.image && (
                <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  className={`max-h-full max-w-full object-contain ${
                    product.inStock ? '' : 'opacity-40'
                  }`}
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <p className="m-0 line-clamp-3 text-sm leading-[1.3] font-bold">
                {product.name}
              </p>
              <p className="mt-auto pt-1 text-base font-bold text-flag">
                {product.price === null ? '–' : `${product.price} kr`}
                {!product.inStock && (
                  <span className="ml-2 text-xs font-semibold text-muted">
                    Utsolgt
                  </span>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {visible < matches.length && (
        <div className="px-4 pb-8">
          <button
            type="button"
            onClick={() => setVisible(visible + PAGE_SIZE)}
            className="min-h-12 w-full rounded-[14px] border border-navy bg-white text-base font-bold text-navy"
          >
            Vis flere
          </button>
        </div>
      )}
    </Screen>
  )
}
