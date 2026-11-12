# Rosenhoff FunPay – build plan

> **Ingen kasse. Bare app.** – *Vi gjør handelen gøy!*

A satirical "fast checkout" app for Norway Americana / Rosenhoff Dagligvare. Every step is designed to be *fun*, which is to say slightly worse than a cashier. This plan splits the build into three parallel tracks so **Terhi**, **Henrik** and **Ivar** can each own one part of the flow with as few merge conflicts as possible.

- **Design (source of truth):** Claude Design canvas "Norway Americana – Hurtigkasse": <https://claude.ai/code/artifact/01148f05-f409-4328-87c5-166bbd32be77> (ask Terhi for access). Each screen below gives its canvas artboard name in brackets, e.g. *[Hylle]*. The sticky notes under each artboard hold the presentation story.
- **Stack:** TanStack Start + Router (file routes) · TanStack Query · TanStack Form · Tailwind v4 · zod · React 19
- **Data:** `src/data/products.json`, 2 871 real products (`slug, name, price, image, inStock, categories`)

---

## 1. The story → screens → owners

| # | Story beat | Route | Canvas artboard | Owner |
|---|---|---|---|---|
| 1 | You arrive. The checkout is gone – use the app | `/` | Main | **Terhi** |
| 2 | Get the app, create an account (mobile, e-mail, name) | `/konto` | Telefon | **Terhi** |
| 2b | SMS code | `/kode` | Kode | **Terhi** |
| 3 | Popup: live nearby? Neighbour discount! | `/smak?nabo=1` (dialog) | Nabo | **Terhi** |
| 4 | Personalisation: countries, sweet/salty, hunger | `/smak` | Smak | **Terhi** |
| 4b | Buyer type (Pro-kunde ⓘ) + cereal gatekeeper | `/kundetype` | Kundetype | **Terhi** |
| 5 | Register what's in your basket – scanner "fails" | `/varer` | Varer | **Henrik** |
| 5b | Pick from the shelf: scroll sideways *and* up, milk furthest back, recommendations get in the way | `/hylle` | Hylle | **Henrik** |
| 6 | Spin the wheel for a discount (always lands on +15 %) | `/hjul` | Hjul | **Ivar** |
| 6b | Card details, "we double-check stock" | `/betaling` | Betaling | **Ivar** |
| 6c | Error: sold out – someone paid cash 0.4 s earlier. You're holding it. | `/utsolgt` | Feil | **Ivar** |

**Hand-off points** (the only places tracks link to each other):

```
Terhi   /kundetype ──"Fortsett til varene"──▶ /varer   Henrik
Henrik  /hylle     ──"Til betaling"────────▶ /hjul    Ivar
Ivar    /utsolgt   ──"Legg varen tilbake"──▶ /hylle   Henrik
```

---

## 2. Phase 0 – shared foundation (do first, ~1–2 h, one PR)

**Owner: Terhi**, since she owns the start page and `Screen.tsx`. Henrik and Ivar review it. They can start on the pure logic meanwhile (shelf model and wheel math, see their sections), because that doesn't touch shared files.

Merge this to `main` before anyone builds UI. After that, **nobody edits these files without a small separate PR** pinged in chat.

### 0.1 Design tokens: replace the old red/navy theme in `src/styles.css`

The current tokens (`flag`, `navy`, `store`, `mustard`, `sand`, `cream`) are the old "Christmas" look. Replace them with the fruit palette from the canvas:

```css
@theme {
  --font-sans: 'Archivo', Helvetica, Arial, sans-serif;
  --font-display: 'Archivo Black', 'Archivo', sans-serif;

  --color-leaf: #2e7d32;        /* primary buttons, selected states */
  --color-leaf-dark: #17451c;   /* headline shadow on green */
  --color-sun: #f5c02b;         /* yellow headline on green, badges, wheel CTA */
  --color-orange: #f28c28;      /* decoration, focus rings, warnings (icons only) */
  --color-orange-deep: #d35f0b; /* orange text/icon bg that passes contrast */
  --color-melon: #ef5d78;       /* decoration */
  --color-melon-deep: #d9435f;
  --color-plum: #3b2a6b;        /* headings, links, outlines */
  --color-grape: #6a4fb3;
  --color-sky: #3fa9de;
  --color-lime: #8dc63f;
  --color-alert: #b8324d;       /* "Steg 6 av 5", error kicker, fun-meter text */

  --color-mint: #f2f7f1;        /* page background */
  --color-fill: #e6efe4;        /* subtle fills, +47 box, steppers */
  --color-line: #dce6da;        /* card borders, progress track */
  --color-line-strong: #c3d1c0; /* input borders */
  --color-ink: #1b2b22;
  --color-muted: #5b6470;
  --color-note: #fff4d6;        /* fine-print box */
  --color-note-ink: #5a4300;
}
body { background: var(--color-mint); }
```

Update the existing routes and `Screen.tsx` to the new token names in the same PR so `main` keeps building.

### 0.2 Shared components (`src/components/`)

| Component | What | Used by |
|---|---|---|
| `Screen` | Swap the flag stripe for the **fruit stripe**: `linear-gradient(90deg, #F28C28 0 16.6%, #F5C02B 16.6% 33.3%, #8DC63F 33.3% 50%, #3FA9DE 50% 66.6%, #6A4FB3 66.6% 83.3%, #EF5D78 83.3% 100%)`. Default bg `bg-mint text-ink`. | all |
| `StepHeader` | `step: number`, `total = 5`, `back`. **Must allow `step > total`**: progress caps at 100 % and the counter turns `text-alert` ("Steg 6 av 5", "7 av 5", "8 av 5" is a joke). | all |
| `primaryButton` | `bg-leaf text-white rounded-2xl min-h-14` | all |
| `BottomSheet` | Accessible dialog: dim overlay, `role="dialog"`, `aria-modal`, `aria-labelledby`, focus moves in, Esc closes, focus returns. | Terhi (Nabo), Henrik (recommendation prompt) |
| `Slogan` | "Vi gjør handelen gøy!" with each word in a fruit colour (`orange-deep`, `leaf`, `grape`, `melon-deep`). | Terhi (start), Ivar (utsolgt) |
| `FruitIllustration` | The inline SVG of a pear, orange slice, watermelon, cherries and blueberries (copy it from the canvas *Main* artboard). | Terhi (start); Ivar may reuse |

### 0.3 Shared state: three slices, three owners

One file per track, so each person only edits their own. Phase 0 creates them as **typed stubs with demo defaults** and mounts them once in `__root.tsx` via `src/lib/providers.tsx`.

```ts
// src/lib/registration.tsx  — OWNER: Terhi
export interface Account { phone: string; email: string; name: string }
export type Neighbour = 'unknown' | 'nesten' | 'nei'   // "nesten" = 501 m away, so close!
export interface Profile {
  countries: Array<'USA' | 'Canada' | 'Mexico' | 'Japan' | 'Korea' | 'Australia' | 'Norge'>
  taste: 'søtt' | 'salt' | 'begge'
  hunger: number                                  // 1–10
  customerType: 'snacksjeger' | 'hjemlengsel' | 'pro' | null
  cereal: 'reese' | 'lucky' | null
}
useRegistration(): { account, setAccount, neighbour, setNeighbour }
useProfile(): { profile, setProfile }
// DEFAULT profile (used when someone deep-links): USA + Canada, søtt, hunger 8

// src/lib/basket.tsx       — OWNER: Henrik
export interface BasketItem { slug: string; name: string; price: number; image?: string; qty: number; wasRecommended: boolean; fought: boolean }
useBasket(): { items, add(p, opts), remove(slug), count, subtotal, physicalCount /* always 4 – what's "in your hand" */ }
// DEFAULT: empty; Ivar's pages fall back to a demo basket (see 3.3)

// src/lib/checkout.tsx     — OWNER: Ivar
export interface Checkout { wheelSpun: boolean; surchargePct: number /* always 15 */; soldOutSlug: string | null }
useCheckout(): { checkout, setCheckout, reset() }
```

Rules:
- **Read anyone's slice, write only your own.** Exception: Ivar calls `basket.remove(slug)` on "Legg varen tilbake på hylla".
- **Every route must work when opened directly** (fallback/demo data), so nobody is blocked by another track.
- Optional (nice for the demo): persist all three slices to `sessionStorage` (read in `useEffect` only, because SSR). Add `/?reset=1` to clear everything before a run-through.

### 0.4 Routes and file ownership

```
src/routes/
  index.tsx        Terhi    (update)
  konto.tsx        Terhi    (new – replaces telefon.tsx, delete that)
  kode.tsx         Terhi    (update)
  smak.tsx         Terhi    (new, includes Nabo dialog via ?nabo=1)
  kundetype.tsx    Terhi    (new)
  varer.tsx        Henrik   (new)
  hylle.tsx        Henrik   (new)
  hjul.tsx         Ivar     (new)
  betaling.tsx     Ivar     (rewrite)
  utsolgt.tsx      Ivar     (new – replaces ferdig.tsx, delete that)
src/components/shelf/*    Henrik
src/components/wheel/*    Ivar
src/data/shelf.ts         Henrik
```

- `routeTree.gen.ts` is **generated**. On a merge conflict, take either side and run `npm run dev` to regenerate. Never hand-merge it.
- Branches: `feat/start-registrering` (Terhi), `feat/hylle` (Henrik), `feat/betaling` (Ivar). Small PRs, rebase on `main` daily.

---

## 3. Tracks

### 3.1 Terhi – start, registration and personalisation

**Routes:** `/`, `/konto`, `/kode`, `/smak` (+ Nabo dialog), `/kundetype`
**Writes:** `registration.tsx` (account, neighbour, profile) · **Reads:** nothing

#### `/` – Kassa er lagt ned *[Main]*
- [ ] Header: orange-slice icon, "NORWAY AMERICANA" in plum, pill "Alle dager 9–23" (sun).
- [ ] `<Slogan />` large and tilted −2°.
- [ ] Green hero card: white pill "Nyhet i butikken"; H1 "Kassa er lagt ned." in `sun` with a `3px 3px 0 leaf-dark` text-shadow; body "Ikke tenk på det. Appen vår gjør alt kassa gjorde. Nesten."; `<FruitIllustration />` bleeding off the bottom.
- [ ] Three steps (orange, grape and melon icon circles): *Lag en konto* · *Plukk varene i appen* · *Betal og gå* ("Hvis alt går som det skal").
- [ ] CTA "Last ned appen og registrer deg" → `/konto`. Small print "Tar bare noen minutter · Jeg har allerede konto".

#### `/konto` – Lag en konto *[Telefon]* · Steg 1 av 5
- [ ] TanStack Form + zod: mobile (+47, 8 digits, reuse `formatPhone`), e-mail, full name. Labels, `autocomplete`, inline errors in Norwegian.
- [ ] Checkbox: "Jeg godtar vilkårene (14 sider, men de er gøy)."
- [ ] "Opprett konto" stays disabled until the form is valid → `/kode`.

#### `/kode` – SMS code *[Kode]* · Steg 2 av 5
- [ ] Keep the existing 6-digit logic and resend countdown. Restyle the focus ring to `orange`.
- [ ] Submit → `/smak?nabo=1`.

#### Nabo dialog (on `/smak` when `?nabo=1`) *[Nabo]*
- [ ] `validateSearch` with zod: `{ nabo?: boolean }`. Open a `<BottomSheet>` on load.
- [ ] Kicker "Vent, før du går videre", title "Bor du i nærheten?", body "Naboer innen 500 meter fra Rosenhoffgate 3 får naborabatt.", address field.
- [ ] Fine print (note box): "Naborabatten gjelder tirsdager mellom 09.00 og 09.15, på varer under 5 kr. Kan ikke kombineres med andre tilbud, eller med onsdager."
- [ ] "Sjekk om jeg er nabo" → short fake check, then **always** "Du bor 501 meter unna. Så nære!" → `neighbour = 'nesten'`. "Nei takk, jeg bor langt unna" → `'nei'`. Both close the sheet and drop `?nabo` from the URL (`navigate({ search: {} , replace: true })`).

#### `/smak` – La oss bli kjent *[Smak]* · Steg 3 av 5
- [ ] Country chips (multi-select, `aria-pressed`): USA, Canada, Mexico, Japan, Korea, Australia, "Norge (kjedelig)".
- [ ] Segmented control: Søtt / Salt / Begge.
- [ ] Hunger slider 1–10 with live text (`aria-live`): ≤3 "Notert. Vi anbefaler likevel snacks." · ≤7 "…ekstra snacks." · >7 "…alt."
- [ ] Intro sets up the later joke: "Vi bruker svarene til å anbefale varer til deg. Ganske mye."

#### `/kundetype` *[Kundetype]* · Steg 4 av 5
- [ ] Three cards: Snacksjeger · Hjemlengsel · **Pro-kunde** (PRO badge). An ⓘ button toggles the explanation (`aria-expanded`): "For deg som handler i større mengder: kiosk, kafé, forening, fest eller storfamilie. Du får kolli-priser, faktura til bedriften og beskjed når favorittene er tilbake på hylla." *(Benefits are placeholders – confirm with the store.)*
- [ ] Gatekeeper box: "Ett siste krav før du slipper inn – Reese's Puffs eller Lucky Charms?", with a reply per answer.
- [ ] "Fortsett til varene" stays disabled until both are answered → **`/varer` (hand-off to Henrik)**.

**Stretch:** confetti-free "Pro" upsell later in the flow. A fake progress bar on account creation that goes backwards once.

---

### 3.2 Henrik – register products and pick from the shelf

**Routes:** `/varer`, `/hylle`
**Writes:** `basket.tsx` · **Reads:** `useProfile()` for recommendations

#### Can start before Phase 0 lands: `src/data/shelf.ts`
Build the store model from `products.json`. It's pure functions with no UI, so it's easy to test.

- [ ] **Aisles (fixed order, left → right, milk always last):**
  1. Frokost (`Frokost & Søtpålegg`, `Amerikansk Frokost`)
  2. Godteri & sjokolade (`Snacks & Godteri og Sjokolade > Godteri|Sjokolade`, `Amerikanske Godteri`)
  3. Snacks (`> Chips`, `> Nøtter&Frø`)
  4. Drikke (`Drikker > Brus|Juice|Energy Drink`, `Amerikanske Drikker & Drikkemiks`)
  5. Middag (`Middagsvarer og middagstilbehør`, `Tacovarianter`, `Meksikanske Produkter`)
  6. Asia (`Japanske, Koreansk, Australske &`)
  7. Bakst & tørrvarer (`Tørrvarer > Bakevarer|Dessert|Kjeks`)
  8. **Meieri · helt bakerst.** The online catalogue has **no fresh milk**, so add one hard-coded product `{ slug: 'melk', name: 'Melk 1 l', price: <store price> }` on the **top shelf**. Fill the other shelves with e.g. `Kondensert Melk` (it exists, which is funny).
- [ ] 5 shelves per aisle (top → bottom), ~6 products per shelf, so ~240 tiles. Products with `inStock: false` render as an **empty gap labelled "Tomt"**.
- [ ] `scoreForProfile(product, profile)`: country → category (`USA → Amerikanske Produkter`, `Canada → Canadiske Produkter`, `Mexico → Meksikanske Produkter`, `Japan|Korea|Australia → Japanske, Koreansk, Australske &`), taste (`søtt → Godteri/Sjokolade/Frokost`, `salt → Chips/Nøtter`). Top-N = "Anbefalt".
- [ ] Don't ship 1.4 MB to the client: expose the aisles through a TanStack Start **server function** (`createServerFn`) and load them with TanStack Query (`ensureQueryData` in the route loader + `useSuspenseQuery`). Or precompute a trimmed `shelf.json` at build time.

#### `/varer` – Registrer varene i kurven *[Varer]* · Steg 5 av 5
- [ ] Fake viewfinder (dark box, dashed frame). The warning banner never finds a barcode.
- [ ] "Prøv å skanne igjen" increments "Forsøk N av ∞" and steps through the messages: *Fant ingen strekkode.* → *…Den fant ingen i går heller.* → *Skanneren tar en liten pause.* → *Har du prøvd å slå den av og på?* → *Skanneren er på ferie. Prøv hylla.*
- [ ] Tip card + CTA "Finn varene på hylla" → `/hylle`.
- [ ] **Stretch:** actually open the camera (`getUserMedia`) so it *looks* like it should work. It still never reads anything.

#### `/hylle` – Plukk fra hylla *[Hylle]* · **Steg 6 av 5**
- [ ] **Feels like the store:** one 2D scroll area (`overflow: auto`), aisles side by side, 5 tall shelves each. On mount, **start scrolled to the bottom-left** (`useLayoutEffect → scrollTop = scrollHeight`), so you have to scroll **sideways and up** to reach the milk at the top-right.
- [ ] Aisle sign at the top of each column, "Gang N · Navn", in rotating fruit colours. The Meieri sign is sky-blue.
- [ ] Distance counter in the header: "`{n}` m til melka", derived from the scroll position; "Du er ved melka. Gratulerer." when you get there. Hint: "Sveip sidelengs og opp".
- [ ] Product tile: coloured pack using the real `image` (`loading="lazy"`), the name, and the real price under the shelf edge. "Anbefalt" badge (sun, ink border). A check badge when it's in the basket.
- [ ] **Search that doesn't help** (`type="search"`, prefilled "melk"): always "0 treff på «q». Mente du «<top recommendation>»?". Empty: "Søket er i beta. Det har vært i beta lenge."
- [ ] **Recommendations get in the way:** tapping a recommended product adds it straight away. Tapping anything else opens a `<BottomSheet>`:
  1. "Vent litt!" – "Basert på smaksprofilen din (USA, søtt, veldig sulten) tror vi egentlig du vil ha X." → **[Bytt til X]** (big green) / *Nei, jeg vil ha Y* (small grey link)
  2. "Er du helt sikker?" – "Kunder som deg som valgte Y, angret nesten alltid. Vi sier det bare." → *Ja, Y. Helt sikker.* → adds Y with `fought: true`
  - Milk's alternative is always "Marshmallows". Build the profile text from the real `useProfile()`.
- [ ] Bottom bar: "`{count}` registrert / 4 i kurven" + "Til betaling" → **`/hjul` (hand-off to Ivar)**.
- [ ] Accessibility: the scroll area is focusable with `aria-label="Hyllene i butikken"`, tiles are real `<button>`s with labels ("Lucky Charms, anbefalt, kr 89").

**Stretch:** scroll-snap per aisle; "fun-meter" (Gøymåler) that fills as you add sugar; recommended products quietly move to eye level each time you scroll past.

---

### 3.3 Ivar – payment and the end

**Routes:** `/hjul`, `/betaling`, `/utsolgt` (delete `/ferdig`)
**Writes:** `checkout.tsx` · **Reads:** `useBasket()` (+ `remove`)
**Fallback:** if the basket is empty (deep link), use a demo basket from `products.json` by slug: a Lucky Charms, a Reese's Puffs, a Warheads and a marshmallow product. Mark Lucky Charms `fought: true`.

#### Can start before Phase 0 lands: wheel maths (`src/components/wheel/`)
- [ ] 6 equal segments, clockwise from 12 o'clock: `−50 %`, `−30 %`, `−20 %`, `−10 %`, `−5 %`, **`+15 %`** (dark segment, sun text).
- [ ] Final rotation always lands the `+15 %` centre under the pointer: `5 × 360 + (360 − 330) = 1830°`, plus a small random jitter (±20°) inside the segment so it looks real.
- [ ] `conic-gradient` disc + `transition: transform 4s cubic-bezier(.12,.8,.18,1)`. Under `prefers-reduced-motion`, jump straight to the result.

#### `/hjul` – Snurr for rabatt! *[Hjul]* · **Steg 7 av 5**
- [ ] "Alle vinner. Ett snurr per handel." Wheel with pointer. Sun-coloured button "Snurr hjulet", which shows "Snurrer…" (disabled) while spinning.
- [ ] Result card (ink bg, `aria-live`): "Gratulerer! Du vant +15 % premiumtillegg. Hjulet er helt tilfeldig. Ifølge hjulet."
- [ ] "Godta og gå videre" → `/betaling`. Spinning again isn't possible ("Du har brukt ditt ene snurr").

#### `/betaling` – Nesten ferdig *[Betaling]* · **Steg 8 av 5**
- [ ] Order summary from the basket, with **real prices**: "N varer – kr X", "Premiumtillegg (lykkehjulet) +15 %" in `alert`, then the total. Format with `Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' })`.
- [ ] Card form (TanStack Form + zod): card number (Luhn), expiry MM/ÅÅ in the future, CVC 3 digits. `autocomplete="cc-*"`. Demo test number: `4925 0000 0000 0004`.
- [ ] Info note: "Før betalingen går gjennom, dobbeltsjekker vi lagerstatus i butikken. For sikkerhets skyld."
- [ ] "Betal kr X" → processing overlay (~3 s) with rotating lines: *Kontakter butikken…* → *Teller hyllene…* → *Noen står i kassa…* → *Vent, vi har jo ikke kassa…* → navigate to `/utsolgt`.

#### `/utsolgt` – Varen er utsolgt. *[Feil]* (no step header)
- [ ] Choose the sold-out item: the **last item with `fought: true`**, otherwise the most expensive one. Save it to `checkout.soldOutSlug`.
- [ ] `role="alert"`: kicker "Betalingen ble avbrutt", H1 "Varen er utsolgt.", body "Noen kjøpte den siste {name} med kontanter 0,4 sekunder før deg."
- [ ] Product card: "På lager **0**" (alert) · "I hånda di **1**" · "Den i hånda di er ikke registrert i systemet."
- [ ] "Spørsmål? ~~Spør i kassa~~ Kassa er lagt ned."
- [ ] "Legg varen tilbake på hylla" → `basket.remove(slug)` → `/hylle`. "Prøv igjen (snurr på nytt)" → `/hjul` (lands on +15 % again, of course).
- [ ] `<Slogan />` at the bottom as the punchline.

**Stretch:** after "Prøv igjen" the *next* item sells out too; a cash-register "ka-ching" sound when the cash buyer wins.

---

## 4. Definition of done (all tracks)

- [ ] Norwegian bokmål copy as in the canvas, sentence case. App copy has no emoji.
- [ ] Mobile first: looks right at **390 × 844**, `max-w-[430px]` centred on desktop.
- [ ] Touch targets ≥ 44 px. Every input has a visible `<label>`. Icon-only buttons have `aria-label`. Dialogs trap focus.
- [ ] Text contrast ≥ 4.5:1. Orange/sky/melon are for decoration and icons only; use `orange-deep`/`plum`/`ink` for text.
- [ ] The route works when opened directly (fallback data).
- [ ] `npm run lint` and `npm run check` are clean, there are no console errors, and `npm run build` passes.

## 5. Timeline

| When | Terhi | Henrik | Ivar |
|---|---|---|---|
| Day 1 AM | **Phase 0 PR** | `shelf.ts` model + scoring | wheel maths + component |
| Day 1 PM → Day 2 | `/`, `/konto`, `/kode` | `/varer`, `/hylle` layout + scroll | `/hjul`, `/betaling` form |
| Day 2 → Day 3 | Nabo dialog, `/smak`, `/kundetype` | search + recommendation sheet | processing overlay, `/utsolgt` |
| Day 3 PM | **Integration:** walk the full flow together, fix the hand-offs, demo rehearsal | | |

## 6. Demo script (each person presents their own part)

1. **Terhi:** "You walk into Rosenhoff. No cashier. But don't worry – there's an app." Register; the neighbour discount pops up (Tuesdays 09.00–09.15). Personalise: USA, sweet, hunger 8. Pro-kunde ⓘ. Reese's or Lucky Charms.
2. **Henrik:** "You already have four things in your basket. Let's register them." The scanner fails five times. On the shelf: scroll sideways… and up… "92 m til melka". Search "melk" gives "Mente du Marshmallows?". Try to take Lucky Charms and the app argues twice.
3. **Ivar:** "Finally, payment – and a chance at a discount!" Spin, +15 %. Card. "Checking stock…" *Utsolgt.* "Someone paid cash 0.4 seconds before you." You're holding it. **Vi gjør handelen gøy!**

Before each run: open `/?reset=1`. Present from a phone, or Chrome devtools at iPhone 14 size.

## 7. Open questions

- Pro-kunde benefits and the neighbour-discount terms are invented for the satire. Is that fine to show, or should the store sign off?
- Product images are hot-linked from norwayamericana.no. OK for the demo, or should we download a handful into `public/`?
- Real fresh-milk price for the hard-coded `melk` product.
- Who presents, and do we need a slide intro? (The canvas sticky notes already hold the story per screen.)
