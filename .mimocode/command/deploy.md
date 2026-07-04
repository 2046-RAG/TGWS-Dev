---
description: "Run lint, typecheck, build, and deploy to Vercel production in one step"
agent: main
---

# Deploy Command

Execute the full CI pipeline: lint → typecheck → build → deploy.

## Steps

1. **Lint check**: `npm run lint` in `tgws/`
2. **TypeScript check**: `npx tsc --noEmit` in `tgws/`
3. **Production build**: `npm run build -- --webpack` in `tgws/`
4. **Deploy**: `npx vercel --prod --yes` in `tgws/`

## Constraints

- If any step fails, stop and report the error
- Do NOT deploy if lint/typecheck/build has errors
- Warnings (img tags, unused vars) are acceptable
- Production URL: https://www.techguru-it.asia

## Arguments

- `$1` — optional, skip lint if "no-lint" is passed
