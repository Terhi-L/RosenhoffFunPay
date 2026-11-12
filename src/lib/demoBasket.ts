import productData from '../data/products.json'
import type { BasketItem } from './basket'

interface CatalogueProduct {
  slug: string
  name: string
  price: number | null
  image: string | null
}

const catalogue = productData as Array<CatalogueProduct>

const DEMO_SLUGS = [
  'reeses-puffs-cereal-326g-canada',
  'warheads-extreme-sour-chewy-peg-bag-127g',
  'marshmallow-vanilla-fluff-75-oz-213gusa',
]

const luckyCharms: BasketItem = {
  slug: 'lucky-charms',
  name: 'Lucky Charms',
  price: 119,
  qty: 1,
  wasRecommended: false,
  fought: true,
}

export const demoBasket: Array<BasketItem> = [
  luckyCharms,
  ...DEMO_SLUGS.flatMap((slug) => {
    const product = catalogue.find((entry) => entry.slug === slug)
    if (!product || product.price === null) return []
    return [
      {
        slug,
        name: product.name,
        price: product.price,
        image: product.image ?? undefined,
        qty: 1,
        wasRecommended: false,
        fought: false,
      },
    ]
  }),
]
