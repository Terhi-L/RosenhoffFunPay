import { useSyncExternalStore } from 'react'

/**
 * A tiny global store held in memory. No Provider needed – create one at
 * module level in your own slice file and use its hook:
 *
 *   const basketStore = createStore({ items: [] })
 *   export const useBasketState = basketStore.useStore
 *
 * Client-side navigation keeps the state; a page refresh starts over.
 */
export function createStore<T extends object>(initial: T) {
  const listeners = new Set<() => void>()
  let state = initial

  function get() {
    return state
  }

  function set(next: T | ((previous: T) => T)) {
    state = typeof next === 'function' ? next(state) : next
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function useStore() {
    return useSyncExternalStore(subscribe, get, () => initial)
  }

  return { get, set, subscribe, useStore }
}
