# TechGuru Website - TGWS

TechGuru Network & Data Solutions 官方网站 - Next.js 应用

## Tech Stack

| Component | Version |
|-----------|---------|
| Next.js | 16.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Sanity | v3 |
| Supabase | Latest |
| Vitest | Latest |
| Playwright | Latest |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript check
npm run test         # Unit tests (Vitest) - 49/49 passing
npm run test:e2e     # E2E tests (Playwright) - 47/47 passing
```

## Project Structure

```
tgws/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/           # i18n routing (en/zh)
│   │   │   ├── page.tsx        # Home
│   │   │   ├── products/       # Products
│   │   │   ├── solutions/      # Industry solutions
│   │   │   ├── case-studies/   # Case studies
│   │   │   ├── blog/           # Blog
│   │   │   ├── about/          # About us
│   │   │   ├── support/        # Support/tickets
│   │   │   └── contact/        # Contact
│   │   └── api/                # API routes
│   ├── components/             # Reusable components
│   ├── lib/                    # Utilities, clients
│   └── types/                  # TypeScript types
├── tests/
│   ├── vitest/                 # Unit tests (49 tests)
│   └── playwright/             # E2E tests (47 tests)
└── ...
```

## Multi-Language

- English: `/en/...`
- Traditional Chinese: `/zh/...`
- Default `/` redirects to `/en`

## Deployment

**Live**: https://www.techguru-it.asia

Deployed on Vercel with automatic deployments on push to main.
