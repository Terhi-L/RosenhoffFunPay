// OWNER: Terhi. Everyone may read; only the registration screens write.
import { createSessionStore } from './store'

export interface Account {
  phone: string // 8 digits, no spaces
  email: string
  name: string
}

/** "nesten" = 501 m away. So close! */
export type Neighbour = 'unknown' | 'nesten' | 'nei'

export const COUNTRIES = [
  'USA',
  'Canada',
  'Mexico',
  'Japan',
  'Korea',
  'Australia',
  'Norge',
] as const
export type Country = (typeof COUNTRIES)[number]

export type Taste = 'søtt' | 'salt' | 'begge'
export type CustomerType = 'snacksjeger' | 'hjemlengsel' | 'pro'
export type Cereal = 'reese' | 'lucky'

export interface Profile {
  countries: Array<Country>
  taste: Taste
  hunger: number // 1–10
  customerType: CustomerType | null
  cereal: Cereal | null
}

/** Used when someone deep-links past the personalisation screens. */
export const DEFAULT_PROFILE: Profile = {
  countries: ['USA', 'Canada'],
  taste: 'søtt',
  hunger: 8,
  customerType: null,
  cereal: null,
}

interface RegistrationState {
  account: Account
  neighbour: Neighbour
}

const registrationStore = createSessionStore<RegistrationState>(
  'registration',
  { account: { phone: '', email: '', name: '' }, neighbour: 'unknown' },
)

const profileStore = createSessionStore<Profile>('profile', DEFAULT_PROFILE)

function setAccount(account: Account) {
  registrationStore.set((state) => ({ ...state, account }))
}

function setNeighbour(neighbour: Neighbour) {
  registrationStore.set((state) => ({ ...state, neighbour }))
}

/** Merges the given fields into the profile. */
function setProfile(patch: Partial<Profile>) {
  profileStore.set((profile) => ({ ...profile, ...patch }))
}

export function useRegistration() {
  const { account, neighbour } = registrationStore.useStore()
  return { account, setAccount, neighbour, setNeighbour }
}

export function useProfile() {
  return { profile: profileStore.useStore(), setProfile }
}

export function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 5), digits.slice(5, 8)]
    .filter(Boolean)
    .join(' ')
}
