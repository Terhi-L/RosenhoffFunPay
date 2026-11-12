import { useSyncExternalStore } from 'react'

const PREFIX = 'funpay:'

/**
 * A tiny global store persisted to sessionStorage. No Provider needed – just
 * create one at module level in your own slice file and use its hook:
 *
 *   const basketStore = createSessionStore('basket', { items: [] })
 *   export const useBasketState = basketStore.useStore
 *
 * SSR-safe: the server (and the first client render) always see `initial`;
 * the stored value is applied right after hydration.
 */
export function createSessionStore<T extends object>(key: string, initial: T) {
  const storageKey = PREFIX + key
  const listeners = new Set<() => void>()
  let state = initial
  let loaded = false

  function load() {
    if (loaded || typeof window === 'undefined') return
    loaded = true
    try {
      const raw = window.sessionStorage.getItem(storageKey)
      if (raw) state = { ...initial, ...(JSON.parse(raw) as Partial<T>) }
    } catch {
      // Private mode, blocked storage or bad JSON: start fresh.
    }
  }

  function get() {
    load()
    return state
  }

  function set(next: T | ((previous: T) => T)) {
    load()
    state = typeof next === 'function' ? next(state) : next
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // Storage is a nice-to-have; the in-memory state still works.
    }
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

/** Clears every store's saved state. Reload the page afterwards. */
export function clearSessionStores() {
  try {
    Object.keys(window.sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.sessionStorage.removeItem(key))
  } catch {
    // Nothing stored, nothing to clear.
  }
}
