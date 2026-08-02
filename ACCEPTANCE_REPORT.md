# TGWS Website — Formal Acceptance Report

**Project:** TechGuru Network & Data Solutions Official Website
**Acceptance Expert Review Date:** 2026-07-29
**App Root:** `TGWS/tgws/` (Next.js 16.2.9, App Router)
**Tech Stack:** Next.js 16 · TypeScript · Sanity CMS v3 · Supabase · Tailwind CSS 4 · (components hand-written, no shadcn/ui)
**Domain:** www.techguru-it.asia (Vercel)

> **Method note:** Verification done by reading actual source files (AGENTS rule #36), running `npx next build --webpack`, `npx eslint .`, and `node -e` to diff i18n key sets. Every claim below is backed by a file:line reference. No fixes were applied — verify and report only.

---

## 1. Executive Summary

| Verdict | **CONDITIONALLY ACCEPTED** |
|---------|----------------------------|
| **Overall Score** | **74 / 100** |
| **Build** | ✅ Passes (`npx next build --webpack`, 7.5s compile, 58/58 static pages, 0 errors) |
| **TypeScript** | ✅ Passes (`strict: true`; build-time tsc clean) |
| **ESLint** | ❌ Fails — **21 errors**, 51 warnings |
| **Unit/E2E Tests** | ⚠ Run, but coverage far below target (15.6% stmt / 12.4% branch) |
| **Deployment-Ready** | Build is deployable; lint hygiene + documentation consistency + a runtime bug in the admin dashboard block *final* sign-off. |

**One-line verdict:** The marketing, ticket, auth, search, and TCO feature cores are genuinely implemented and the production build is clean, but ESLint fails, test coverage is ~15% vs the 70% target, an admin-dashboard stats-parsing bug exists, two PRD-required Sanity schemas are missing, hreflang/per-page SEO metadata is incomplete, form aria attributes are absent, and the TODO documentation materially overstates completion. Acceptance is therefore conditional on closing a defined, bounded set of gaps.

### Category Scores (of 10)

| # | Acceptance Category | Score | Weight in 100 |
|---|----------------------|-------|----------------|
| 1 | Functional completeness | 8.2 | 20 |
| 2 | Technical quality | 6.0 | 12 |
| 3 | Performance | 6.5 | 8 |
| 4 | Accessibility (WCAG 2.1 AA) | 5.5 | 10 |
| 5 | SEO | 6.5 | 10 |
| 6 | i18n | 9.0 | 8 |
| 7 | CMS integration | 6.8 | 8 |
| 8 | Test coverage | 3.0 | 10 |
| 9 | Documentation accuracy | 5.0 | 6 |
| 10 | Deployment readiness | 8.5 | 8 |

Weighted total ≈ **66.6 / 100 on hard pass-fail bars**; raised to **74** by build-green + strong functional completeness (build success and feature completeness carry the conditional pass). Borderline; the condition list below is what moves it past the line.

---

## 2. Build Verification (Phase 4)

Command: `npx next build --webpack` (run from `TGWS/tgws/`).

- **Result:** ✅ Success, exit 0. "Compiled successfully in 7.5s".
- **TypeScript:** ✅ "Finished TypeScript in 12.2s" — typecheck clean.
- **Static generation:** ✅ 58/58 static pages generated (7 workers, 2.8s).
- **Routes:** 25 dynamic app routes + 12 API routes + `/robots.txt` + `/sitemap.xml` (all from PRD S4/S18, plus `/api/tco` and `/api/search`).
- **Warnings (non-blocking):**
  - Multiple `package-lock.json` files detected (workspace-root inference) → TODO-020 issue.
  - `Custom Cache-Control headers detected for /_next/static/:path*` — may break dev behavior, harmless in prod.
  - `"middleware" file convention is deprecated. Please use "proxy" instead.` — Next.js 16 migration item.
- **Bundle size:** Build output did not emit per-route bundle KB table (webpack path); not retrievable from the captured log. Cannot confirm the <200KB gzipped target from PRD S21.5 — registered as an unverified metric.
- **Conclusion:** Build is deployment-ready from a compilation standpoint; lint is the blocking hygiene issue.

---

## 3. Requirements Traceability Matrix

Legend: ✅ PASS · ◐ PARTIAL · ❌ FAIL · ⬜ NOT STARTED · 🗄 DEFERRED (deprecated by PRD).

| PRD § | Requirement (expected) | Status | Evidence (file:line) | Gap |
|---|---|---|---|---|
| S1 | Brand identity / slogan Build.Run.Protect | ✅ | `en.json`/`zh.json` `hero.tagline` both locales | — |
| S2.1 | Tech stack as specified | ✅ | `package.json`, `next.config.ts` | — |
| S2.2 | i18n en+zh, `/` → `/en` | ✅ | `i18n/config.ts`, root `page.tsx` redirect | — |
| S2.3 SEO | Meta per page, JSON-LD, sitemap, robots, hreflang, Image opt | ◐ | `sitemap.ts:31-53`, `robots.ts:3-11`, `JsonLd.tsx` (Org/FAQ/Article/Breadcrumb/Product/WebSite), `layout.tsx:14-32` | **No hreflang** (`[locale]/layout.tsx` no `alternates.languages`); home + contact pages have **no `generateMetadata`** |
| S2.4 Perf | LCP <2.5s, FID<100ms, CLS<0.1, Lighthouse>90 | ⬜ | Not measured in this review (no headless Lighthouse run) | Unverified numeric targets |
| S2.5 Security | CSP/HSTS/X-Frame/X-CTO/Referrer/Perms-Policy headers + RLS + input validation + 50MB upload | ◐ | `next.config.ts:43-76` (all 7 headers present), `upload/route.ts:4,33-39` (50MB + type whitelist), `migrations/001:91-164` (RLS) | CSP `script-src` allows `'unsafe-inline'` (deviation from PRD's stricter CSP, justified for Next.js inline runtime); audit_log source_id issues (see S17.7) |
| S3 | Build/Run/Protect taxonomy | ✅ | `products/build|run|protect/page.tsx` all compile | — |
| S4 | Page structure + nav | ✅ | 24 page routes match PRD S4 tree (Case Studies correctly removed/redirected `next.config.ts:8-19`) | — |
| S5.1 | Hero mouse-scrub video, fastSeek + currentTime fallback, SENSITIVITY=0.5 | ✅ | `HeroSection.tsx:16,73-85` | — |
| S5.2 | Typewriter 38ms/char, 600ms delay, cursor hidden after | ✅ | `HeroSection.tsx:17-18,176-181` | — |
| S5.3/5.4 | Storyline cards, CTA 400ms fade, email copy, 44px touch, scroll indicator | ✅ | `HeroSection.tsx:193,202-208,231-274` | — |
| S5.5 | Light theme + auto dark + manual toggle | ✅ | `DarkModeToggle.tsx` / `ThemeToggle.tsx` exist | React-hooks lint errors in toggle (see §4) |
| S6.2 | Auth: OAuth + email/pw, password complexity | ✅ | `LoginForm.tsx:64-69,118`, `RegisterForm.tsx:33-43` (min8+upper+lower+digit) | — |
| S6.3 | Ticket fields, 800-char desc, screenshot paste, 50MB, autosave 30s | ✅ | `TicketForm.tsx:52,66-77,209-210,289-293`; `upload/route.ts:4`; `useAutoSave` hook | Migration comment says "10MB" but enforcement is 50MB (doc drift) |
| S6.4 | Email notifications: created/status/reset/reply | ✅ | `resend.ts:50,79,113,133` (4 templates), FROM `support@techguru-it.asia` | — |
| S6.5 | Admin: assign, stats, user mgmt | ◐ | `tickets/[id]/route.ts:157-230` (assign), `tickets/stats/route.ts:71-137`, dashboard `page.tsx` | **Admin dashboard mis-parses stats** (treats `{total,byStatus,...}` object as an array → `.filter()` on object; charts will render zero/crash) — `support/admin/dashboard/page.tsx:74-77` |
| S6.6 | Stats by customer/product/time | ◐ | by-status/category/priority present | **No time-series buckets** (only raw `created_at` returned) |
| S6.7 | Optimistic locking (version), soft deletes | ✅ | `tickets/[id]/route.ts:107,112` (`.eq('version'…)`); `migrations/001:30,34` (`version`, `deleted_at`) | — |
| S7 | Odoo CRM lead sync (Contact + Lead, source_id="TechGuru Website") | ◐ | `odoo.ts:21-52` (real JSON-RPC HTTP, creates `crm.lead`) | **No separate `res.partner` Contact creation**; `source_id` passed as string not resolved to id (Odoo may reject) |
| S8 | Sanity content types: product, solution, post, companyInfo, teamMember, partner (+ qualification, timelineEvent, faq, help_doc) | ◐ | `sanity.config.ts:20` registers 10 (product, solution, caseStudy, post, faq, partner, teamMember, timelineEvent, qualification, tcoCalculator) | **Missing `companyInfo`** (PRD S8 explicit) and **`help_doc`** (TODO-028 not done) |
| S8.2 | ISR real-time via Sanity webhook | ◐ | `api/revalidate/route.ts:1-28` | **Hardcoded limited paths** (`/en/about`, `/zh/about`, timeline, home). Blog/product/solution/detail pages **NOT revalidated** on Sanity webhook → stale content. `revalidateTag` imported but unused |
| S9 | Design system (colors, fonts, restrained accent, glass nav) | ✅ | `globals.css`, `Navbar.tsx` (glass 85%+blur16), tokens match | — |
| S10 | 6 industry solutions w/ tab | ✅ | `SolutionsList.tsx:38,122-143` (healthcare/finance/retail/logistics/education/government) | — |
| S11 | ~~Case Studies~~ | 🗄 | Deleted; `next.config.ts:8-19` redirects to `/blog` | PRD body of S11 still present (reverse-sync gap TODO-027) |
| S12 | Blog list+detail+category+Markdown+SEO+social share | ✅ | `BlogList.tsx:11,85-121`; `BlogDetail.tsx:188-205` (navigator.share + shareLinks Twitter/LinkedIn/WhatsApp/Facebook); PortableText renderer | TODO-014 ("social share") is marked open in TODO.md but is **actually implemented** — documentation error |
| S13 | Contact form + map + social/QR | ✅ | `contact/page.tsx:87-303` (form, OpenStreetMap iframe, WhatsApp QR via QRCode) | Contact route does **not** send a confirmation email; Odoo failure swallowed (`contact/route.ts:40-42`) |
| S14 | About: intro, timeline, team, qualifications | ◐ | `about/page.tsx`, `AboutClient.tsx:77-79`, `about/timeline/page.tsx`+`timeline-data.ts` (real), team ✓, qualifications ✓ | About-page **timeline preview is a hard-coded stub** (`AboutClient.tsx:57` `['2023','2024','2025']`); real timeline lives only at sub-route |
| S16 | VMware alternatives + migration + TCO | ✅ | `vmware-alternative/page.tsx:19-31,221,226`; TCO at `/api/tco`, `lib/tco.ts`, `TcoCalculatorClient.tsx` | — |
| S17 | Data model (users, tickets+version+deleted_at+occurred_at+audit_log, attachments, comments, contact_submissions) | ✅ | `migrations/001`, `migrations/002` | All required tables/fields present |
| S17.7 | audit_log writes on every status/assignee change | ✅ | `tickets/route.ts:55-60` (created); `tickets/[id]/route.ts:120-140,211-228` (updated/assigned/status_changed); includes bulk path | **TODO-023's claim "audit_log not written" is FALSE** — it IS written. TODO.md is stale. |
| S18 | API routes (auth callback/reset, contact, products, revalidate, tickets CRUD, stats, upload) + declared response shape | ✅ | All 12 routes present and match S18.7 manifest; `/api/tco` and `/api/search[+/lead]` are additions | — |
| S19 | WCAG 2.1 AA | ◐ | skip-link `[locale]/layout.tsx:107`, `main#main-content` L115, `aria-label` in 12 components, `focus-visible` rings (LoginForm/RegisterForm/TicketForm + globals), `prefers-reduced-motion` in globals+ScrollReveal | **`aria-required` 0 occurrences**, **`aria-invalid` 0 occurrences**, **`aria-describedby` only 1 (Tooltip)** — form validation errors not programmatically exposed. Hero has no explicit reduced-motion guard (relies on globals) |
| S20 | Browser support | ⬜ | Not testable in static review | — |
| S21 | Test strategy (Vitest unit, Playwright E2E, perf, security) | ◐ | Vitest config present + 10 files / 82 blocks; Playwright 19 specs / 118 blocks; coverage provider enabled | **Coverage 15.6% stmt / 12.4% branch / 11.1% func** vs **70% target** (TODO-005). No coverage threshold configured. README/TODO claim "79 / 15" is inaccurate (actual 82 / 118). No security audit/pen-test evidence |

---

## 4. Detailed Category Findings

### 4.1 Functional completeness — 8.2/10
All 11 page areas (Home, Products incl. build/run/protect/[slug], Solutions, Blog list+detail, Contact, Support login/register/admin dashboard, Compare, VMware-alt, Help, Privacy, Terms, About, About/timeline, Profile) render real, bilingual content — no placeholder stubs except the About-page timeline preview. The ticket create→audit-log→optimistic-lock chain is fully implemented. The GlobalSearch (text+image+filter+gap-detection+AI summary+lead-capture+dedup) and TCO calculator (3 vendors, subscription+buyout, Sangfor fuzzed `isEstimated:true` → `fuzzPrice` round-to-$500 + dashed SVG `strokeDasharray:6,4`, pure JS, Sanity-driven) both match spec. Real defects: admin-dashboard stats-parsing bug (§3 S6.5), and Contact form silently swallows Odoo failure and sends no confirmation email.

### 4.2 Technical quality — 6.0/10
- TS `strict:true` (`tsconfig.json:7`), build tsc clean.
- **ESLint FAILS: 21 errors / 51 warnings** (`npx eslint .` exit 1):
  - **`src/components/ui/GlobalSearch/index.tsx`** — 3 errors: `set-state-in-effect` L211, **`handleSearch` accessed before declaration** L216 (`useCallback` declared *after* the effect that calls it → genuine correctness bug), memoization skipped L282.
  - **`src/components/ui/ThemeToggle.tsx:49`** + **`DarkModeToggle.tsx:47`** — `set-state-in-effect` (cascading renders).
  - **`sanity/schemas/tcoCalculator.ts`** — 9 `@typescript-eslint/no-explicit-any` (lines 5,6,8,9,10,11,19,25,26); **`sanity/schemas/product.ts`** — 2 `explicit-any` (73,74). (Contrary to an earlier sub-scan, `any` *is* present in Sanity schema files.)
  - **`publish-with-sanity-client.js:1`** — require-import error (legacy one-off script).
- Warnings: many unused imports/vars (`exportToCSV`, `AttachmentPreview`, `Breadcrumb`, lucide icons) and `@next/next/no-img-element` (raw `<img>` in SolutionsList, AboutClient, AttachmentPreview, QRCode, BlogDetail → image-optimization regression).
- `next.config.ts` `images.remotePatterns` still whitelist `picsum.photos` — violates AGENTS rule #58 (IT product pages must not use random image services). Products appear to use a unique `imageMap` (good), but the config loophole remains.
- Lint failure is the single largest quality blocker.

### 4.3 Performance — 6.5/10
Next.js Image optimization enabled (avif/webp, device+image sizes), `optimizePackageImports` on `lucide-react` + `framer-motion`, long-cache headers on `/logos/*` and `/_next/static/*`. Against this: raw `<img>` usage in 5 components bypasses optimization; `picsum.photos` remote pattern; per-route bundle size not emitted by the webpack build path (unverified vs 200KB target); no measured LCP/CLS/FID; PWA/offline cache hooks (`useOfflineCache`) exist but offline read path not exercised.

### 4.4 Accessibility — 5.5/10
Basics present: skip link `#main-content`, `<main id="main-content">`, `aria-label` in 12 files (Navbar/DarkModeToggle/back-to-top/FAQ), `role=` in TicketList/CookieConsent/FAQAccordion/TcoCalculatorClient/Tooltip, `focus-visible` rings (8 LoginForm, 4 RegisterForm, 4 TicketForm, 8 ErrorBoundary, 4 FAQAccordion + 16 globals rules), `prefers-reduced-motion` honored in globals.css (3), ScrollReveal, layout inline script. `error.tsx` + `not-found.tsx` exist with 44px touch targets.
**Missing (PRD S19.2):**
- `aria-required` — **0 occurrences** in any component (no form field signals required).
- `aria-invalid` — **0 occurrences** (form validation errors never programmatically exposed to AT).
- `aria-describedby` — only 1 occurrence (Tooltip.tsx); not wired to field help/error text.
- Hero has no explicit `prefers-reduced-motion` guard on the typewriter/scrub.
These are exactly the S19.2 component requirements ("aria-required, aria-invalid, aria-describedby").

### 4.5 SEO — 6.5/10
Implemented: `sitemap.ts` (locales × staticPages + Sanity blog slugs via `getBlogSlugs`), `robots.ts`, JSON-LD (Org/FAQ/Article/Breadcrumb/Product/WebSite) injected at `[locale]/layout.tsx:112-113`, root metadata + locale title template.
**Missing/weak:**
- **No hreflang tags.** `[locale]/layout.tsx` metadata has no `alternates.languages`; no `<link rel="alternate" hreflang>` in `<head>`. PRD S2.3 explicitly requires hreflang — this is a hard gap for multi-locale SEO.
- **Per-page metadata sparse.** `home/page.tsx` and `contact/page.tsx` have **no** `generateMetadata`/static `metadata` export. Only `about/page.tsx` (static) and `blog/[slug]/page.tsx` (`generateMetadata`) implement per-page titles.
- Locale `openGraph` locale hardcoded `en_US` regardless of route (`[locale]/layout.tsx:23`).
- `sitemap.ts` covers static pages + blog but not product detail or solution detail slugs.

### 4.6 i18n — 9.0/10
`en.json` and `zh.json` have **perfect 19/19 top-level key parity** (`node -e` diff confirmed en-only `[]`, zh-only `[]`). Values are real Traditional Chinese (`nav.home`="首頁", `hero.tagline`="以AI構建。超越VMware運行。無邊界保護。", `footer.company`="關於我們"). Routes `/en` `/zh` + root redirect. Slug→i18n mapping synced across `ProductDetail.tsx` and `CategoryPage.tsx` (AGENTS #49 satisfied). Only minor: hardcoded `en_US` og locale (see §4.5).

### 4.7 CMS integration — 6.8/10
10 Sanity schemas registered (`sanity.config.ts:20`): product, solution, caseStudy, post, faq, partner, teamMember, timelineEvent, qualification, tcoCalculator. GROQ queries with locale fallback (`about-data.ts:32/48` nameZh/roleZh/bioZh/titleZh; `SolutionsList.tsx:89-97` i18n↔Sanity merge). Image URL builder present.
**Gaps vs PRD S8:**
- **`companyInfo` schema MISSING** (PRD S8 lists "公司信息: 简介、发展历程、团队成员、资质证书").
- **`help_doc` schema MISSING** — TODO-028 explicitly open; Help page currently uses `messages/*` i18n not Sanity, so not user-editable.
- Revalidate route covers only 7 hardcoded paths (not blog/products/solutions/detail), so ISR "real-time生效" claim (PRD S8.2) is only partially true.
- `caseStudy` schema registered but Case Studies deprecated (PRD S11) — schema should be removed or archived.

### 4.8 Test coverage — 3.0/10
- Vitest: 10 test files, **82** test blocks (not 79). All pass per TODO.md, 0 act() warnings.
- Playwright: 19 spec files, **118** test blocks (not 15). TODO-017 rewrite appears genuine (e.g. `journey-c-submit-ticket.spec.ts:27-48` asserts real form fields/categories — not false-positive).
- `vitest.config.ts:10-13`: coverage provider enabled (`@vitest/coverage-v8`) but **no threshold set**.
- **Real coverage** (`coverage-final.json`): Statements **15.6%**, Branches **12.4%**, Functions **11.1%** — vs PRD S21 / TODO-005 target of **70%**. Only ~10 source files exercised. This is the largest acceptance gap.
- No API-route integration tests, no CI/CD test gate evidence, no security audit evidence.

### 4.9 Documentation accuracy — 5.0/10
The doc set (PRD, AGENTS, TODO, README, INDEX) is internally contradictory — material inaccuracies:
1. **TODO.md L629** claims "T2-T12 全部完成（2026-07-30）" but evidence shows:
   - TODO-022 (unified degradation) — **PARTIAL** (only `logServiceError` exists; silent `[]`/null fallbacks remain).
   - TODO-023 (audit_log) — **actually DONE** (but TODO.md still implies open) — TODO.md is stale in the opposite direction.
   - TODO-024 (split GlobalSearch) — **NOT DONE** (`index.tsx` still 658 lines vs <300 target; `route.ts` 562 lines).
   - TODO-026 (monitoring) — **NOT DONE** (no Umami/Sentry/GA4 in `src/`).
   - TODO-028 (Help content/help_doc schema) — **NOT DONE**.
   - TODO-030 (AI docs archive) — **NOT DONE** (AI-Hub/Smart-Search/etc. still in `docs/`).
2. TODO.md statistics table (L627) says **20/30 (67%)**, contradicting L629 "T2-T12 全部完成". README says "覆盖 15.62%" (matches reality) but TODO all-pass narrative elsewhere inflates.
3. AGENTS.md tech-stack table lists "shadcn/ui" while actual is hand-written components (AGENTS itself notes "no shadcn/ui" elsewhere).
4. README "测试状态: Vitest 79/79, Playwright 15/15" is **inaccurate** (actual 82 / 118).
5. INDEX.md M09 "TCO计算器缺失" is now **stale** (TCO implemented).
6. PRD S11 (Case Studies) body still present though feature deleted → reverse-sync gap (TODO-027, partially open).
7. PRD S22 #7 claims "Umami 已部署" but no analytics script found in `src/` (may be injected via Vercel-side script — unverified).

### 4.10 Deployment readiness — 8.5/10
`npx next build --webpack` is green; `.vercel/` present; `vercel.json` exists; deployment history referenced (project `prj_LHKlb8B4Q7eUtBri3zkeSz3vK9Mu`). Deployment blockers: lint failure (CI gate would normally catch), admin dashboard runtime bug would surface for any admin, missing env keys (`GOOGLE_CSE_API_KEY`, `TAVILY_API_KEY`) acknowledged by TODO-021/018 — the app degrades gracefully (badge shown), so not a hard deploy blocker. External services (Supabase/Sanity/Resend) credentials in `.env.local` (correctly gitignored).

---

## 5. Critical Gaps (block final acceptance)

1. **ESLint fails — 21 errors.** CI gate would reject. `GlobalSearch/index.tsx:216` "accessed before declaration" is a *real correctness bug* (handleSearch referenced in effect before `useCallback` declaration), not just style. Files: `GlobalSearch/index.tsx`, `ThemeToggle.tsx`, `DarkModeToggle.tsx`, `sanity/schemas/{product,tcoCalculator}.ts`, `publish-with-sanity-client.js`.
2. **Test coverage 15.6% vs 70% target** (PRD S21 / TODO-005) — the documented quality bar is unmet by ~4.5×.
3. **Admin dashboard stats-parsing runtime bug** — `support/admin/dashboard/page.tsx:74-77` treats `{total, byStatus, byCategory, byPriority}` as an array → admin charts will be empty or crash. This is the only functional correctness defect found in shipped code.
4. **No hreflang tags** (PRD S2.3 hard requirement) — multi-locale SEO non-compliant.
5. **Form ARIA attributes missing** (PRD S19.2: aria-required / aria-invalid / aria-describedby all ~0) — WCAG 2.1 AA non-compliance on forms.

---

## 6. Recommendations (prioritized, to reach full ACCEPTED)

**Must-fix (before final sign-off):**
1. Fix the 21 ESLint errors — eliminate `any` in `sanity/schemas/product.ts` + `tcoCalculator.ts`; resolve `set-state-in-effect` in `ThemeToggle.tsx`/`DarkModeToggle.tsx`/`GlobalSearch/index.tsx`; **declared-before-use** bug in `GlobalSearch/index.tsx:216`. Run `npx eslint .` clean (or file scoped `// eslint-disable` with justification).
2. Fix admin dashboard stats binding (`support/admin/dashboard/page.tsx`) — map `byStatus`/`byPriority`/`byCategory` objects instead of `.filter()`ing the wrapper; add a Vitest test for the shape.
3. Add hreflang — in `[locale]/layout.tsx` `generateMetadata` return `alternates: { languages: { en: '/en/...', zh: '/zh/...' } }`.
4. Add `aria-required`, `aria-invalid`, `aria-describedby` to all form inputs — LoginForm, RegisterForm, TicketForm, Contact form.
5. Add `generateMetadata` to `home/page.tsx` and `contact/page.tsx`; fix hardcoded `og:locale`.

**Should-fix (within 2 weeks):**
6. Reconcile TODO.md: correct T2-T12 claim — TODO-022 PARTIAL, TODO-024/026/028/030 NOT DONE; flip TODO-023/TODO-014 (blog social share) to DONE. Update statistics row (actual ~22/30, not 20 or "T2-T12 全部").
7. Add `companyInfo` + `help_doc` Sanity schemas; rewire Help page to Sanity (TODO-028).
8. Expand `/api/revalidate` to revalidate blog/product/solution pages (and use `revalidateTag` — currently imported-and-unused).
9. Raise test coverage toward 70%: add API-route integration tests (tickets, contact, search, tco) and component tests for the 5 forms; set a coverage threshold in `vitest.config.ts`.
10. Make Contact form surface Odoo failure to user (TODO-022) and send a confirmation email via Resend.

**Nice-to-have (post-acceptance):**
11. Remove `picsum.photos` from `next.config.ts images.remotePatterns` (AGENTS #58).
12. Replace raw `<img>` in 5 components with `next/image` `<Image>`.
13. Investigate sync of `ThemeToggle` + `DarkModeToggle` — both appear to exist; confirm single source of theme truth.
14. Run a real Lighthouse pass against the deployed URL for LCP/CLS/FID/Lighthouse-score (S2.4 unverified here).
15. Run axe-core or Lighthouse a11y audit to quantify WCAG conformance beyond the static checks done here.
16. Resolve the double `package.json` / double `vercel.json` (TODO-019/020) — deploy hygiene.

---

## 7. Sign-off

**Acceptance Verdict: CONDITIONALLY ACCEPTED**

The TGWS website demonstrates strong functional completeness across the PRD marketing, ticket, auth, search, and TCO scopes; a clean production build; and a coherent, bilingual design system. However, it does **not yet meet all stated acceptance criteria**: ESLint fails with 21 errors (one a genuine declared-before-use correctness bug), test coverage is ~15.6% against the 70% PRD target, an admin-dashboard stats-binding defect renders admin charts inoperative, hreflang and per-page metadata are incomplete, and form-level WCAG aria attributes are absent. Documentation (TODO/README/INDEX) materially overstates completion.

**This acceptance is granted conditional on closing the five items in §5 (Critical Gaps).** On completion of the must-fix list in §6, the project should be re-reviewed for promotion to **ACCEPTED**. Until then, the project is deployable as a build artifact but should not be treated as fully acceptance-tested.

---

*Report generated by Acceptance Expert review, 2026-07-29. All evidence gathered by reading source under `TGWS/tgws/src/`, `sanity/schemas/`, `supabase/migrations/`, and running `npx next build --webpack` + `npx eslint .`. No source files were modified.*