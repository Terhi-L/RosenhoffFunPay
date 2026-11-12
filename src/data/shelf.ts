// The store model for /hylle: pure functions over the product catalogue, no UI.
import helmelk from '../assets/helmelk.webp'

export interface CatalogProduct {
  slug: string
  name: string
  price: number | null
  image: string | null
  inStock: boolean
  categories: Array<string>
}

export interface ShelfProduct {
  slug: string
  name: string
  price: number
  image: string | null
  /** false renders as an empty gap labelled "Tomt" */
  inStock: boolean
  /** placeholder colour for hard-coded products without an image */
  accent?: string
}

export interface Aisle {
  /** 1-based, left to right. Milk is always last. */
  no: number
  name: string
  /** top shelf first */
  shelves: Array<Array<ShelfProduct>>
}

/** Structural copy of `Profile` in src/lib/registration.tsx, so this file stays UI-free. */
export interface ShelfProfile {
  countries: Array<string>
  taste: 'søtt' | 'salt' | 'begge'
}

export const SHELVES_PER_AISLE = 5
export const PRODUCTS_PER_SHELF = 6
/** The catalogue has no fresh milk, so it is hard-coded. TODO: real store price. */
export const MILK_PRICE = 24

export const MILK: ShelfProduct = {
  slug: 'melk',
  name: 'Helmelk 1 l',
  price: MILK_PRICE,
  image: helmelk,
  inStock: true,
  accent: '#1f74a8',
}

/** Fresh bread isn't in the catalogue either. TODO: real price. */
export const BREAD_PRICE = 39
export const BREAD: ShelfProduct = {
  slug: 'brod',
  name: 'Brød 750 g',
  price: BREAD_PRICE,
  image: null,
  inStock: true,
  accent: '#c98a2b',
}

interface AisleDef {
  name: string
  /** category paths (this one or anything below it) */
  categories: Array<string>
  /** also claims products whose name matches, whatever their category */
  names?: RegExp
  /** a hard-coded product placed first on this shelf (0 = top) */
  fixed?: { product: ShelfProduct; shelf: number }
}

const DH = 'Dagligvare Handel'
const AM = 'Amerikanske Produkter'
const AMD = `${AM} > Amerikansk Dagligvare`
const SNACKS = `${DH} > Snacks & Godteri og Sjokolade`

// Display order, left to right. Milk (last) claims its products first.
const AISLE_DEFS: Array<AisleDef> = [
  {
    name: 'Frokost',
    categories: [`${DH} > Frokost & Søtpålegg`, `${AMD} > Amerikansk Frokost`],
    names: /cereal|cheerios|pop-?tarts|pancake|pannekake/i,
  },
  {
    name: 'Godteri & sjokolade',
    categories: [
      `${SNACKS} > Godteri`,
      `${SNACKS} > Sjokolade`,
      `${AM} > Amerikanske Godteri`,
      `${AM} > Amerikanske Sjokolade`,
      'Canadiske Produkter > Canadiske Godteri',
    ],
  },
  {
    name: 'Snacks',
    categories: [
      `${SNACKS} > Chips`,
      `${SNACKS} > Nøtter&Frø`,
      `${AM} > Amerikanske Snacks`,
    ],
  },
  {
    name: 'Drikke',
    categories: [
      `${DH} > Drikker > Brus`,
      `${DH} > Drikker > Juice`,
      `${DH} > Drikker > Energy Drink`,
      `${AM} > Amerikanske Drikker & Drikkemiks`,
      'Canadiske Produkter > Canadiske Drikker',
    ],
  },
  {
    name: 'Middag',
    categories: [
      `${DH} > Middagsvarer og middagstilbehør`,
      'Meksikanske Produkter',
      `${AMD} > Amerikansk Middagsvarer`,
    ],
  },
  {
    name: 'Asia',
    categories: ['Japanske, Koreansk, Australske &'],
  },
  {
    name: 'Bakst & tørrvarer',
    categories: [
      `${DH} > Tørrvarer > Bakevarer`,
      `${DH} > Tørrvarer > Dessert`,
      `${DH} > Tørrvarer > Kjeks`,
      `${DH} > Tørrvarer > Brød`,
      `${AMD} > Amerikansk Bakevarer`,
      `${AMD} > Amerikansk Dessert`,
      `${AMD} > Amerikansk Kjeks & Kaker`,
      'Canadiske Produkter > Canadiske Kjeks & Kaker',
    ],
    fixed: { product: BREAD, shelf: 2 },
  },
  {
    name: 'Meieri · helt bakerst',
    categories: [`${DH} > Drikker > Meierier`],
    // "Kondensert Melk" is in the catalogue, which is funny. Not "Melkesjokolade".
    names: /\bmelk\b/i,
  },
]

/** Satire anchors from the design. Placed on the shelves first when they exist. */
const FEATURED = /reese.?s puffs|lucky charms|marshmallow|warheads/i

const inCategory = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix} > `)

const matches = (def: AisleDef, product: CatalogProduct) =>
  product.categories.some((path) =>
    def.categories.some((prefix) => inCategory(path, prefix)),
  ) ||
  (def.names?.test(product.name) ?? false)

/** Stable string hash, so the shelves look the same on every load. */
function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

function toShelfProduct(product: CatalogProduct): ShelfProduct | null {
  if (product.price === null) return null
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    inStock: product.inStock,
  }
}

/**
 * Splits the catalogue into the store's aisles. Each product is shelved in one
 * aisle only; shelves are filled top to bottom, ~6 per shelf.
 */
export function buildAisles(catalog: Array<CatalogProduct>): Array<Aisle> {
  const milkIndex = AISLE_DEFS.length - 1
  const claimOrder = [
    milkIndex,
    ...AISLE_DEFS.map((_, i) => i).slice(0, milkIndex),
  ]
  const pools = AISLE_DEFS.map(() => Array<CatalogProduct>())

  for (const product of catalog) {
    const index = claimOrder.find((i) => matches(AISLE_DEFS[i], product))
    if (index !== undefined) pools[index].push(product)
  }

  const capacity = SHELVES_PER_AISLE * PRODUCTS_PER_SHELF

  return AISLE_DEFS.map((def, index) => {
    const isMilk = index === milkIndex
    const picked = pools[index]
      .filter((product) => product.price !== null && product.image)
      .sort(
        (a, b) =>
          Number(FEATURED.test(b.name)) - Number(FEATURED.test(a.name)) ||
          hash(a.slug) - hash(b.slug),
      )
      .slice(0, isMilk ? capacity - 1 : capacity)
      .map(toShelfProduct)
      .filter((product): product is ShelfProduct => product !== null)

    // Milk goes on the top shelf, furthest back in the store.
    const tiles = isMilk ? [MILK, ...picked] : picked
    const shelves = Array.from({ length: SHELVES_PER_AISLE }, (_, shelf) =>
      tiles.slice(shelf * PRODUCTS_PER_SHELF, (shelf + 1) * PRODUCTS_PER_SHELF),
    )
    if (def.fixed) {
      const { product, shelf } = def.fixed
      shelves[shelf] = [
        product,
        ...shelves[shelf].slice(0, PRODUCTS_PER_SHELF - 1),
      ]
    }
    return { no: index + 1, name: def.name, shelves }
  })
}

const COUNTRY_CATEGORIES: Record<string, string> = {
  USA: AM,
  Canada: 'Canadiske Produkter',
  Mexico: 'Meksikanske Produkter',
  Japan: 'Japanske, Koreansk, Australske &',
  Korea: 'Japanske, Koreansk, Australske &',
  Australia: 'Japanske, Koreansk, Australske &',
}

const SWEET = [
  `${SNACKS} > Godteri`,
  `${SNACKS} > Sjokolade`,
  `${AM} > Amerikanske Godteri`,
  `${AM} > Amerikanske Sjokolade`,
  `${DH} > Frokost & Søtpålegg`,
  `${AMD} > Amerikansk Frokost`,
]
const SALTY = [
  `${SNACKS} > Chips`,
  `${SNACKS} > Nøtter&Frø`,
  `${AM} > Amerikanske Snacks`,
]

/** Higher is a better fit for the profile: country 2, taste 1. */
export function scoreForProfile(
  product: CatalogProduct,
  profile: ShelfProfile,
): number {
  const has = (prefixes: Array<string>) =>
    product.categories.some((path) =>
      prefixes.some((prefix) => inCategory(path, prefix)),
    )

  const countries = profile.countries.flatMap(
    (c) => COUNTRY_CATEGORIES[c] ?? [],
  )
  let score = has(countries) ? 2 : 0
  if (profile.taste !== 'salt' && has(SWEET)) score += 1
  if (profile.taste !== 'søtt' && has(SALTY)) score += 1
  return score
}

/**
 * The "Anbefalt" products: the best fits for the profile among those on the
 * shelves and in stock. Never the milk.
 */
export function recommend(
  aisles: Array<Aisle>,
  catalog: Array<CatalogProduct>,
  profile: ShelfProfile,
  count = 4,
): Array<string> {
  const bySlug = new Map(catalog.map((product) => [product.slug, product]))
  return aisles
    .flatMap((aisle) => aisle.shelves.flat())
    .filter((tile) => tile.inStock && tile.slug !== MILK.slug)
    .flatMap((tile) => {
      const product = bySlug.get(tile.slug)
      return product ? [{ tile, score: scoreForProfile(product, profile) }] : []
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(FEATURED.test(b.tile.name)) -
          Number(FEATURED.test(a.tile.name)) ||
        hash(a.tile.slug) - hash(b.tile.slug),
    )
    .slice(0, count)
    .map(({ tile }) => tile.slug)
}

/**
 * What the app talks you into instead. Milk's alternative is always
 * marshmallows; otherwise the first recommendation that isn't the pick.
 */
export function alternativeFor(
  pickedSlug: string,
  aisles: Array<Aisle>,
  recommended: Array<string>,
): ShelfProduct | undefined {
  const tiles = aisles.flatMap((aisle) => aisle.shelves.flat())
  if (pickedSlug === MILK.slug) {
    const marshmallow = tiles.find(
      (tile) => tile.inStock && /marshmallow/i.test(tile.name),
    )
    if (marshmallow) return marshmallow
  }
  const slug = recommended.find((s) => s !== pickedSlug)
  return tiles.find((tile) => tile.slug === slug)
}

/** Lower case, and æ/ø/å typed as ae/o/a, so "brod" finds "Brød". */
const fold = (text: string) =>
  text.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')

/**
 * The product a search is after, for the hot/cold hint: names that start with
 * the query first, then words that do, then anything containing it. Shorter
 * names win ties, so "melk" finds the milk and not the milk chocolate.
 */
export function findProduct(
  aisles: Array<Aisle>,
  query: string,
): ShelfProduct | undefined {
  const q = fold(query.trim())
  if (q.length < 2) return undefined
  return aisles
    .flatMap((aisle) => aisle.shelves.flat())
    .filter((tile) => tile.inStock)
    .flatMap((tile) => {
      const name = fold(tile.name)
      const rank = name.startsWith(q)
        ? 0
        : name.split(/[^\p{L}\p{N}]+/u).some((word) => word.startsWith(q))
          ? 1
          : name.includes(q)
            ? 2
            : -1
      return rank < 0 ? [] : [{ tile, rank }]
    })
    .sort((a, b) => a.rank - b.rank || a.tile.name.length - b.tile.name.length)
    .at(0)?.tile
}
