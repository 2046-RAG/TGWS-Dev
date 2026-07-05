# Content Generation Assistant — Technical Design Document

**Feature:** AI-powered Content Generation Assistant for TGWS  
**AI Model:** GPT-4o-mini (OpenAI)  
**Target Users:** Admin/content editors (authenticated)  
**PRD Sections:** [S8] CMS Content Management, [S12] Blog, [S11] Case Studies, [S3] Products  

---

## 1. Feature Overview

### 1.1 Purpose

The Content Generation Assistant is an internal admin tool that helps content editors produce, translate, optimize, and publish bilingual (English / Traditional Chinese) content across all Sanity-managed content types: **Blog Posts**, **Case Studies**, **Products**, and **Solutions**.

### 1.2 Capabilities Matrix

| Capability | Input | Output | Content Types |
|---|---|---|---|
| **Summary Generation** | Full article body | Concise 2–3 sentence summary | Post, Case Study |
| **Translation** | EN content → ZH (or reverse) | Translated counterpart fields | All (Post, Case Study, Product, Solution) |
| **SEO Optimization** | Article title + body | Meta title, meta description, keywords (max 10) | Post, Case Study, Solution |
| **Social Media Copy** | Article title + excerpt | LinkedIn post, Facebook post, X/Twitter thread | Post, Case Study |
| **Blog Draft Generation** | Topic prompt + category | Full blog draft (EN) | Post |
| **Case Study Structuring** | Raw notes (client, challenge, solution, results) | Structured case study draft | Case Study |
| **Product Description** | Product name + features list | Polished EN description | Product |
| **Batch Processing** | Document type + selection filter | Bulk translation/SEO for all matching docs | All |

### 1.3 Design Constraints

- **Model:** GPT-4o-mini via OpenAI API (cost-efficient, fast)
- **Token budget:** Max 4,096 output tokens per call
- **Cost ceiling:** Rate limit at 50 requests/minute per admin session
- **Language pair:** English ↔ Traditional Chinese only
- **Human-in-the-loop:** Every generated output enters a **draft** state; nothing is auto-published

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │ ContentEditor   │  │ ContentGenerationPanel       │  │
│  │ (Sanity desk)   │  │ (floating sidebar)            │  │
│  └────────┬────────┘  └──────────────┬───────────────┘  │
│           │                          │                   │
│  ┌────────▼──────────────────────────▼───────────────┐  │
│  │           API Routes (src/app/api/content/)        │  │
│  └────────┬──────────────────────────┬───────────────┘  │
│           │                          │                   │
│  ┌────────▼────────┐  ┌──────────────▼───────────────┐  │
│  │ Sanity Client   │  │ OpenAI Client                │  │
│  │ (write drafts)  │  │ (GPT-4o-mini)                │  │
│  └─────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.1 Data Flow

```
User triggers action → Frontend calls API route → API route:
  1. Authenticates user (Supabase Auth)
  2. Validates input parameters
  3. Constructs system + user prompt
  4. Calls OpenAI API (GPT-4o-mini)
  5. Post-processes response (validation, sanitization)
  6. Returns structured JSON to frontend
  7. User reviews output → optionally writes to Sanity as draft
```

---

## 3. Sanity Schema Extensions

### 3.1 New Fields on `post` Schema

```typescript
// Added to sanity/schemas/post.ts
defineField({
  name: 'metaTitle',
  type: 'string',
  title: 'SEO Meta Title',
  validation: (r) => r.max(60),
}),
defineField({
  name: 'metaDescription',
  type: 'text',
  title: 'SEO Meta Description',
  validation: (r) => r.max(160),
}),
defineField({
  name: 'seoKeywords',
  type: 'array',
  of: [{ type: 'string' }],
  title: 'SEO Keywords',
}),
defineField({
  name: 'socialMedia',
  type: 'object',
  title: 'Social Media Copy',
  fields: [
    defineField({ name: 'linkedin', type: 'text', title: 'LinkedIn' }),
    defineField({ name: 'facebook', type: 'text', title: 'Facebook' }),
    defineField({ name: 'twitter', type: 'text', title: 'X/Twitter' }),
  ],
}),
defineField({
  name: 'aiGenerated',
  type: 'boolean',
  title: 'AI Generated',
  initialValue: false,
  readOnly: true,
}),
defineField({
  name: 'aiReviewedBy',
  type: 'string',
  title: 'Reviewed By (Human)',
}),
```

### 3.2 Parallel Fields on `caseStudy`, `solution`, `product`

The same `metaTitle`, `metaDescription`, `seoKeywords`, `socialMedia`, and `aiGenerated` fields are added to `caseStudy.ts`, `solution.ts`, and `product.ts` schemas with identical definitions (minus the `socialMedia` field on `product`).

### 3.3 New Sanity Document Type: `aiGenerationLog`

Tracks every AI generation request for auditability:

```typescript
// sanity/schemas/aiGenerationLog.ts
defineType({
  name: 'aiGenerationLog',
  title: 'AI Generation Log',
  type: 'document',
  fields: [
    defineField({ name: 'action', type: 'string' }),       // 'translate' | 'summarize' | 'seo' | 'social' | 'draft'
    defineField({ name: 'contentType', type: 'string' }),   // 'post' | 'caseStudy' | 'product' | 'solution'
    defineField({ name: 'contentId', type: 'string' }),     // Sanity document _id
    defineField({ name: 'sourceLang', type: 'string' }),    // 'en' | 'zh'
    defineField({ name: 'targetLang', type: 'string' }),    // 'en' | 'zh'
    defineField({ name: 'inputTokens', type: 'number' }),
    defineField({ name: 'outputTokens', type: 'number' }),
    defineField({ name: 'model', type: 'string' }),         // 'gpt-4o-mini'
    defineField({ name: 'adminUser', type: 'string' }),     // Supabase user ID
    defineField({ name: 'createdAt', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'action', subtitle: 'contentType' },
  },
});
```

---

## 4. API Design

### 4.1 Base Path

All endpoints under `src/app/api/content/`

### 4.2 Authentication

Every endpoint requires a valid Supabase session with admin role:

```typescript
// Middleware check (shared)
import { createClient } from '@/lib/supabase/server';

async function requireAdmin(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    throw new Response('Forbidden', { status: 403 });
  }

  return { user, supabase };
}
```

### 4.3 Endpoints

#### POST `/api/content/generate`

**Purpose:** General-purpose content generation (dispatches by `action` parameter).

**Request Body:**

```json
{
  "action": "translate" | "summarize" | "seo" | "social" | "draft" | "structure" | "description",
  "contentType": "post" | "caseStudy" | "product" | "solution",
  "contentId": "sanity-document-id",       // required for translate/summarize/seo/social
  "sourceLang": "en" | "zh",              // required for translate
  "targetLang": "zh" | "en",              // required for translate
  "topic": "string",                       // required for draft
  "category": "string",                    // optional, for draft
  "notes": "string",                       // optional, for structure
  "rawData": { ... }                       // optional, for description
}
```

**Response (200):**

```json
{
  "success": true,
  "action": "translate",
  "result": {
    "fields": {
      "titleZh": "翻譯後的標題",
      "excerptZh": "翻譯後的摘要"
    },
    "fullText": "完整翻譯內容...",
    "tokenUsage": { "input": 1200, "output": 800 }
  }
}
```

**Response (400/401/429):**

```json
{
  "error": "Missing required fields: contentId, sourceLang, targetLang"
}
```

#### POST `/api/content/batch`

**Purpose:** Process multiple documents in one request (max 10 per batch).

**Request Body:**

```json
{
  "action": "translate" | "seo" | "social",
  "contentType": "post",
  "documentIds": ["id1", "id2", ...],
  "targetLang": "zh",
  "options": {
    "overwriteExisting": false
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "processed": 10,
  "succeeded": 9,
  "failed": 1,
  "results": [
    { "documentId": "id1", "status": "success" },
    { "documentId": "id2", "status": "error", "error": "Token limit exceeded" }
  ]
}
```

#### GET `/api/content/preview`

**Purpose:** Generate preview content without persisting (for live preview in editor).

**Query Params:**

| Param | Type | Description |
|---|---|---|
| `action` | string | Generation action |
| `contentId` | string | Sanity document ID |
| `targetLang` | string | Target language |

**Response:** Same as `/api/content/generate` but no Sanity write.

#### POST `/api/content/seo-analyze`

**Purpose:** Analyze existing content and return SEO score + improvement suggestions.

**Request Body:**

```json
{
  "contentType": "post",
  "contentId": "sanity-document-id",
  "targetKeywords": ["cybersecurity", "NGFW"]  // optional
}
```

**Response (200):**

```json
{
  "score": 72,
  "analysis": {
    "title": { "score": 85, "issues": ["Title could be more specific"] },
    "metaDescription": { "score": 60, "issues": ["Too short", "Missing CTA"] },
    "headings": { "score": 80, "issues": [] },
    "keywords": { "score": 65, "issues": ["Missing long-tail keywords"] },
    "readability": { "score": 78, "issues": ["Some sentences are too long"] }
  },
  "suggestions": [
    "Add target keyword 'next-gen firewall' to meta description",
    "Break 3 long paragraphs into shorter sections",
    "Add internal links to related products"
  ]
}
```

### 4.4 Rate Limiting

Implemented via an in-memory map keyed by user ID:

```typescript
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, limit = 50, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
```

---

## 5. OpenAI Integration — Prompts & Post-Processing

### 5.1 Client Setup

```typescript
// src/lib/openai.ts
import OpenAI from 'openai';

let openai: OpenAI | null = null;

export function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export const MODEL = 'gpt-4o-mini';
```

### 5.2 System Prompts

#### Translation Prompt

```
You are a professional translator specializing in IT and cybersecurity terminology.
Translate the following content between English and Traditional Chinese (zh-TW).

Rules:
- Preserve all technical terms (product names, acronyms like NGFW, XDR, ZTNA)
- Maintain Markdown formatting
- Keep code blocks unchanged
- Use professional, formal tone matching enterprise IT industry
- Traditional Chinese must use Taiwan conventions (not Simplified Chinese)
- Preserve all HTML tags and Sanity block formatting
- Do not add or remove content; translate faithfully
```

#### Summary Generation Prompt

```
You are a technical content editor for TechGuru Network & Data Solutions,
an IT solutions integrator in Asia covering Build/Run/Protect categories.

Generate a concise summary (2-3 sentences, max 300 characters) for the following content.
The summary should:
- Capture the core message and value proposition
- Be suitable for article excerpt / meta description
- End with a subtle call-to-action or insight
- Target IT decision-makers and technical leaders
```

#### SEO Optimization Prompt

```
You are an SEO specialist for B2B IT infrastructure content.
Analyze the following article and generate:

1. metaTitle: SEO-optimized title (max 60 characters)
2. metaDescription: Compelling meta description (max 160 characters)
3. keywords: Array of up to 10 relevant keywords, ordered by relevance

Rules:
- Include primary keyword naturally in title and description
- Focus on search intent for IT buyers (comparison, solution-seeking, problem-aware)
- Avoid keyword stuffing
- Use action-oriented language
- Include geographic modifier "Asia" or "APAC" when relevant
```

#### Social Media Prompt

```
You are a social media copywriter for TechGuru Network & Data Solutions.
Generate platform-specific promotional copy for the following article.

LinkedIn: Professional, thought-leadership tone. 150-200 words. Include 3-5 hashtags.
Facebook: Engaging, conversational. 100-150 words. End with question.
X/Twitter: Punchy thread (2-3 tweets). Each tweet max 280 chars. Use thread format.

Rules:
- Highlight key takeaways
- Tag relevant industry categories (#CyberSecurity, #CloudComputing, etc.)
- Include a call-to-action (Read more / Contact us)
- Match TechGuru brand voice: professional, forward-thinking, trustworthy
```

#### Blog Draft Prompt

```
You are a technical content writer for TechGuru Network & Data Solutions,
an Asian IT solutions integrator covering Build (AIGC, AI agents),
Run (virtualization, HCI, cloud, hardware), and
Protect (NGFW, XDR, SASE, ZTNA, MDR).

Write a blog post about: {topic}
Category: {category}

Structure:
1. Compelling title
2. Introduction (hook the reader with a problem statement)
3. Body with H2/H3 subheadings (3-5 sections)
4. Technical depth appropriate for IT decision-makers
5. Practical takeaways
6. Conclusion with CTA (contact TechGuru)

Tone: Professional, authoritative, forward-thinking.
Length: 800-1200 words.
Format: Markdown with proper heading hierarchy.
```

#### Case Study Structuring Prompt

```
You are a technical case study writer for TechGuru Network & Data Solutions.
Structure the following raw notes into a professional case study format.

Output sections:
1. Title (compelling, benefit-oriented)
2. Client Overview (1-2 sentences, anonymize if needed)
3. Challenge (2-3 paragraphs describing the problem)
4. Solution (detailed implementation description, products used)
5. Results (quantified outcomes with metrics where possible)
6. Key Takeaways (3-5 bullet points)

Tone: Professional, data-driven, results-focused.
```

### 5.3 Post-Processing Pipeline

```typescript
// src/lib/content-generator.ts

interface GenerationResult {
  success: boolean;
  fields?: Record<string, string | string[]>;
  fullText?: string;
  tokenUsage: { input: number; output: number };
  error?: string;
}

async function postProcess(
  raw: string,
  action: string,
  contentType: string
): Promise<GenerationResult> {
  // 1. Strip markdown code fences if present
  let cleaned = raw.replace(/^```(markdown|json)?\n/m, '').replace(/\n```$/m, '');

  // 2. For JSON responses (seo, social), parse and validate
  if (action === 'seo' || action === 'social') {
    try {
      const parsed = JSON.parse(cleaned);
      return { success: true, fields: parsed, tokenUsage: /* ... */ };
    } catch {
      // Fallback: extract JSON from response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { success: true, fields: parsed, tokenUsage: /* ... */ };
      }
    }
  }

  // 3. For translation, return as field value
  if (action === 'translate') {
    return { success: true, fullText: cleaned, tokenUsage: /* ... */ };
  }

  // 4. For draft/structure, return full text
  return { success: true, fullText: cleaned, tokenUsage: /* ... */ };
}
```

---

## 6. Frontend Components

### 6.1 Component Tree

```
src/components/content/
├── ContentGenerationPanel.tsx     # Main floating panel (sidebar)
├── ActionSelector.tsx             # Dropdown for choosing action
├── TranslationPanel.tsx           # EN↔ZH translation UI
├── SEOPanel.tsx                   # SEO analysis + generation
├── SocialMediaPanel.tsx           # Social copy generation
├── DraftGenerator.tsx             # Blog draft creation
├── BatchProcessor.tsx             # Batch operations modal
├── GenerationResult.tsx           # Shared result display component
├── GenerationLog.tsx              # History of generations
├── ReviewWorkflow.tsx             # Human review checklist
└── hooks/
    ├── useContentGeneration.ts    # Main API hook
    └── useBatchProcessing.ts      # Batch processing hook
```

### 6.2 ContentGenerationPanel

The primary UI — a collapsible right-side panel in the admin editor:

```typescript
// src/components/content/ContentGenerationPanel.tsx
'use client';

import { useState } from 'react';
import { TranslationPanel } from './TranslationPanel';
import { SEOPanel } from './SEOPanel';
import { SocialMediaPanel } from './SocialMediaPanel';
import { DraftGenerator } from './DraftGenerator';
import { BatchProcessor } from './BatchProcessor';
import { GenerationLog } from './GenerationLog';

type Action = 'translate' | 'seo' | 'social' | 'draft' | 'batch' | 'log';

interface ContentGenerationPanelProps {
  documentId: string;
  contentType: 'post' | 'caseStudy' | 'product' | 'solution';
  currentLang: 'en' | 'zh';
}

export function ContentGenerationPanel({
  documentId,
  contentType,
  currentLang,
}: ContentGenerationPanelProps) {
  const [action, setAction] = useState<Action>('translate');
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-1/2 -translate-y-1/2 bg-[#00D4FF] text-black
                   rounded-full p-3 shadow-lg hover:bg-[#00B8E0] transition-colors"
        title="AI Content Assistant"
      >
        {/* AI sparkle icon */}
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-[#12121A] border-l border-white/10
                    shadow-2xl overflow-y-auto z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">AI Content Assistant</h2>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      {/* Action tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {(['translate', 'seo', 'social', 'draft', 'batch', 'log'] as Action[]).map((a) => (
          <button
            key={a}
            onClick={() => setAction(a)}
            className={`px-3 py-2 text-sm whitespace-nowrap transition-colors ${
              action === a
                ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {a === 'log' ? 'History' : a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="p-4">
        {action === 'translate' && (
          <TranslationPanel documentId={documentId} contentType={contentType} currentLang={currentLang} />
        )}
        {action === 'seo' && (
          <SEOPanel documentId={documentId} contentType={contentType} />
        )}
        {action === 'social' && (
          <SocialMediaPanel documentId={documentId} contentType={contentType} />
        )}
        {action === 'draft' && (
          <DraftGenerator contentType={contentType} />
        )}
        {action === 'batch' && (
          <BatchProcessor contentType={contentType} />
        )}
        {action === 'log' && (
          <GenerationLog />
        )}
      </div>
    </div>
  );
}
```

### 6.3 useContentGeneration Hook

```typescript
// src/components/content/hooks/useContentGeneration.ts
'use client';

import { useState, useCallback } from 'react';

interface GenerationState {
  loading: boolean;
  error: string | null;
  result: GenerationResult | null;
}

interface GenerationResult {
  fields?: Record<string, string | string[]>;
  fullText?: string;
  tokenUsage: { input: number; output: number };
}

interface GenerateOptions {
  action: string;
  contentType: string;
  contentId?: string;
  sourceLang?: string;
  targetLang?: string;
  topic?: string;
  category?: string;
  notes?: string;
}

export function useContentGeneration() {
  const [state, setState] = useState<GenerationState>({
    loading: false,
    error: null,
    result: null,
  });

  const generate = useCallback(async (options: GenerateOptions) => {
    setState({ loading: true, error: null, result: null });

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        setState({ loading: false, error: data.error, result: null });
        return null;
      }

      setState({ loading: false, error: null, result: data.result });
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setState({ loading: false, error: message, result: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null });
  }, []);

  return { ...state, generate, reset };
}
```

### 6.4 TranslationPanel Component

```typescript
// src/components/content/TranslationPanel.tsx
'use client';

import { useState } from 'react';
import { useContentGeneration } from './hooks/useContentGeneration';
import { ReviewWorkflow } from './ReviewWorkflow';

interface TranslationPanelProps {
  documentId: string;
  contentType: string;
  currentLang: 'en' | 'zh';
}

export function TranslationPanel({ documentId, contentType, currentLang }: TranslationPanelProps) {
  const { loading, error, result, generate } = useContentGeneration();
  const [targetLang] = useState<'en' | 'zh'>(currentLang === 'en' ? 'zh' : 'en');
  const [approved, setApproved] = useState(false);

  const handleGenerate = async () => {
    await generate({
      action: 'translate',
      contentType,
      contentId: documentId,
      sourceLang: currentLang,
      targetLang,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {currentLang === 'en' ? 'English' : '繁體中文'} → {targetLang === 'en' ? 'English' : '繁體中文'}
        </span>
        <span className="text-gray-500">GPT-4o-mini</span>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-[#00D4FF] text-black font-medium py-2 px-4 rounded-lg
                   hover:bg-[#00B8E0] disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        {loading ? 'Translating...' : 'Generate Translation'}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Generated Translation</p>
            <div className="text-sm text-white whitespace-pre-wrap max-h-64 overflow-y-auto">
              {result.fullText || JSON.stringify(result.fields, null, 2)}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Tokens: {result.tokenUsage.input} in / {result.tokenUsage.output} out
          </div>

          <ReviewWorkflow
            onApprove={() => setApproved(true)}
            onReject={() => {}}
          />

          {approved && (
            <button
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg
                         hover:bg-green-700 transition-colors text-sm"
              onClick={() => {
                // Apply to Sanity document fields
              }}
            >
              Apply to Document
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 6.5 SEOPanel Component

```typescript
// src/components/content/SEOPanel.tsx
'use client';

import { useState } from 'react';
import { useContentGeneration } from './hooks/useContentGeneration';

interface SEOPanelProps {
  documentId: string;
  contentType: string;
}

export function SEOPanel({ documentId, contentType }: SEOPanelProps) {
  const { loading, error, result, generate } = useContentGeneration();
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [targetKeywords, setTargetKeywords] = useState('');

  const handleGenerate = async () => {
    await generate({
      action: 'seo',
      contentType,
      contentId: documentId,
    });
  };

  const handleAnalyze = async () => {
    const response = await fetch('/api/content/seo-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType,
        contentId: documentId,
        targetKeywords: targetKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      }),
    });
    const data = await response.json();
    if (data.score) setSeoScore(data.score);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Target Keywords (comma-separated)</label>
        <input
          type="text"
          value={targetKeywords}
          onChange={(e) => setTargetKeywords(e.target.value)}
          placeholder="cybersecurity, NGFW, Asia"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                     text-sm text-white placeholder-gray-500 focus:border-[#00D4FF]
                     focus:outline-none transition-colors"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20
                     disabled:opacity-50 transition-colors text-sm"
        >
          Analyze SEO
        </button>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 bg-[#00D4FF] text-black py-2 px-4 rounded-lg hover:bg-[#00B8E0]
                     disabled:opacity-50 transition-colors text-sm font-medium"
        >
          Generate SEO
        </button>
      </div>

      {seoScore !== null && (
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`text-3xl font-bold ${
              seoScore >= 80 ? 'text-green-400' :
              seoScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {seoScore}
            </div>
            <span className="text-sm text-gray-400">/ 100 SEO Score</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                seoScore >= 80 ? 'bg-green-400' :
                seoScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${seoScore}%` }}
            />
          </div>
        </div>
      )}

      {result?.fields && (
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <div>
              <p className="text-xs text-gray-400">Meta Title</p>
              <p className="text-sm text-white">{result.fields.metaTitle}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Meta Description</p>
              <p className="text-sm text-white">{result.fields.metaDescription}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Keywords</p>
              <div className="flex flex-wrap gap-1">
                {(result.fields.keywords as string[])?.map((kw, i) => (
                  <span key={i} className="bg-[#00D4FF]/20 text-[#00D4FF] text-xs px-2 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg
                       hover:bg-green-700 transition-colors text-sm"
            onClick={() => {
              // Apply SEO fields to Sanity document
            }}
          >
            Apply SEO Fields
          </button>
        </div>
      )}
    </div>
  );
}
```

### 6.6 BatchProcessor Component

```typescript
// src/components/content/BatchProcessor.tsx
'use client';

import { useState } from 'react';

interface BatchProcessorProps {
  contentType: string;
}

interface BatchResult {
  documentId: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

export function BatchProcessor({ contentType }: BatchProcessorProps) {
  const [action, setAction] = useState<'translate' | 'seo' | 'social'>('translate');
  const [targetLang, setTargetLang] = useState<'en' | 'zh'>('zh');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [progress, setProgress] = useState({ total: 0, done: 0 });

  const handleBatch = async () => {
    setProcessing(true);
    setResults([]);
    setProgress({ total: 0, done: 0 });

    try {
      // 1. Fetch all documents of this type from Sanity
      const docsResponse = await fetch(`/api/content/documents?contentType=${contentType}`);
      const { documents } = await docsResponse.json();
      setProgress({ total: documents.length, done: 0 });

      // 2. Process in batches of 5
      const batchSize = 5;
      const allResults: BatchResult[] = [];

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        const response = await fetch('/api/content/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            contentType,
            documentIds: batch.map((d: { _id: string }) => d._id),
            targetLang: action === 'translate' ? targetLang : undefined,
          }),
        });

        const data = await response.json();
        allResults.push(...data.results);
        setResults([...allResults]);
        setProgress({ total: documents.length, done: Math.min(i + batchSize, documents.length) });
      }
    } catch (err) {
      console.error('Batch processing failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Batch Action</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as typeof action)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                     text-sm text-white focus:border-[#00D4FF] focus:outline-none"
        >
          <option value="translate">Translate All</option>
          <option value="seo">Generate SEO for All</option>
          <option value="social">Generate Social Copy for All</option>
        </select>
      </div>

      {action === 'translate' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Target Language</label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as 'en' | 'zh')}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                       text-sm text-white focus:border-[#00D4FF] focus:outline-none"
          >
            <option value="zh">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>
      )}

      <button
        onClick={handleBatch}
        disabled={processing}
        className="w-full bg-[#7B61FF] text-white font-medium py-2 px-4 rounded-lg
                   hover:bg-[#6A50E6] disabled:opacity-50 transition-colors"
      >
        {processing
          ? `Processing ${progress.done}/${progress.total}...`
          : `Batch ${action.charAt(0).toUpperCase() + action.slice(1)}`}
      </button>

      {/* Progress bar */}
      {progress.total > 0 && (
        <div>
          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <div
              className="bg-[#7B61FF] h-2 rounded-full transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">
            {progress.done} / {progress.total} documents
          </p>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {results.map((r) => (
            <div
              key={r.documentId}
              className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                r.status === 'success' ? 'text-green-400 bg-green-500/10' :
                r.status === 'error' ? 'text-red-400 bg-red-500/10' :
                'text-gray-400 bg-white/5'
              }`}
            >
              <span>{r.status === 'success' ? '✓' : r.status === 'error' ? '✗' : '...'}</span>
              <span className="truncate">{r.documentId}</span>
              {r.error && <span className="text-red-400 ml-auto">{r.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 7. CMS Integration

### 7.1 Writing to Sanity

Generated content is written to Sanity via the authenticated client:

```typescript
// src/lib/sanity-write.ts
import { createClient } from 'next-sanity';

export function getWriteClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN!, // write token
  });
}

export async function applyGeneratedFields(
  documentId: string,
  fields: Record<string, unknown>
) {
  const client = getWriteClient();
  return client.patch(documentId).set(fields).commit();
}
```

### 7.2 Draft Workflow

```
Generated content ──→ Review panel ──→ Approve ──→ Apply to Sanity document
                                      ──→ Reject ──→ Discard (logged only)
```

No content is auto-published. The workflow:

1. Admin triggers generation via panel
2. AI output displayed in panel for review
3. Admin edits/approves output
4. Admin clicks "Apply to Document" → writes to Sanity fields
5. Admin manually publishes in Sanity Studio

### 7.3 ISR Revalidation

After batch writes, trigger revalidation:

```typescript
// After batch processing completes
await fetch(`${SITE_URL}/api/revalidate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret: process.env.REVALIDATE_SECRET, path: '/' }),
});
```

---

## 8. Quality Control

### 8.1 Human Review Workflow

Every AI-generated output goes through a mandatory review:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Generate     │────▶│  Review Panel │────▶│  Apply /     │
│  (AI)         │     │  (Human)      │     │  Reject       │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                     ┌──────▼──────┐
                     │  Editable   │
                     │  (inline)   │
                     └─────────────┘
```

### 8.2 Review Checklist Component

```typescript
// src/components/content/ReviewWorkflow.tsx
'use client';

import { useState } from 'react';

interface ReviewWorkflowProps {
  onApprove: () => void;
  onReject: () => void;
}

const CHECKLIST = [
  'Technical accuracy verified',
  'Brand voice consistency',
  'No hallucinated claims or data',
  'Appropriate for target audience',
  'Bilingual consistency (if translated)',
];

export function ReviewWorkflow({ onApprove, onReject }: ReviewWorkflowProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const allChecked = CHECKLIST.every((_, i) => checked[i]);

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <p className="text-xs text-gray-400 font-medium">Review Checklist</p>
      {CHECKLIST.map((item, i) => (
        <label key={i} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={!!checked[i]}
            onChange={(e) => setChecked({ ...checked, [i]: e.target.checked })}
            className="rounded border-white/20 bg-white/5 text-[#00D4FF]"
          />
          {item}
        </label>
      ))}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onApprove}
          disabled={!allChecked}
          className="flex-1 bg-green-600 text-white py-1.5 px-3 rounded text-sm
                     hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-white/10 text-gray-300 py-1.5 px-3 rounded text-sm
                     hover:bg-white/20 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
```

### 8.3 Content Validation Rules

```typescript
// src/lib/content-validation.ts

interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export function validateTranslation(
  original: string,
  translated: string
): ValidationResult {
  const issues: string[] = [];

  // 1. Length check (translation shouldn't be 2x longer or 0.3x shorter)
  const lengthRatio = translated.length / original.length;
  if (lengthRatio > 2.0) issues.push('Translation significantly longer than source');
  if (lengthRatio < 0.3) issues.push('Translation significantly shorter than source');

  // 2. Technical term preservation
  const techTerms = ['NGFW', 'XDR', 'SASE', 'ZTNA', 'HCI', 'VMware', 'Supabase', 'Sanity'];
  for (const term of techTerms) {
    if (original.includes(term) && !translated.includes(term)) {
      issues.push(`Technical term "${term}" missing from translation`);
    }
  }

  // 3. Sanity block structure preservation
  if (original.includes('"type":"block"') && !translated.includes('"type":"block"')) {
    issues.push('Sanity block structure may be broken');
  }

  return { valid: issues.length === 0, issues };
}

export function validateSEO(
  metaTitle: string,
  metaDescription: string,
  keywords: string[]
): ValidationResult {
  const issues: string[] = [];

  if (metaTitle.length > 60) issues.push(`Meta title too long (${metaTitle.length}/60)`);
  if (metaTitle.length < 30) issues.push(`Meta title too short (${metaTitle.length}/30)`);
  if (metaDescription.length > 160) issues.push(`Meta description too long (${metaDescription.length}/160)`);
  if (metaDescription.length < 70) issues.push(`Meta description too short (${metaDescription.length}/70)`);
  if (keywords.length > 10) issues.push(`Too many keywords (${keywords.length}/10)`);
  if (keywords.length < 3) issues.push(`Too few keywords (${keywords.length}/3)`);

  return { valid: issues.length === 0, issues };
}
```

---

## 9. Batch Processing

### 9.1 Architecture

Batch processing runs server-side with controlled concurrency:

```typescript
// src/lib/batch-processor.ts

interface BatchJob {
  id: string;
  action: string;
  contentType: string;
  documentIds: string[];
  targetLang?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: { total: number; done: number; failed: number };
  results: Array<{ documentId: string; status: string; error?: string }>;
}

const activeJobs = new Map<string, BatchJob>();

export async function startBatchJob(params: {
  action: string;
  contentType: string;
  documentIds: string[];
  targetLang?: string;
  userId: string;
}): Promise<string> {
  const jobId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const job: BatchJob = {
    id: jobId,
    ...params,
    status: 'running',
    progress: { total: params.documentIds.length, done: 0, failed: 0 },
    results: [],
  };

  activeJobs.set(jobId, job);

  // Run in background (non-blocking)
  processBatchJob(job).catch((err) => {
    job.status = 'failed';
    console.error(`Batch job ${jobId} failed:`, err);
  });

  return jobId;
}

async function processBatchJob(job: BatchJob) {
  const CONCURRENCY = 3; // Max 3 parallel AI calls per batch

  for (let i = 0; i < job.documentIds.length; i += CONCURRENCY) {
    const chunk = job.documentIds.slice(i, i + CONCURRENCY);

    const promises = chunk.map(async (docId) => {
      try {
        await generateForDocument(job.action, job.contentType, docId, job.targetLang);
        job.results.push({ documentId: docId, status: 'success' });
        job.progress.done++;
      } catch (err) {
        job.results.push({
          documentId: docId,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        job.progress.failed++;
      }
    });

    await Promise.all(promises);

    // Rate limiting pause between chunks
    if (i + CONCURRENCY < job.documentIds.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  job.status = 'completed';
}

export function getBatchJobStatus(jobId: string): BatchJob | undefined {
  return activeJobs.get(jobId);
}
```

### 9.2 Batch API Endpoint

```typescript
// src/app/api/content/batch/route.ts
import { NextResponse } from 'next/server';
import { startBatchJob, getBatchJobStatus } from '@/lib/batch-processor';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { user } = await requireAdmin(request);
    const body = await request.json();
    const { action, contentType, documentIds, targetLang } = body;

    if (!action || !contentType || !documentIds?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (documentIds.length > 10) {
      return NextResponse.json({ error: 'Max 10 documents per batch' }, { status: 400 });
    }

    const jobId = await startBatchJob({
      action,
      contentType,
      documentIds,
      targetLang,
      userId: user.id,
    });

    return NextResponse.json({ success: true, jobId });
  } catch (err) {
    if (err instanceof Response) {
      return err;
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/content/batch?jobId=xxx
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const job = getBatchJobStatus(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: job.status,
      progress: job.progress,
      results: job.results,
    });
  } catch (err) {
    if (err instanceof Response) {
      return err;
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 10. Environment Variables

Add to `.env.local.example`:

```bash
# OpenAI (Content Generation Assistant)
OPENAI_API_KEY=sk-...
```

### 10.1 Token Cost Estimation (GPT-4o-mini)

| Operation | Avg Input Tokens | Avg Output Tokens | Cost per Call (USD) |
|---|---|---|---|
| Translation | 1,200 | 1,000 | ~$0.0004 |
| Summary | 800 | 100 | ~$0.0001 |
| SEO Generation | 1,000 | 200 | ~$0.0002 |
| Social Media | 600 | 400 | ~$0.0003 |
| Blog Draft | 300 | 1,500 | ~$0.0003 |
| Batch (10 docs) | ~10,000 | ~8,000 | ~$0.004 |

Monthly estimate (50 articles/month, all operations): **~$0.50**

---

## 11. Security Considerations

| Concern | Mitigation |
|---|---|
| **Admin-only access** | Supabase Auth + role check on every endpoint |
| **API key protection** | `OPENAI_API_KEY` only on server-side (never exposed to client) |
| **Input sanitization** | All user inputs validated; no raw content injection into prompts |
| **Rate limiting** | 50 requests/minute per user, batch limited to 10 documents |
| **Audit trail** | Every generation logged to `aiGenerationLog` in Sanity |
| **No auto-publish** | Generated content always enters draft state |
| **Token budget** | Max 4,096 output tokens per call prevents runaway costs |

---

## 12. File Structure Summary

```
src/
├── app/api/content/
│   ├── generate/route.ts          # POST - single generation
│   ├── batch/route.ts             # POST/GET - batch processing
│   ├── preview/route.ts           # GET - preview without persisting
│   ├── seo-analyze/route.ts       # POST - SEO scoring
│   └── documents/route.ts         # GET - list documents for batch
├── components/content/
│   ├── ContentGenerationPanel.tsx  # Main panel
│   ├── TranslationPanel.tsx
│   ├── SEOPanel.tsx
│   ├── SocialMediaPanel.tsx
│   ├── DraftGenerator.tsx
│   ├── BatchProcessor.tsx
│   ├── GenerationResult.tsx
│   ├── GenerationLog.tsx
│   ├── ReviewWorkflow.tsx
│   └── hooks/
│       ├── useContentGeneration.ts
│       └── useBatchProcessing.ts
├── lib/
│   ├── openai.ts                  # OpenAI client singleton
│   ├── content-generator.ts       # Core generation logic + prompts
│   ├── content-validation.ts      # Output validation
│   ├── content-sanity-write.ts    # Sanity write operations
│   └── batch-processor.ts         # Batch job management
└── types/
    └── content-generation.ts      # TypeScript interfaces

sanity/schemas/
├── post.ts                         # Extended with SEO/social fields
├── caseStudy.ts                    # Extended with SEO/social fields
├── product.ts                      # Extended with SEO fields
├── solution.ts                     # Extended with SEO/social fields
└── aiGenerationLog.ts              # New audit schema
```

---

## 13. Implementation Phases

| Phase | Scope | Estimated Effort |
|---|---|---|
| **Phase 1** | OpenAI client + Translation API endpoint + TranslationPanel | 2 days |
| **Phase 2** | Summary + SEO generation + SEOPanel | 2 days |
| **Phase 3** | Social media + Draft generation | 1 day |
| **Phase 4** | Sanity schema extensions + write integration | 1 day |
| **Phase 5** | Batch processing infrastructure | 2 days |
| **Phase 6** | Review workflow + validation + audit logging | 1 day |
| **Phase 7** | SEO analyze endpoint + score display | 1 day |
| **Total** | | **~10 days** |
