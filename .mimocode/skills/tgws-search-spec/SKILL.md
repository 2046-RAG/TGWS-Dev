---
name: tgws-search-spec
description: Use when modifying search-related code in TGWS (GlobalSearch component, /api/search route, Tavily integration, AI summary generation). This is the authoritative implementation spec — follow it exactly, do not simplify.
---

# TGWS Global Search — Implementation Spec

This is a DESIGN SPECIFICATION, not a reference guide. Every point below is a hard requirement.

## Architecture

- **Internal search**: Sanity GROQ queries against products, solutions, posts, faqs
- **External search**: Google CSE (breadth) + Tavily (depth) running in parallel
- **Deduplication**: URL-based, removes external results that match internal URLs
- **AI Summary**: Must be a FUSION of all sources, NOT a pass-through of any single source

## AI Summary Generation Rules (CRITICAL)

The `generateAiSummary()` function in `/api/search/route.ts` MUST:

1. **Inject TechGuru context** into the Tavily query:
   - Prefix: "TechGuru Network & Data Solutions (enterprise IT solutions company in Philippines, covering Build/Run/Protect pillars): "
   - This ensures Tavily answers from an enterprise IT perspective, not generic web perspective

2. **Use internal results as PRIMARY fact source**:
   - If internal results exist, they MUST appear in the summary
   - Internal products/solutions are authoritative — external sources supplement them
   - NEVER skip internal results just because Tavily has an answer

3. **Structure the summary output**:
   - "TechGuru offers: [list matching internal products/solutions with links]"
   - "Key knowledge: [Tavily/CSE synthesized insight]"
   - NOT a single paragraph of generic text

4. **Never return raw Tavily answer**:
   - Tavily's `answer` field is generic web content
   - It must be post-processed: extract relevant facts, combine with internal context, produce TechGuru-specific summary

## Frontend Rendering Rules

The AI Summary in `GlobalSearch/index.tsx` MUST:

1. **Show two distinct sections**:
   - "From TechGuru" (internal results) — with product/solution links
   - "AI Insights" (synthesized from external sources) — with source attribution

2. **Format as structured content**:
   - Bullet points for product recommendations
   - Hyperlinks to actual product/solution pages
   - NOT a single block of plain text

## Tavily Query Design

When calling Tavily API, the query MUST include TechGuru context:

```
Bad:  "HCI"
Good: "TechGuru enterprise IT: HCI hyper-converged infrastructure solutions, alternatives, comparison"
```

## Validation Checklist

Before any code change to search functionality, verify:

- [ ] Does the AI summary contain internal results (not just external)?
- [ ] Does the Tavily query include TechGuru business context?
- [ ] Is the summary structured (not a single paragraph)?
- [ ] Does the frontend show distinct internal/external sections?
- [ ] Are all Sanity content types searched (product, solution, post, faq)?
