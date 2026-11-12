import { createSessionStore } from './store'

export interface BasketItem {
  slug: string
  name: string
  price: number
  image?: string
  qty: number
  wasRecommended: boolean
  fought: boolean
}

type BasketProduct = Pick<BasketItem, 'slug' | 'name' | 'price' | 'image'>

const basketStore = createSessionStore<{ items: Array<BasketItem> }>('basket', {
  items: [],
})

function add(
  product: BasketProduct,
  options?: { wasRecommended?: boolean; fought?: boolean },
) {
  basketStore.set(({ items }) => {
    const existing = items.find((item) => item.slug === product.slug)
    if (existing) {
      return {
        items: items.map((item) =>
          item === existing ? { ...item, qty: item.qty + 1 } : item,
        ),
      }
    }
    return {
      items: [
        ...items,
        {
          ...product,
          qty: 1,
          wasRecommended: options?.wasRecommended ?? false,
          fought: options?.fought ?? false,
        },
      ],
    }
  })
}

function remove(slug: string) {
  basketStore.set(({ items }) => ({
    items: items.filter((item) => item.slug !== slug),
  }))
}

export function useBasket() {
  const { items } = basketStore.useStore()
  return {
    items,
    add,
    remove,
    count: items.reduce((sum, item) => sum + item.qty, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    physicalCount: 4,
  }
}
