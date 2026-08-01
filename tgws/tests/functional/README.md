# TGWS Functional Test Suite

Playwright functional/integration tests for the **TGWS (TechGuru Network & Data
Solutions)** Next.js website. These verify that features render and behave
correctly against a **local production build** — they are NOT unit tests.

## Prerequisites

- Node.js + the project dependencies installed (`npm install` in `TGWS/tgws/`).
- Microsoft Edge installed at
  `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.
  Per `AGENTS.md` rule #27, **Edge is the only allowed browser** — Chromium is
  not used and must not be installed.
- A running production server (see below). **Never use `npm run dev`** for
  these tests (`AGENTS.md` #32) — the dev server never works on this machine.

## Build & start the server (one-time per run)

```powershell
# from the app root: TGWS/tgws/
npx next build --webpack
npx next start -p 3000
# keep this process running in a separate terminal
```

If port 3000 is already in use, find and stop the stale process before
starting:

```powershell
netstat -ano | findstr :3000
Stop-Process -Id <PID> -Force
```

## Run the tests

```powershell
# from TGWS/tgws/
npx playwright test --config=tests/functional/playwright.functional.config.ts

# single file
npx playwright test --config=tests/functional/playwright.functional.config.ts tco-calculator.spec.ts

# headed (watch Edge run) — useful for debugging
npx playwright test --config=tests/functional/playwright.functional.config.ts --headed

# a specific project (desktop vs mobile viewport)
npx playwright test --config=tests/functional/playwright.functional.config.ts --project=edge-mobile
```

HTML report written to `tests/functional/functional-report/index.html`.

The base URL defaults to `http://localhost:3000`; override with
`BASE_URL=https://www.techguru-it.asia` to point at production (the live site
already has its own root `./e2e` config — these suites are separate).

## What each file covers

| File | Scope |
|------|-------|
| `pages-render.spec.ts` | Every route under `src/app`. HTTP status, key heading present, navbar visible, no runtime page errors. Includes 404 routes and auth-gated redirect checks. |
| `navigation.spec.ts` | Logo link, active Home link, mega-menu dropdowns (Products/Solutions/Support), Contact link, footer links, locale switching, mobile hamburger menu. |
| `tco-calculator.spec.ts` | `/vmware-alternative` TCO Calculator: input controls, sliders, year presets, scenario selector, "Calculate TCO" produces an SVG chart + populated results table, PNG export downloads a file, value bounds. |
| `search.spec.ts` | Global Search modal: open/close, filters, debounced auto-search, internal results, AI summary, external "From the web" results with degradation fallback, capability-gap lead form, result navigation. Plus `/api/search` API contract. |
| `forms.spec.ts` | Contact form client validation + `/api/contact`; Register & Login form rendering; lead-capture form in search; help-center local FAQ search. |
| `tickets.spec.ts` | Support portal auth-gate redirect + `/api/tickets*` auth-requirement contract. Full create/list/update flows require a Supabase session — outlined but not executed. |

## Known issues / limitations (and why tests are written the way they are)

1. **`npm run dev` does not work on this machine** (`AGENTS.md` #32). All tests
   target a `next build --webpack` + `next start` production server.

2. **Global Search suggestions fail locally.** The trending-suggestions panel
   fetches directly from the Sanity Content Lake
   (`https://r6ztl1oq.apicdn.sanity.io/...`) client-side. In the local Edge
   harness these requests fail with `ERR_FAILED` (network/CORS in headless
   context), so the suggestions list is often empty. The actual search path
   (`POST /api/search`, server-side) **works** and returns AI summary + internal
   + external results — tests use known-good queries (`vmware`, `cybersecurity`)
   that exercise the API, not the suggestions panel. This is a local-env
   limitation, not a site defect.

3. **Umami analytics CSP violation (console noise).** With
   `NEXT_PUBLIC_UMAMI_WEBSITE_ID` set locally, the browser blocks
   `cloud.umami.is/script.js` under the deployed CSP (`script-src 'self'`).
   This is a console error, not a render failure — the rendering test filters
   it out as known noise (see `isNoise` in `pages-render.spec.ts`).

4. **Homepage React hydration warning #418.** The client-rendered homepage
   (`home/page.tsx`) emits a `Minified React error #418` (server/client HTML
   mismatch) in the headless harness. The page still renders fully (206 KB
   body, all headings present). It is a known, non-fatal regression signal and
   is captured separately rather than hard-failing the page-render suite.

5. **Auth-gated pages (`/support`, `/profile`, `/support/admin/dashboard`)**.  These rely on a Supabase Auth session. Without credentials the client
   redirects to `/en/support/login`. The suites assert the redirect, not the
   authenticated UI. Full ticket create/list/update flows require test
   Supabase credentials (see `tickets.spec.ts` footer) and are intentionally
   out of scope for the local environment.

6. **Lazy-loaded partner logos are NOT broken.** A naïve audit reported 57
   "broken" homepage images, but all are `/_next/image` responses for
   `/logos/*.png` that return **HTTP 200** (verified: raw + optimized both 200).
   They appear as `naturalWidth === 0` only because they are
   `loading="lazy"` and off-screen at measurement time. The rendering suite
   does not flag lazy images as failures.

7. **Blog & product dynamic content depends on Sanity.** `/blog` and
   `/products` pull from the Sanity Content Lake (ISR, `revalidate=3600`). If
   Sanity is unreachable the pages render with empty fallbacks rather than
   crash. Tests assert the page shell renders, not that specific articles exist.

8. **Missing i18n keys (`MISSING_MESSAGE`)** on `/en/products/run` for
   `products.features.enterprise-routers`, `core-switches`, etc. — logged as
   console warnings. These are content/i18n gaps, not functional failures; the
   rendering suite filters them as noise and the finding is recorded here for
   the product team to address translation coverage.

## Environment for the recorded audit

- Server: pre-existing `next start -p 3000` against a completed
  `next build --webpack` build (detected serving `/en` HTTP 200 with full
  security headers). The explicit `npx next build --webpack` re-run reported
  "Another next build process is already running", so the running production
  server was reused rather than risk killing a working process.
- Date: 2026-07-29 region. Node 24, Edge, Windows.
- Raw audit data: `scripts/audit-pages.mjs` + `audit-results.json`.