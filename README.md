# Complisk — Fullstack (Next.js 16)

A location-based business promotions platform. Local businesses publish
geo-targeted promotions; users discover deals near them. Stripe handles
subscriptions and per-promotion add-on billing; Cloudinary stores media.

This repository is the **single Next.js project** that replaces the previous
two-repo setup (`complisk-backend` + `complisk-frontend`). Everything is now
one codebase with clean architecture, App Router routing, and JS (no
TypeScript).

---

## Table of contents

- [Stack](#stack)
- [Architecture](#architecture)
- [Directory layout](#directory-layout)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Authentication & authorization](#authentication--authorization)
- [API routes](#api-routes)
- [Pricing rules](#pricing-rules)
- [Stripe webhook setup](#stripe-webhook-setup)
- [Scripts reference](#scripts-reference)
- [Deployment](#deployment)
- [Migration history](#migration-history)
- [Troubleshooting](#troubleshooting)

---

## Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, React Compiler enabled) |
| UI | **React 19** + **Tailwind CSS v4** + **shadcn/ui** + **Radix primitives** |
| Animation | framer-motion |
| State (client) | Redux Toolkit + react-redux |
| Server data | TanStack Query (React Query) |
| Forms | react-hook-form + Zod resolvers |
| ORM | **Prisma 7** (with `@prisma/adapter-pg` driver adapter) |
| Database | PostgreSQL |
| Auth | JWT in **httpOnly cookies** (signed via `jose` so Edge middleware can verify too) |
| Payments | Stripe (`stripe` SDK on server, `@stripe/react-stripe-js` on client) |
| Media | Cloudinary (`cloudinary` SDK on server) |
| Geo | ipinfo.io / ipwho.is + browser geolocation fallback |
| Maps | Google Maps JS API + Places autocomplete |
| Validation | Zod (server + client) |
| Charts | Recharts + Chart.js |

---

## Architecture

The project follows a **clean / hexagonal architecture** with a strict
inward-pointing dependency rule:

```
presentation  →  application  →  core
                                  ↑
                  infrastructure  ┘
```

- **`core/`** — pure domain. Plain JS classes for entities (`User`,
  `Business`, `Promotion`, …) and a small error hierarchy
  (`NotFoundError`, `ValidationError`, etc.). **Zero external imports.**
- **`application/`** — use-cases (one file per business operation, e.g.
  `LoginUseCase`, `CreatePromotionUseCase`) and **ports** —
  JSDoc-typed interfaces describing what the use-case needs. Use-cases
  receive their dependencies via constructor injection.
- **`infrastructure/`** — adapters that **implement** ports. Prisma
  repositories, `JwtTokenService`, `BcryptPasswordHasher`,
  `StripePaymentGateway`, `CloudinaryUploader`, `IpInfoGeoLocator`. Plus
  the **composition root** at `infrastructure/container.js` which wires
  everything together.
- **`presentation/`** — client UI. Components, Redux store, hooks,
  service-layer wrappers around the API client. **Server-only code
  cannot leak in here** (server modules use `import "server-only"`).
- **`server/`** — HTTP plumbing that bridges Next route handlers to
  use-cases: error → status mapping, auth/permission guards, Zod
  validators.
- **`app/`** — the actual Next routes. Pages delegate to
  `presentation/pages/*` components; route handlers delegate to
  `container.<useCase>.execute(...)`.

Routes are thin glue. Real business logic lives in use-cases. Repositories
hide Prisma. Use-cases hide HTTP. This makes them trivial to unit-test in
isolation (no DB, no Next runtime needed).

---

## Directory layout

```
complisk-fullstack/
├── prisma/
│   ├── schema.prisma          # Postgres schema (Prisma 7 driver-adapter style)
│   └── migrations/            # generated migration files
├── prisma.config.js           # Prisma 7 config (datasource url lives here)
├── middleware.js              # Edge middleware — JWT cookie presence check
├── public/                    # static assets (favicons, manifest, OG images)
├── src/
│   ├── app/                                  # Next App Router routes
│   │   ├── page.jsx, about-us/, terms/, ...  # public pages
│   │   ├── (auth)/login/, register/          # user auth
│   │   ├── business/                         # business public + protected
│   │   │   ├── login/, register/, visitor/, payment-success/
│   │   │   └── (protected)/                  # route group with sidebar layout
│   │   │       ├── dashboard/, promotions/, create-promotion/,
│   │   │       └── edit-promotion/[promotionId]/, checkout/, subscription/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   └── (protected)/                  # admin sidebar layout
│   │   │       ├── dashboard/, businesses/, users/, promotions/, templates/, roles/
│   │   ├── api/                              # route handlers (replaces Express)
│   │   │   ├── auth/{login,register,register/business,logout,me}/
│   │   │   ├── users/{profile,wishlist}/
│   │   │   ├── business/{dashboard,promotions}/...
│   │   │   ├── admin/...
│   │   │   ├── promotions/{[id],calculate-price,templates}/
│   │   │   ├── subscription/, subscription-template/
│   │   │   ├── payment/webhook/              # Stripe — Node runtime forced
│   │   │   ├── location/, health/, roles/
│   │   ├── globals.css                       # Tailwind v4 + design tokens
│   │   └── layout.js                         # root layout (fonts, providers)
│   │
│   ├── core/
│   │   ├── entities/                # User, Business, Promotion, Role, Template, ...
│   │   └── errors/                  # DomainError, NotFoundError, ValidationError, ...
│   │
│   ├── application/
│   │   ├── auth/                    # login, register-user, register-business, verify-token
│   │   ├── users/                   # profile, wishlist
│   │   ├── promotions/              # create, update, list, activate, ...
│   │   ├── business/                # get-dashboard
│   │   ├── admin/                   # list/update users + businesses + promotions, dashboard, ...
│   │   ├── roles/                   # CRUD + permission map
│   │   ├── subscriptions/           # checkout, active, history
│   │   ├── subscription-templates/  # CRUD
│   │   ├── templates/               # public list
│   │   ├── payments/                # handle-webhook
│   │   ├── location/                # ip lookup
│   │   └── ports/                   # interface JSDocs (one per port)
│   │
│   ├── infrastructure/
│   │   ├── db/
│   │   │   ├── prisma.js            # Prisma client singleton (adapter-pg)
│   │   │   ├── mappers.js           # row → entity
│   │   │   └── repositories/        # one per aggregate
│   │   ├── auth/                    # JwtTokenService (jose), BcryptPasswordHasher, cookie helpers
│   │   ├── stripe/                  # StripePaymentGateway
│   │   ├── cloudinary/              # CloudinaryUploader
│   │   ├── geo/                     # IpInfoGeoLocator
│   │   └── container.js             # composition root — DI for all use-cases
│   │
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn primitives
│   │   │   ├── shared/              # cross-feature components
│   │   │   ├── homePage/, public/   # landing & feed
│   │   │   ├── business/, admin/    # role-specific
│   │   │   └── layouts/             # AdminLayout, BusinessLayout, DynamicSidebar
│   │   ├── pages/                   # ported page components (delegated to from app/)
│   │   ├── store/                   # Redux slices (auth, admin, promotion)
│   │   ├── hooks/                   # use-redux, use-toast, useApi, usePermissions
│   │   ├── services/                # API client wrappers (auth, admin, promotion, ...)
│   │   ├── providers/               # Redux/Query/Toast providers + AppProviders
│   │   └── lib/                     # utils (cn), apiAction, stripe, cloudinary helpers
│   │
│   ├── server/
│   │   ├── http/                    # withErrors, requireSession, requirePermission
│   │   └── validators/              # Zod schemas + parseJson helper
│   │
│   └── shared/                      # cross-cutting (pricing.js, date-utils.js)
│
├── DRIFT_REPORT.md            # local-vs-production drift analysis
├── components.json            # shadcn/ui CLI config
├── next.config.mjs            # reactCompiler: true
├── jsconfig.json              # @/* → ./src/*
├── postcss.config.mjs         # Tailwind v4 plugin
├── eslint.config.mjs
└── package.json
```

---

## Getting started

### Prerequisites

- **Node.js 20.19+ / 22.12+ / 24+** (per Prisma 7 requirements)
- **PostgreSQL 13+** running locally (or a managed instance)
- A **Stripe** account (test keys are fine)
- A **Cloudinary** account (free tier is fine)
- A **Google Cloud** project with Maps JavaScript API + Places API enabled

### Install + run

```bash
# 1. Install dependencies (Prisma client is auto-generated via postinstall)
npm install

# 2. Copy env template and fill in your values
cp .env.example .env
# edit .env — see "Environment variables" below

# 3. Apply the database schema
npm run db:migrate -- --name init

# 4. Start the dev server
npm run dev
```

Then open http://localhost:3000.

---

## Environment variables

All required variables live in `.env` (gitignored). Use `.env.example` as
a starting point.

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | ✅ | Full Postgres connection string. Append `?schema=complisk` if your DB hosts other projects, to keep tables namespaced. |
| `DB_SSL` | optional | `true` to enable SSL with relaxed cert verification |
| `JWT_SECRET` | ✅ | Long random string used to sign/verify session JWTs. Generate with `openssl rand -base64 48`. |
| `JWT_EXPIRE` | optional | Token lifetime (`7d`, `12h`, etc). Default `7d`. |
| `STRIPE_SECRET_KEY` | ✅ for billing | `sk_test_…` or `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | ✅ for billing | `whsec_…` from your webhook endpoint settings |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ for billing | `pk_test_…` (browser-safe) |
| `CLOUDINARY_CLOUD_NAME` | ✅ for uploads | e.g. `dgdfenqsv` |
| `CLOUDINARY_API_KEY` | ✅ for uploads | numeric string |
| `CLOUDINARY_API_SECRET` | ✅ for uploads | secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | optional | mirror of `CLOUDINARY_CLOUD_NAME` for browser access |
| `IPINFO_TOKEN` | optional | ipinfo.io token. The location use-case falls back to free public APIs if absent. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ for maps | `AIza…` with Maps JS + Places APIs enabled |
| `NEXT_PUBLIC_API_URL` | optional | only set if frontend calls a different origin; defaults to same-origin `/api` |

> **Never commit `.env`.** It's already in `.gitignore`.

---

## Database

### Schema

Defined in [`prisma/schema.prisma`](./prisma/schema.prisma). Eight models:

- `User` — end users + admins. `accountType` discriminates; `roleId` →
  `Role` for granular admin permissions; `isSuperAdmin` bypasses checks.
- `Business` — owners. Holds Stripe customer + subscription IDs.
- `Role` — name + JSON permissions map. System roles can't be deleted.
- `Template` — base creative for promotions (Cloudinary-backed).
- `Promotion` — the actual ad. Contains text/cities/states/timezones JSON,
  status, payment status, view/click counters.
- `SubscriptionTemplate` — plan definitions (Starter / Pro / Enterprise),
  including how many free cities/states/timezones each grants.
- `BusinessSubscription` — active subscription per business, tied to a
  template.
- `SubscriptionHistory` — historical record.

### Common DB workflows

```bash
# Apply pending migrations + create one for your new schema changes
npm run db:migrate -- --name your_change_name

# Apply migrations only (production)
npm run db:migrate:deploy

# Visual browser
npm run db:studio

# Re-introspect an existing DB into schema.prisma
npm run db:pull

# Push schema without creating migration history (dev / prototyping)
npm run db:push
```

### Why is `?schema=complisk` recommended?

If your local Postgres already has tables from other projects, point Prisma
at a separate Postgres schema:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb?schema=complisk"
```

Prisma will create all tables under `complisk.<table>` so they don't collide
with anything else.

---

## Authentication & authorization

- **Login flow:** POST `/api/auth/login` with `{ email, password, type }`
  where `type` is `"user" | "business" | "admin"`. The handler signs a JWT
  with `{ id, type }` and sets it as an `httpOnly` cookie named
  `complisk_session`. Same JWT is also returned in the body for older
  client code that expects it.
- **Cookie attributes:** `httpOnly`, `sameSite=lax`, `secure` in
  production, `path=/`, `maxAge` matches `JWT_EXPIRE`.
- **Edge middleware** ([`middleware.js`](./middleware.js)) does a cheap
  signature/expiry check on `/business/(protected)*` and
  `/admin/(protected)*` URLs. If invalid, it redirects to the role's
  login page.
- **Server-side guards:**
  - `requireSession(role?)` in `src/server/http/auth-guard.js` reads the
    cookie, hydrates the principal via the `VerifyTokenUseCase`, and
    enforces the role.
  - `requirePermission(session, module, action)` enforces fine-grained
    admin permissions via `Role.permissions` JSON.

### Permissions model

`Role.permissions` is a JSON map like:

```json
{
  "users":      ["view", "edit"],
  "businesses": ["view", "edit", "approve", "auto_approve"],
  "promotions": ["view", "edit", "delete", "approve"],
  "templates":  ["view", "create", "delete"],
  "roles":      ["view", "create", "edit", "delete"]
}
```

`isSuperAdmin = true` bypasses all checks. The valid module/action
combinations are defined in
[`src/application/roles/permission-map.js`](./src/application/roles/permission-map.js)
and exposed at `GET /api/roles/permissions`.

---

## API routes

All endpoints live under `/api/*`. **Mostly identical paths** to the
previous Express backend, so existing client code keeps working. A
non-exhaustive map:

### Auth (public)
| Method | Path | Handler |
|---|---|---|
| POST | `/api/auth/register` | register-user |
| POST | `/api/auth/register/business` | register-business |
| POST | `/api/auth/login` | login |
| POST | `/api/auth/logout` | clears the session cookie |
| GET  | `/api/auth/me` | hydrate current session (includes admin permissions) |

### User (cookie-protected, role=user)
- `GET/PUT /api/users/profile`
- `GET/POST /api/users/wishlist`
- `DELETE /api/users/wishlist/[promotionId]`

### Business (cookie-protected, role=business)
- `GET /api/business/dashboard`
- `GET/POST /api/business/promotions`
- `GET/PUT/DELETE /api/business/promotions/[promotionId]`
- `POST /api/business/promotions/[promotionId]/activate`
- `POST /api/business/promotions/[promotionId]/deactivate`
- `POST /api/subscription/checkout`
- `GET /api/subscription/active`
- `GET /api/subscription/history`

### Admin (cookie-protected, role=admin, with per-action permission check)
- `GET /api/admin/dashboard`
- `GET /api/admin/users`, `PUT /api/admin/users/[id]/status`
- `GET /api/admin/businesses`, `PUT /api/admin/businesses/[id]/status`
- `PUT /api/admin/businesses/[id]/toggle-auto-approve`
- `GET /api/admin/promotions`, `DELETE /api/admin/promotions/[id]`
- `PUT /api/admin/promotions/[id]/status`
- `GET /api/admin/templates`, `POST /api/admin/templates/upload`, `DELETE /api/admin/templates/[id]`
- `POST /api/admin/make-admin`, `POST /api/admin/create-admin`
- `PUT /api/admin/admin/[id]/role`
- `GET /api/admin/user-permissions/[userId]`

### Public
- `GET /api/promotions` — feed with `?city=&state=&timezone=&category=`
- `GET /api/promotions/[id]` — increments view count
- `POST /api/promotions/[id]/click` — increments click count
- `POST /api/promotions/calculate-price`
- `GET /api/promotions/templates`
- `GET /api/subscription-template`
- `GET /api/roles/permissions`
- `GET /api/location` — IP-based geolocation
- `GET /api/health`

### Stripe webhook
- `POST /api/payment/webhook` — verifies signature against
  `STRIPE_WEBHOOK_SECRET`, processes `checkout.session.completed` and
  `payment_intent.succeeded` events. Forced `nodejs` runtime.

---

## Pricing rules

Encoded once in [`src/shared/pricing.js`](./src/shared/pricing.js):

**Online store** (`businessType === "online-ecommerce"`)
- Base $10/month (covers 1 state)
- Each extra state: +$10
- Timezones: $30 each (Eastern surcharge: $50 base + $30 per non-Eastern)

**Physical** (`small`, `medium`, `large`)
- No states selected → starter $10 (covers 2 cities)
- 1+ states selected → $20 per state (no base)
- Timezones: $60 each (Eastern surcharge: $100 base + $60 per non-Eastern)

Cities are always free up to the subscription's `freeCities` allowance.

---

## Stripe webhook setup

1. In Stripe Dashboard → Developers → Webhooks, add an endpoint:
   - URL: `https://<your-domain>/api/payment/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
2. Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.
3. Locally, use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/payment/webhook
   ```
   It prints a temporary `whsec_…` — paste that into your `.env` for
   local testing.

---

## Scripts reference

| Command | Description |
|---|---|
| `npm run dev` | Start Next dev server |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:pull` | Introspect existing DB |
| `npm run db:push` | Push schema (no migration history) |
| `npm run db:migrate` | Create + apply a new migration (dev) |
| `npm run db:migrate:deploy` | Apply pending migrations (prod) |
| `npm run db:studio` | Open Prisma Studio |

---

## Deployment

Designed for **Vercel** (zero-config). A few notes:

- The Stripe webhook route forces `runtime = "nodejs"` because the Stripe
  SDK is not Edge-compatible.
- Other route handlers default to the Node runtime (Prisma needs Node).
- Edge **middleware** (`middleware.js`) only does signature checks via
  `jose`, which IS Edge-safe.
- Set every required env var in the Vercel project settings.
- For production migrations: run `prisma migrate deploy` in your CI or as
  a one-off step (`vercel-build` runs `npm run build` which only generates
  the client; **it does NOT apply migrations**, by design).

If deploying elsewhere, ensure the Postgres SSL config matches your
provider (e.g. Neon, Supabase, RDS).

---

## Migration history

This single repo replaces:

- **`complisk-backend`** — Express 4 + Sequelize/Postgres + JWT in
  Authorization header + multer for uploads + node-cron jobs.
- **`complisk-frontend`** — Vite + React 18 + TypeScript + Redux Toolkit
  + react-router-dom + tailwindcss-animate + tailwind v3.

Major changes during the migration:

- Sequelize → **Prisma 7** (with the new driver-adapter architecture)
- Express middleware → **Next App Router route handlers** with a thin
  `withErrors` wrapper that maps domain errors to HTTP statuses.
- React Router → **Next App Router**. `<Link to>` → `<Link href>`,
  `useNavigate()` → `useRouter().push()`, `useLocation()` →
  `usePathname()` + `useSearchParams()`. Layouts replace `<Outlet />`.
- JWT in Authorization header → **JWT in `httpOnly` cookies** + Edge
  middleware redirect.
- Tailwind v3 config-based theme → **Tailwind v4 `@theme` blocks** in
  `globals.css`.
- TypeScript → JavaScript with JSDoc types on critical interfaces.
- Backend "controllers" with HTTP coupling → **use-cases** that take
  plain inputs/outputs and throw domain errors.

See [`DRIFT_REPORT.md`](./DRIFT_REPORT.md) for what's still drifting
between this codebase and the live `complisk.com` deployment.

---

## Troubleshooting

### `PrismaClientInitializationError: Using engine type "client" requires either "adapter" or "accelerateUrl"`
Prisma 7 requires a driver adapter. We use `@prisma/adapter-pg`. Confirm
`infrastructure/db/prisma.js` constructs `new PrismaClient({ adapter })`.

### "Module not found" errors after pulling new code
Run `npm install`. The `postinstall` hook regenerates the Prisma client.

### Cookie isn't set after login
Make sure you're using the same origin (no CORS). The cookie is
`sameSite=lax` and `httpOnly`. In dev across `localhost:3000` ↔
`localhost:3000`, this just works.

### `useSearchParams() should be wrapped in a suspense boundary`
Wrap the page in `<Suspense fallback={null}>` (Next 16 strictness).

### Stripe webhook signature verification fails
- The webhook handler reads `await req.text()` (raw body). If you've
  added body-parser middleware globally, that breaks signing — don't.
- Confirm `STRIPE_WEBHOOK_SECRET` matches the endpoint you're testing
  against (Stripe CLI gives you a different secret than your dashboard
  endpoint).

### Edge middleware errors on `crypto.randomUUID`
You're probably importing `jsonwebtoken` somewhere reachable from
middleware. Use `jose` exclusively in middleware-adjacent code.
