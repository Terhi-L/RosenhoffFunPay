import { useBasket } from './basket'
import { demoBasket } from './demoBasket'
import { createSessionStore } from './store'

export interface Checkout {
  wheelSpun: boolean
  surchargePct: number
  soldOutSlug: string | null
}

const initialCheckout: Checkout = {
  wheelSpun: false,
  surchargePct: 15,
  soldOutSlug: null,
}

const checkoutStore = createSessionStore('checkout', initialCheckout)

function setCheckout(patch: Partial<Checkout>) {
  checkoutStore.set((checkout) => ({ ...checkout, ...patch }))
}

function reset() {
  checkoutStore.set(initialCheckout)
}

export function useCheckout() {
  return { checkout: checkoutStore.useStore(), setCheckout, reset }
}

export function useCheckoutItems() {
  const basket = useBasket()
  const items = basket.items.length > 0 ? basket.items : demoBasket
  return {
    items,
    count: items.reduce((sum, item) => sum + item.qty, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
  }
}

const nok = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
})

export function formatNok(amount: number) {
  return nok.format(amount)
}
