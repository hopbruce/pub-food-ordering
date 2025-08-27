# The Pub — Food Ordering (Next.js + TypeScript + Tailwind)

A complete, opinionated **pub food ordering** website. Browse the menu, add to basket, enter your table number, and place an order. Orders are saved and an SMS is sent to the kitchen via Twilio.

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind
- **Backend:** Next API routes with JSON file persistence (`data/orders.json`, `data/settings.json`)
- **SMS:** Twilio SDK (env vars)
- **Tooling:** ESLint + Prettier + Vitest (unit) + Playwright (e2e)
- **Deploy:** Vercel (frontend+API) or Node host; for persistent storage use Railway/Render (or plug a DB)

## Quick start

```bash
npm i
npm run dev
```

Then open http://localhost:3000 — add some items and checkout.

> By default, orders are stored in `data/orders.json` and the Kitchen is **open** with a 10% service charge. Toggle these in `/admin`.

## Environment variables

Create `.env.local` (for dev) or `.env`:

```
# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=+1xxxxxxxxxx
ORDER_SMS_TO=+44xxxxxxxxxx

# Behaviour
KITCHEN_OPEN=true
SERVICE_CHARGE_PERCENT=10
```

- **Where to set ORDER_SMS_TO?** In your `.env(.local)` as above.
- If Twilio vars are missing or SMS delivery fails, the app **still confirms** the order and flags **"SMS pending—check admin"**. The order is saved either way.

## Project scripts

- `npm run dev` — start Next.js dev server
- `npm run build` / `npm start` — production build/start
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests (cart logic)
- `npm run e2e` — Playwright happy path test (run `npx playwright install` once)

## Pages & UX

- `/` — **Menu** with category tabs, search, tags (vg/veg/pesc/vg-option), “+ Add”, sticky **View Basket** bar (mobile), keyboard accessible.
- `/basket` — **Checkout** (editable quantities, required table number, optional contact/phone, allergy notes). **Pay at bar** placeholder. Totals show **service charge** if enabled.
- `/order/[id]` — **Order confirmation** with ID, SMS status, and estimated prep time.
- `/orders/[id]/ticket` — **Print ticket** (big fonts, print button).
- `/admin` — Toggle **Kitchen Open/Closed**, set **service %**, view **last 20 orders** with SMS status.

### Rules & Validation

- Table number is **mandatory**; basket must be non-empty.
- Prices & SKUs are revalidated server-side against `data/menu.json`.
- Rate-limited order endpoint (20 req/min/IP).
- **CORS:** API rejects cross-origin writes (same-origin only).

## Data model

- Edit the menu at `data/menu.json` (seed provided). Slugs are generated automatically.
- Orders are saved to `data/orders.json` with `{ orderId, items, totals, notes, placedAt, smsStatus }`.

## Payments

Not implemented. A future Stripe/Payments integration point is the **/basket** submit flow — replace the `fetch("/api/order")` call with a payment + confirmation handshake.

## Deployment

### Vercel (all-in-one)

This project works out-of-the-box on Vercel for the frontend and API routes. **However**, Vercel’s filesystem is ephemeral; `data/*.json` will not persist.

Options:
1. Deploy frontend+API on Vercel and swap persistence to a DB (e.g., SQLite on Railway/Render with Prisma — schema included under `prisma/`).
2. Or deploy the whole app on **Railway/Render/Fly** where `data/` persists.

#### Using Prisma + SQLite (optional)

Set `DATABASE_URL="file:./dev.db"` and run:

```bash
npx prisma migrate dev --name init
npm run dev
```

Modify `lib/orders.ts` to use Prisma if you want DB-backed orders (JSON fallback is the default provided here).

### Railway/Render

Deploy as a Node service (`npm start`). Make sure your persistent disk mounts include the `data/` directory.

## Accessibility

- Semantic HTML, labels, focusable controls, ARIA roles where needed.
- Keyboard-only path supported for adding items and checking out.
- Color contrast on dark theme with warm accent.

## PWA

- `public/manifest.json` and a very light Service Worker (`public/sw.js`) provide an **offline fallback** to `/offline` for navigations.

## Security & Robustness

- In-memory **rate limit** on `/api/order`.
- Server-side price & item validation against the menu.
- **Same-origin** enforcement for write routes.
- No cookies or auth built-in; `/admin` is intentionally open — protect behind a reverse-proxy auth if deploying publicly.

## Tests

- **Unit** (Vitest): `lib/cart.ts` add/update/remove/totals
- **E2E** (Playwright): happy path (add → basket → table number → confirmation)

## Dev tips

- Menu items with `optionsNote` can be priced via separate “Platter for two/four” items as in the seed.
- Toasts confirm add/remove actions briefly in the top-right.
- Sticky basket bar appears once you have items.

---

© Placeholder brand **“The Pub”**. Replace `/public/brand.svg` with your logo.