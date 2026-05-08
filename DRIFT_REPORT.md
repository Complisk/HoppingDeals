# Drift Report — Local Code vs Live Production

Generated: 2026-05-08 during the migration to `complisk-fullstack`.

This report identifies every place where your **local** repos
(`complisk-backend`, `complisk-frontend`) have drifted away from what's
actually running at **complisk.com**. The short version: **production has
features your local code doesn't, and your local code has features production
doesn't ship**. Drift goes both ways.

---

## 1. Production topology (what's actually live)

| Domain | What it is | Stack |
|---|---|---|
| `https://complisk.com` | Public frontend | Vite + React SPA (hashed asset `index-sIq6Faqx.js`, last modified **2026-04-27**) |
| `https://api.complisk.com` | Real production backend | Express + Sequelize behind **nginx** (not Vercel) |
| `https://complisk-backend.vercel.app` | **Stale legacy** Vercel deploy | Express, missing subscription / role / template features |

**Key:** the live frontend points at `https://api.complisk.com` (verified by
inspecting the `apiAction-CN5i3Xuw.js` chunk on complisk.com). The
Vercel-hosted backend is a relic — it's missing subscription routes, role
routes, and even the `Promotion.category` column.

**Local git history vs production deployment:**
- Local repos last committed: **2026-01-27**
- Production assets last modified: **2026-04-27** (+3 months later)
- Production data: subscription templates created at **2026-03-23**

The dev kept working **on production** without pushing those changes back to
GitHub. So your local clone is missing ~3 months of work.

---

## 2. Stale Vercel backend (`complisk-backend.vercel.app`)

This deployment **should be decommissioned**. It's behind both the local code
and the real production backend. Endpoint scan:

| Endpoint | Status | Notes |
|---|---|---|
| `GET /health` | 200 | works |
| `GET /api/promotions` | **500** | `column Promotion.category does not exist` — DB is older than the code |
| `GET /api/subscription-template` | **404** | not wired |
| `POST /api/subscription/checkout` | **404** | not wired |
| `GET /api/roles` | **404** | not wired |
| `GET /api/roles/permissions` | **404** | not wired |
| `POST /api/auth/login` | 400 | works (validation rejection) |

Either delete this Vercel project or redeploy from the latest backend code.

---

## 3. What's on **production but NOT in your local code**

These are changes the dev made directly to the live deployment without ever
committing back to GitHub. **High-value to recover.**

### 3.1 SEO & PWA polish on `complisk.com`

The live `index.html` has substantially more head metadata than your local
[complisk-frontend/index.html](e:/work-project/Tan/complisk-frontend/index.html):

| Element | Live | Local | Action |
|---|---|---|---|
| `<title>` | `"Complisk \| Local business promotions and deals"` | `"Complisk — Discover Local Business Promotions"` | Adopt live copy |
| `<meta name="description">` | "Find local promotions, flash deals…" | older copy | Adopt live copy |
| `<link rel="canonical">` | ✅ set to `https://complisk.com` | ❌ missing | Add to fullstack |
| `<meta name="keywords">` | includes "geo targeted promotions" | older list | Update |
| Favicons | 16, 32, 48 px sizes + apple-touch + manifest icons (192/512) | single `favicon.ico` | Copy missing assets |
| `<link rel="manifest" href="/manifest.json">` | ✅ | ❌ | Add manifest |
| `og:image` | `/logo-512.png` (512×512) | `/og-image.png` (1200×630, possibly missing) | Adopt live |
| `og:site_name` | ✅ "Complisk" | ❌ | Add |
| `<meta name="image">` | ✅ generic image meta | ❌ | Add |
| `<meta name="theme-color">` | `#000000` | `#0f172a` | Adopt live |
| Mobile web app meta tags (`mobile-web-app-capable`, `apple-mobile-web-app-*`) | ✅ all 3 | ❌ none | Add |
| Google Analytics (`gtag.js` with ID `G-BTRD0MG8LJ`) | ✅ live | ❌ missing | **CRITICAL — re-add** |
| Schema.org JSON-LD (`Organization` type) | ✅ | ❌ | Add for SEO |

### 3.2 Public assets the live site uses but your `public/` doesn't have

These are referenced by the live `index.html` and `manifest.json`. Without
them, the new fullstack build will 404 on these paths:

```
/favicon-16x16.png
/favicon-32x32.png
/favicon-48x48.png
/apple-touch-icon.png            (180×180)
/web-app-manifest-192x192.png
/web-app-manifest-512x512.png
/logo-512.png                    (used as og:image)
/manifest.json
```

Your local `complisk-frontend/public/` has random hash-named PNGs and
`placeholder.svg` — none of the above. **Recovery options:**
- Download each from `https://complisk.com/<filename>` and check them into the
  fullstack repo's `public/` folder.
- Or generate fresh ones from the brand logo.

### 3.3 Production database has data your local data model doesn't fully cover

From `https://api.complisk.com/api/subscription-template` we can see real
SubscriptionTemplate rows in production:

```
- "Starter"      $100.00  durationMonths=1  freeCities=1
- "Professional" $250.00  durationMonths=1  freeCities=3
- "Enterprise"   $500.00+ ...
```

Created **2026-03-23**, updated **2026-03-24**. These will need to be either
manually re-created locally, or imported via a one-time data export.

### 3.4 Backend changes likely made on production but not in local repo

Without source-map access I can't enumerate these precisely, but inspecting
the live API behavior versus your local backend code suggests:
- Possible bug fixes / tweaks made between Jan 27 and the April deploy
- Possibly subscription pricing tweaks (the seed data above didn't exist Jan 27)
- Possibly admin dashboard additions

**Action:** ask the dev to push their actual production code to GitHub. Or
reverse-engineer from the deployed bundle (slow).

---

## 4. What's in **your local code but NOT on production**

Inverse problem: features the dev built locally that aren't deployed.
Production assets last modified 2026-04-27 — so anything the dev added to git
*after* their April deploy won't be live.

Your last local commits are 2026-01-27, **before** the April deploy. So most
local code IS on production via the api.complisk.com backend. But because the
**old Vercel backend still exists at complisk-backend.vercel.app**, anyone
hitting that URL hits a stale version. Nothing in your local code that's
post-April Jan 27 — so this column is mostly empty.

---

## 5. What the `complisk-fullstack` migration captures

Your new Next.js project (built during phases 0–5) was migrated from your
**local** repos. So the fullstack project includes:

- ✅ Subscription system
- ✅ Role management with permissions
- ✅ All admin features (template upload, role assignment, etc.)
- ✅ `Promotion.category` field
- ✅ Cleaner clean-architecture structure

But it **doesn't** include the production-only changes called out in §3
above. Specifically:

- ❌ Updated `<title>`, meta description, canonical, OG metadata
- ❌ Google Analytics
- ❌ JSON-LD structured data
- ❌ PWA manifest + multi-size favicons + mobile app meta
- ❌ The seeded subscription template rows (Starter/Professional/Enterprise)

**These are tracked in this report and should be added in Phase 6.**

---

## 6. Recommended remediation (in priority order)

### Immediate (before launching the new fullstack)
1. **Add SEO metadata** to `src/app/layout.js` — title, description, canonical, OG tags, theme-color, JSON-LD Organization schema
2. **Add Google Analytics** (`G-BTRD0MG8LJ`) — use Next's third-party script component for performance
3. **Copy missing public assets** from `https://complisk.com/<file>` into `complisk-fullstack/public/`
4. **Wire PWA manifest** — add `manifest.json` to `public/` and reference it in `<head>` via metadata
5. **Seed subscription templates** — create a migration or seed script that inserts Starter/Professional/Enterprise rows

### Short term (within the migration cutover)
6. **Talk to the other dev** — get them to push their production-only changes to GitHub. The git history shows commits to Jan 27 then nothing — there's clearly uncommitted work.
7. **Decommission `complisk-backend.vercel.app`** — it's serving stale 500s and confusing the topology.
8. **Plan a data migration** from production Postgres (behind api.complisk.com) into your new schema. Until that happens, the new fullstack has no real data.

### Longer term
9. **Replace api.complisk.com** with the new fullstack deploy. The fullstack's `/api/*` routes mirror the current Express endpoints, so the frontend wiring barely changes.
10. **Set up CI** so deploys can't bypass git ever again.

---

## 7. File-by-file diff vs production (where I could verify)

### Verified DIFFERENT between local and production
- `complisk-frontend/index.html` — see §3.1
- `complisk-frontend/public/` — missing PWA + favicon assets, see §3.2

### Verified IDENTICAL (or close enough)
- `/api/promotions/templates` schema — same Cloudinary cloud (`dgdfenqsv`)
- `/health` response shape — `{"status":"ok","message":"Server is running"}`

### Unverifiable without source map / GitHub access
- Backend route handler internals between Jan 27 and April 27
- Frontend component logic post-Jan 27
- Database schema beyond what's exposed by JSON responses

---

## 8. Open questions for you / the other dev

1. **Where are the post-Jan-27 changes?** They're live on prod but not in
   `Complisk/complisk-frontend` or `Complisk/complisk-backend`. Local checkout?
   Different branch? Different repo? Direct edits via Vercel UI?
2. **Is api.complisk.com running the same code as `Complisk/complisk-backend`
   on a specific commit / branch?** Or is it manually patched?
3. **What's the deploy pipeline?** `complisk-backend.vercel.app` looks abandoned;
   nginx-fronted `api.complisk.com` looks managed. Who controls it?
4. **Where's the production Postgres?** Need credentials (read-only at minimum)
   to plan a data migration.
5. **Production Google Analytics property `G-BTRD0MG8LJ`** — keep, replace, or
   add a separate dev/staging property?
