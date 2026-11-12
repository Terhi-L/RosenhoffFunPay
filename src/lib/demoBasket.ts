import { MILK } from '../data/shelf'
import type { BasketItem } from './basket'

export const demoBasket: Array<BasketItem> = [
  {
    slug: MILK.slug,
    name: MILK.name,
    price: MILK.price,
    image: MILK.image ?? undefined,
    qty: 1,
    wasRecommended: false,
    fought: true,
  },
]
