# Smart Search Feature — Technical Design Document

**Version:** 1.0  
**Date:** 2026-07-05  
**PRD Section:** New Feature (extends [S4] Website Architecture)  
**Status:** Design Phase

---

## 1. Feature Overview

### 1.1 Purpose

Smart Search provides two complementary capabilities on the TGWS website:

1. **Semantic Search** — Find content across blog posts, case studies, products, and solutions using natural language queries instead of keyword matching alone.
2. **AI Q&A** — Answer user questions directly by synthesizing answers from indexed TGWS content, with source attribution.

### 1.2 User Experience

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Search** | Click search icon or press `Ctrl+K` / `⌘+K` | Opens search modal. Type to get instant semantic results. |
| **AI Q&A** | Toggle "AI Answer" switch in search modal OR prefix query with `?` | Sends query to GPT-4o-mini with retrieved context chunks; returns synthesized answer with cited sources. |

### 1.3 Design Principles

- **Bilingual-first** — All indexed content supports EN/ZH; search respects current locale.
- **Zero-config for content editors** — New Sanity content is auto-indexed via webhooks.
- **Graceful degradation** — If OpenAI API is down, search still works; Q&A degrades to search results.
- **Cost-aware** — Embedding re-indexing is event-driven; Q&A responses are cached.

---

## 2. Content to Index

### 2.1 Content Sources

| Source | Sanity Type | Index Priority | Update Frequency |
|--------|-------------|----------------|------------------|
| Blog posts | `post` | P0 | On publish/edit |
| Case studies | `caseStudy` | P0 | On publish/edit |
| Products & Services | `product` | P0 | On publish/edit |
| Industry Solutions | `solution` | P0 | On publish/edit |
| Company Info (About) | `companyInfo` | P1 | Weekly |
| FAQ / Knowledge Base | `faq` | P1 | On publish/edit |
| VMware Alternative | `vmwarePage` | P1 | On publish/edit |

### 2.2 Index Document Schema

Each piece of content produces one or more **index documents**:

```typescript
// src/types/search.ts

interface SearchDocument {
  id: string;                    // Unique document ID: "{source_type}_{sanity_id}_{locale}"
  source_type: 'blog' | 'case_study' | 'product' | 'solution' | 'company' | 'faq' | 'vmware';
  source_id: string;             // Sanity document _id
  locale: 'en' | 'zh';
  title: string;
  slug: string;                  // URL path segment
  summary: string;               // First 300 chars or meta description
  body: string;                  // Full text content (plain text, stripped of markdown/HTML)
  category: string;              // e.g., "Build", "Run", "Protect", industry name
  tags: string[];                // Extracted tags
  url: string;                   // Full page URL
  published_at: string;          // ISO timestamp
  updated_at: string;            // ISO timestamp
  embedding: number[];           // 1536-dim vector (text-embedding-3-small)
}
```

### 2.3 Chunking Strategy

Long-form content (blog posts, case studies, solutions) is split into overlapping chunks for better retrieval:

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Chunk size | 512 tokens | Fits comfortably in GPT-4o-mini context budget |
| Overlap | 50 tokens | Prevents information loss at chunk boundaries |
| Separators | Paragraph break → Sentence break → Token limit | Hierarchical splitting |
| Min chunk size | 100 tokens | Discard fragments too small to be meaningful |

Short content (products, FAQ) is indexed as a single chunk.

---

## 3. Embedding Strategy

### 3.1 Model Choice

| Option | Model | Dimensions | Cost (per 1M tokens) | Rationale |
|--------|-------|------------|----------------------|-----------|
| **Selected** | `text-embedding-3-small` (OpenAI) | 1536 | $0.02 | Best cost/quality ratio; 1536 dims sufficient for this corpus size |
| Alternative | `text-embedding-3-large` (OpenAI) | 3072 | $0.13 | Higher quality but 6.5x cost; overkill for <10K docs |
| Alternative | Voyage AI `voyage-3-lite` | 1024 | $0.02 | Competitive quality, smaller dims |

### 3.2 Embedding Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                  INDEXING PIPELINE                       │
│                                                          │
│  Sanity Webhook                                         │
│       │                                                  │
│       ▼                                                  │
│  Sanity Fetch (full document)                           │
│       │                                                  │
│       ▼                                                  │
│  Text Extraction (Portable Text → Plain Text)           │
│       │                                                  │
│       ▼                                                  │
│  Chunking (512 tokens, 50 overlap)                      │
│       │                                                  │
│       ▼                                                  │
│  Embedding (OpenAI text-embedding-3-small)              │
│       │                                                  │
│       ▼                                                  │
│  Store in Supabase (pgvector)                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Embedding Text Format

For optimal retrieval quality, the text passed to the embedding model is structured:

```
Title: {title}
Category: {category}
Tags: {tag1}, {tag2}
Body: {chunk_content}
```

This prefixing helps the model understand context within each chunk.

### 3.4 Batch Embedding

OpenAI API supports up to 2048 text inputs per call. The pipeline batches chunks:

```typescript
const BATCH_SIZE = 2000; // Stay under 2048 limit with safety margin

async function embedChunks(chunks: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });
    results.push(...response.data.map(d => d.embedding));
  }
  return results;
}
```

---

## 4. Vector Storage (Supabase + pgvector)

### 4.1 Database Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Search documents table
CREATE TABLE search_documents (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  body TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  chunk_index INTEGER DEFAULT 0,
  chunk_total INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector column (added separately for clarity)
ALTER TABLE search_documents ADD COLUMN embedding vector(1536);

-- Index for vector similarity search (IVFFlat for <100K rows)
CREATE INDEX ON search_documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for filtered searches
CREATE INDEX idx_search_locale ON search_documents (locale);
CREATE INDEX idx_search_source_type ON search_documents (source_type);
CREATE INDEX idx_search_category ON search_documents (category);
CREATE INDEX idx_search_published ON search_documents (published_at DESC);

-- Full-text search index as fallback
ALTER TABLE search_documents ADD COLUMN fts tsvector;
UPDATE search_documents SET fts = to_tsvector('english', title || ' ' || body);
CREATE INDEX idx_search_fts ON search_documents USING GIN (fts);

-- For Chinese, use zhparser or simple dictionary
-- Alternative: use JSONB-based trigram search for CJK
```

### 4.2 Search Function (Hybrid)

```sql
-- Hybrid search: combines vector similarity + full-text search + metadata filters
CREATE OR REPLACE FUNCTION search_content(
  query_embedding vector(1536),
  query_text TEXT,
  locale_filter TEXT,
  source_types TEXT[],
  match_count INT DEFAULT 10,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id TEXT,
  source_type TEXT,
  title TEXT,
  slug TEXT,
  summary TEXT,
  url TEXT,
  category TEXT,
  tags TEXT[],
  similarity FLOAT,
  published_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sd.id,
    sd.source_type,
    sd.title,
    sd.slug,
    sd.summary,
    sd.url,
    sd.category,
    sd.tags,
    1 - (sd.embedding <=> query_embedding) AS similarity,
    sd.published_at
  FROM search_documents sd
  WHERE
    sd.locale = locale_filter
    AND (source_types IS NULL OR sd.source_type = ANY(source_types))
    AND 1 - (sd.embedding <=> query_embedding) > similarity_threshold
  ORDER BY sd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 4.3 RLS Policies

```sql
-- Search is public read (no auth needed)
ALTER TABLE search_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can search" ON search_documents
  FOR SELECT USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role manages" ON search_documents
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 5. Query Processing

### 5.1 Query Pipeline

```
User Query
    │
    ▼
┌──────────────────┐
│  1. Preprocess   │  Trim, detect language, detect AI mode
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  2. Embed Query  │  text-embedding-3-small (cached for repeat queries)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  3. Vector Search │  pgvector cosine similarity
│  + FTS Boost     │  + full-text search score boost
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  4a. If AI mode OFF → Return results │
│  4b. If AI mode ON  → Go to Step 5   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  5. RAG Pipeline │  Build prompt with top-N chunks → GPT-4o-mini
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  6. Format       │  Answer + source citations
└──────────────────┘
```

### 5.2 Query Preprocessing

```typescript
interface ProcessedQuery {
  raw: string;
  normalized: string;        // Trimmed, lowercased for English
  language: 'en' | 'zh';    // Detected locale
  aiMode: boolean;           // Whether to use AI Q&A
  intent: SearchIntent;      // Classify query type
}

type SearchIntent = 'factual' | 'navigational' | 'exploratory' | 'comparison';

function processQuery(raw: string): ProcessedQuery {
  const trimmed = raw.trim();
  const aiMode = trimmed.startsWith('?') || aiToggleEnabled;
  const query = trimmed.replace(/^\?/, '').trim();

  return {
    raw: trimmed,
    normalized: query.toLowerCase(),
    language: detectLanguage(query),
    aiMode,
    intent: classifyIntent(query),
  };
}

function detectLanguage(text: string): 'en' | 'zh' {
  const zhCharCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return zhCharCount > text.length * 0.3 ? 'zh' : 'en';
}
```

### 5.3 Embedding Cache

For repeated queries, cache embeddings in-memory (LRU) and optionally in Redis/Vercel KV:

```typescript
// In-memory LRU cache (per serverless instance)
const embeddingCache = new Map<string, { embedding: number[]; ts: number }>();
const CACHE_TTL = 3600_000; // 1 hour
const MAX_CACHE_SIZE = 1000;

async function getQueryEmbedding(query: string): Promise<number[]> {
  const cached = embeddingCache.get(query);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.embedding;
  }

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const embedding = response.data[0].embedding;

  if (embeddingCache.size >= MAX_CACHE_SIZE) {
    const oldest = [...embeddingCache.entries()]
      .sort((a, b) => a[1].ts - b[1].ts)[0];
    embeddingCache.delete(oldest[0]);
  }
  embeddingCache.set(query, { embedding, ts: Date.now() });

  return embedding;
}
```

---

## 6. Answer Generation (RAG Pipeline)

### 6.1 Prompt Template

```typescript
const RAG_SYSTEM_PROMPT = `You are TechGuru's AI assistant. Answer the user's question using ONLY the provided context documents. Follow these rules:

1. Answer in the same language as the question.
2. Be concise and professional — max 3 paragraphs.
3. If the context doesn't contain enough information, say so clearly.
4. Cite sources using [1], [2], etc. corresponding to the source documents.
5. Never fabricate information not present in the context.
6. If the question is about pricing or specific configurations, direct the user to contact TechGuru.

Context documents:
{context}`;
```

### 6.2 Context Building

```typescript
interface RAGContext {
  chunks: SearchDocument[];
  totalTokens: number;
}

function buildRAGContext(
  searchResults: SearchResult[],
  maxTokens: number = 6000
): RAGContext {
  const chunks: SearchDocument[] = [];
  let totalTokens = 0;

  for (const result of searchResults) {
    const chunkTokens = estimateTokens(result.body);
    if (totalTokens + chunkTokens > maxTokens) break;

    chunks.push(result);
    totalTokens += chunkTokens;
  }

  return { chunks, totalTokens };
}

function formatContextForPrompt(context: RAGContext): string {
  return context.chunks
    .map((chunk, i) => `[${i + 1}] (${chunk.source_type}: ${chunk.title})\n${chunk.body}`)
    .join('\n\n---\n\n');
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 chars
}
```

### 6.3 GPT-4o-mini Call

```typescript
interface AIAnswer {
  answer: string;
  sources: SourceAttribution[];
  model: string;
  tokensUsed: number;
}

async function generateAnswer(
  query: string,
  context: RAGContext,
  locale: 'en' | 'zh'
): Promise<AIAnswer> {
  const formattedContext = formatContextForPrompt(context);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: RAG_SYSTEM_PROMPT.replace('{context}', formattedContext) },
      { role: 'user', content: query },
    ],
    max_tokens: 1000,
    temperature: 0.3, // Low temperature for factual accuracy
    user: `tgws-search`, // For usage tracking
  });

  const answer = response.choices[0].message.content || '';

  return {
    answer,
    sources: context.chunks.map((chunk, i) => ({
      index: i + 1,
      title: chunk.title,
      type: chunk.source_type,
      url: chunk.url,
      snippet: chunk.body.substring(0, 200),
    })),
    model: 'gpt-4o-mini',
    tokensUsed: response.usage?.total_tokens || 0,
  };
}
```

### 6.4 Answer Caching

Cache AI answers to avoid redundant API calls for identical queries:

```typescript
// Cache key: hash(query + locale + top source IDs)
function getCacheKey(query: string, locale: string, sourceIds: string[]): string {
  const input = `${locale}:${query}:${sourceIds.sort().join(',')}`;
  return `ai_answer:${crypto.createHash('sha256').update(input).digest('hex')}`;
}

// TTL: 1 hour for exact matches, 24h for high-confidence answers
```

---

## 7. Source Attribution

### 7.1 Citation Format

Sources are displayed as numbered references below the AI answer:

```
AI Answer:
Our next-generation firewalls provide comprehensive threat protection [1].
For healthcare organizations, we offer HIPAA-compliant solutions [2].

Sources:
[1] NGFW Product Page — /en/products/protect/ngfw
[2] Healthcare Solution — /en/solutions/healthcare
```

### 7.2 Source Metadata

```typescript
interface SourceAttribution {
  index: number;          // Citation number [N]
  title: string;          // Document title
  type: string;           // blog | case_study | product | solution
  url: string;            // Full URL path
  snippet: string;        // Relevant excerpt (200 chars)
  publishedAt?: string;   // For freshness indication
}

interface SearchHit {
  id: string;
  title: string;
  slug: string;
  summary: string;
  url: string;
  source_type: string;
  category: string;
  tags: string[];
  similarity: number;     // 0-1 confidence score
  published_at: string;
  highlight?: string;     // Snippet with match highlighting
}
```

### 7.3 Relevance Indicators

Each result includes a visual confidence indicator:

| Similarity Score | Label | Visual |
|-----------------|-------|--------|
| 0.85 - 1.0 | Highly Relevant | Green dot |
| 0.70 - 0.84 | Relevant | Blue dot |
| 0.50 - 0.69 | Somewhat Relevant | Gray dot |
| < 0.50 | Not shown (filtered out) | — |

---

## 8. UI Design

### 8.1 Search Modal

The search interface is a **command palette** (⌘K / Ctrl+K) overlaid on any page:

```
┌────────────────────────────────────────────────────────────┐
│  🔍 Search TechGuru...                              [AI ↻] │
│────────────────────────────────────────────────────────────│
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ What cybersecurity solutions do you offer?            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  AI Answer                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ TechGuru offers comprehensive cybersecurity solutions │  │
│  │ including NGFW, IPS, WAF, EDR/XDR/NDR, and SASE/ZTNA │  │
│  │ [1][2]. Our managed security services (MDR) provide   │  │
│  │ 24/7 threat monitoring and incident response.         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Sources                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [1] 🔵 Protect Solutions — /products/protect         │  │
│  │ [2] 🔵 Managed Security — /products/protect/mdr      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Results (5)                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🟢 Next-Generation Firewall (NGFW)                   │  │
│  │    Protect > Network Security                        │  │
│  │    Advanced threat detection and prevention...        │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 🔵 MDR Service                                       │  │
│  │    Protect > Managed Security                        │  │
│  │    24/7 monitoring and incident response...           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 🔵 Case: Financial Institution Cybersecurity Upgrade  │  │
│  │    Case Study > Finance                              │  │
│  │    Complete security overhaul for a major bank...     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ⌘K to close · ↑↓ to navigate · ↵ to select               │
└────────────────────────────────────────────────────────────┘
```

### 8.2 Component Architecture

```
SearchModal
├── SearchInput
│   ├── SearchIcon
│   ├── InputField (debounced 300ms)
│   └── AIToggle (switch component)
├── AIAnswerPanel (conditional)
│   ├── AnswerText (markdown rendered)
│   ├── SourceCitations (numbered links)
│   └── LoadingSkeleton
├── SearchResults
│   ├── ResultItem[] (click to navigate)
│   │   ├── ResultTitle
│   │   ├── ResultMeta (type badge, category)
│   │   ├── ResultSnippet (highlighted match)
│   │   └── RelevanceIndicator (dot)
│   └── EmptyState
└── SearchFooter
    ├── KeyboardHints
    └── PoweredBy (subtle branding)
```

### 8.3 States

| State | UI Behavior |
|-------|-------------|
| **Idle** | Show recent/popular searches, trending content |
| **Typing** | Debounce 300ms, then show instant results |
| **Loading** | Skeleton placeholders for results |
| **Results** | Show semantic results; if AI toggle on, show AI answer panel above results |
| **AI Loading** | Streaming text animation for answer |
| **AI Complete** | Full answer with citations; results below |
| **No Results** | "No results found" + suggestions to rephrase |
| **Error** | "Something went wrong" + retry button; fallback to search results |

### 8.4 Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Full modal (max-w-2xl), centered overlay |
| Tablet (768-1023px) | Full-screen modal |
| Mobile (<768px) | Full-screen modal with bottom-sheet feel |

### 8.5 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+K` / `⌘+K` | Open search modal |
| `Escape` | Close modal |
| `↑` / `↓` | Navigate results |
| `Enter` | Select result / navigate |
| `Tab` | Toggle AI mode |
| `?` prefix | One-shot AI mode (without toggle) |

### 8.6 i18n

The search UI text supports both locales:

```json
{
  "en": {
    "search.placeholder": "Search TechGuru...",
    "search.aiToggle": "AI Answer",
    "search.aiLoading": "Generating answer...",
    "search.noResults": "No results found",
    "search.results": "Results",
    "search.sources": "Sources",
    "search.keyboardHint": "⌘K to close · ↑↓ to navigate · ↵ to select"
  },
  "zh": {
    "search.placeholder": "搜尋 TechGuru...",
    "search.aiToggle": "AI 回答",
    "search.aiLoading": "正在生成回答...",
    "search.noResults": "未找到結果",
    "search.results": "搜尋結果",
    "search.sources": "引用來源",
    "search.keyboardHint": "⌘K 關閉 · ↑↓ 導航 · ↵ 選擇"
  }
}
```

---

## 9. Performance & Caching

### 9.1 Caching Layers

```
┌─────────────────────────────────────────────────────────┐
│                    CACHING STRATEGY                       │
│                                                          │
│  Layer 1: Client-side (SWR / React Query)               │
│  ┌──────────────────────────────────────────────┐       │
│  │ Cache search results for same query+locale   │       │
│  │ TTL: 5 minutes (stale-while-revalidate)      │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  Layer 2: Edge Cache (Vercel CDN)                        │
│  ┌──────────────────────────────────────────────┐       │
│  │ Cache popular queries at edge                │       │
│  │ TTL: 15 minutes                              │       │
│  │ Header: Cache-Control: s-maxage=900          │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  Layer 3: Server-side (In-memory LRU)                    │
│  ┌──────────────────────────────────────────────┐       │
│  │ Embedding cache: 1000 entries, 1h TTL        │       │
│  │ AI answer cache: 500 entries, 1h TTL         │       │
│  │ Search result cache: 200 entries, 5min TTL   │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  Layer 4: Database (pgvector index)                      │
│  ┌──────────────────────────────────────────────┐       │
│  │ IVFFlat index for fast approximate NN search │       │
│  │ GIN index for full-text fallback             │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Latency Targets

| Operation | Target | Technique |
|-----------|--------|-----------|
| Search results | < 300ms | pgvector index + edge cache |
| AI answer (first token) | < 1.5s | Streaming response + cached embeddings |
| AI answer (complete) | < 4s | GPT-4o-mini + cached context |
| Embedding (query) | < 200ms | In-memory LRU cache; API fallback |

### 9.3 Streaming AI Responses

Use Vercel AI SDK for streaming:

```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(request: Request) {
  const { query, locale, aiMode } = await request.json();

  if (aiMode) {
    const searchResults = await searchContent(query, locale);
    const context = buildRAGContext(searchResults);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: buildMessages(query, context),
      stream: true,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  }

  // Non-AI: return JSON results
  const results = await searchContent(query, locale);
  return NextResponse.json({ results });
}
```

### 9.4 Rate Limiting

```typescript
// Per-IP rate limits
const RATE_LIMITS = {
  search: { max: 60, windowMs: 60_000 },        // 60 searches/min
  ai_answer: { max: 20, windowMs: 60_000 },     // 20 AI queries/min
  embedding: { max: 100, windowMs: 60_000 },     // 100 embedding calls/min
};
```

---

## 10. API Design

### 10.1 Search Endpoint

```
GET /api/search?q={query}&locale={locale}&type={type}&page={page}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | — | Search query |
| `locale` | string | No | `en` | Language filter: `en` or `zh` |
| `type` | string | No | all | Comma-separated: `blog,case_study,product,solution` |
| `page` | int | No | 1 | Pagination |
| `limit` | int | No | 10 | Results per page (max 20) |

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "blog_xyz_en_0",
        "title": "Next-Generation Firewall Solutions",
        "slug": "next-gen-firewall",
        "summary": "Advanced threat detection and prevention...",
        "url": "/en/blog/next-gen-firewall",
        "source_type": "blog",
        "category": "Protect",
        "tags": ["NGFW", "security", "firewall"],
        "similarity": 0.92,
        "published_at": "2026-06-15T00:00:00Z",
        "highlight": "...advanced <mark>firewall</mark> solutions..."
      }
    ],
    "total": 25,
    "page": 1,
    "hasMore": true
  }
}
```

### 10.2 AI Q&A Endpoint

```
POST /api/search/ai
```

**Request Body:**

```json
{
  "query": "What cybersecurity solutions do you offer?",
  "locale": "en",
  "conversationId": "optional-for-followup"
}
```

**Response (Streaming via SSE):**

```
data: {"type":"start","sources":[...]}
data: {"type":"delta","content":"TechGuru offers "}
data: {"type":"delta","content":"comprehensive "}
data: {"type":"delta","content":"cybersecurity solutions..."}
data: {"type":"done","answer":"Full answer text","model":"gpt-4o-mini","tokensUsed":450}
```

**Non-streaming Response:**

```json
{
  "success": true,
  "data": {
    "answer": "TechGuru offers comprehensive cybersecurity solutions...",
    "sources": [
      {
        "index": 1,
        "title": "Protect Solutions",
        "type": "product",
        "url": "/en/products/protect",
        "snippet": "Our protect portfolio includes..."
      }
    ],
    "model": "gpt-4o-mini",
    "tokensUsed": 450
  }
}
```

### 10.3 Reindex Endpoint (Admin)

```
POST /api/search/reindex
Authorization: Bearer {admin_token}
```

**Request Body:**

```json
{
  "source_type": "blog",     // Optional: reindex specific type
  "force": false              // Force re-embed even if unchanged
}
```

### 10.4 Sanity Webhook Endpoint

```
POST /api/search/webhook
Authorization: Bearer {sanity_webhook_secret}
```

Receives Sanity webhook events and triggers incremental re-indexing.

---

## 11. Indexing Script

### 11.1 Manual Reindex Script

```typescript
// scripts/reindex-search.ts
// Run: npx tsx scripts/reindex-search.ts

import { sanityClient } from '../src/lib/sanity.server';
import { supabaseAdmin } from '../src/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const QUERIES = {
  blog: `*[_type == "post"]{_id, title, slug, body, publishedAt, updatedAt, category->title, tags}`,
  case_study: `*[_type == "caseStudy"]{_id, title, slug, body, industry, products, publishedAt}`,
  product: `*[_type == "product"]{_id, title, slug, description, category, tags}`,
  solution: `*[_type == "solution"]{_id, title, slug, body, industry, publishedAt}`,
};

async function reindexAll() {
  for (const [sourceType, groqQuery] of Object.entries(QUERIES)) {
    console.log(`Indexing ${sourceType}...`);
    const documents = await sanityClient.fetch(groqQuery);

    for (const doc of documents) {
      for (const locale of ['en', 'zh']) {
        await indexDocument(sourceType, doc, locale);
      }
    }

    console.log(`✅ ${sourceType}: ${documents.length} documents indexed`);
  }
}

async function indexDocument(sourceType: string, doc: any, locale: string) {
  const body = extractText(doc.body);
  const chunks = chunkText(body, 512, 50);

  for (let i = 0; i < chunks.length; i++) {
    const embeddingText = `Title: ${doc.title}\nCategory: ${sourceType}\nBody: ${chunks[i]}`;

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: embeddingText,
    });

    const id = `${sourceType}_${doc._id}_${locale}_${i}`;
    const url = `/${locale}/${sourceType === 'blog' ? 'blog' : sourceType}/${doc.slug.current}`;

    await supabaseAdmin.from('search_documents').upsert({
      id,
      source_type: sourceType,
      source_id: doc._id,
      locale,
      title: doc.title,
      slug: doc.slug.current,
      summary: body.substring(0, 300),
      body: chunks[i],
      category: doc.category || sourceType,
      tags: doc.tags || [],
      url,
      published_at: doc.publishedAt,
      updated_at: doc.updatedAt || doc.publishedAt,
      chunk_index: i,
      chunk_total: chunks.length,
      embedding: response.data[0].embedding,
    });
  }
}

reindexAll().catch(console.error);
```

### 11.2 Incremental Indexing (Webhook)

```typescript
// src/app/api/search/webhook/route.ts

export async function POST(request: Request) {
  const secret = request.headers.get('x-webhook-secret');
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentId, type, action } = await request.json();

  // action: 'create' | 'update' | 'delete'

  if (action === 'delete') {
    await supabaseAdmin
      .from('search_documents')
      .delete()
      .like('id', `%_${documentId}_%`);
    return NextResponse.json({ success: true });
  }

  // Fetch full document from Sanity
  const doc = await sanityClient.fetch(`*[_id == $id][0]`, { id: documentId });

  // Re-index with embedding
  await indexDocument(type, doc, 'en');
  await indexDocument(type, doc, 'zh');

  return NextResponse.json({ success: true });
}
```

---

## 12. Fallback Strategy

### 12.1 Degradation Modes

| Scenario | Behavior | User Impact |
|----------|----------|-------------|
| OpenAI API down | Search works (pgvector + FTS); AI toggle disabled | No AI answers |
| Supabase down | Return cached popular results from edge | Stale but functional |
| Embedding API slow (>2s) | Fall back to full-text search only | Less relevant results |
| pgvector index corrupted | Rebuild from stored embeddings | Brief downtime |
| Rate limit exceeded | Return cached results; queue new requests | Delayed fresh results |

### 12.2 Full-Text Search Fallback

```sql
-- Fallback query when vector search fails
CREATE OR REPLACE FUNCTION search_content_fts(
  query_text TEXT,
  locale_filter TEXT,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  slug TEXT,
  summary TEXT,
  url TEXT,
  source_type TEXT,
  rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sd.id,
    sd.title,
    sd.slug,
    sd.summary,
    sd.url,
    sd.source_type,
    ts_rank_cd(sd.fts, plainto_tsquery('english', query_text))::real AS rank
  FROM search_documents sd
  WHERE
    sd.locale = locale_filter
    AND sd.fts @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
```

### 12.3 Error Handling

```typescript
async function smartSearch(query: string, locale: string) {
  try {
    // Try vector search first
    const embedding = await getQueryEmbedding(query);
    const results = await vectorSearch(embedding, locale);
    return { results, method: 'vector' };
  } catch (vectorError) {
    console.error('Vector search failed, falling back to FTS:', vectorError);

    try {
      // Fallback to full-text search
      const results = await fullTextSearch(query, locale);
      return { results, method: 'fts' };
    } catch (ftsError) {
      console.error('FTS also failed:', ftsError);

      // Last resort: return popular/cached results
      return { results: await getCachedPopularResults(locale), method: 'cached' };
    }
  }
}
```

---

## 13. File Structure

```
src/
├── app/
│   └── api/
│       └── search/
│           ├── route.ts              # GET search endpoint
│           └── ai/
│               └── route.ts          # POST AI Q&A endpoint
│           └── webhook/
│               └── route.ts          # POST Sanity webhook
├── components/
│   └── search/
│       ├── SearchModal.tsx           # Main modal container
│       ├── SearchInput.tsx           # Input + AI toggle
│       ├── AIAnswerPanel.tsx         # AI answer display
│       ├── SearchResults.tsx         # Result list
│       ├── ResultItem.tsx            # Single result card
│       ├── SearchSkeleton.tsx        # Loading states
│       ├── SearchEmpty.tsx           # Empty state
│       └── SearchFooter.tsx          # Keyboard hints
├── hooks/
│   └── useSearch.ts                 # Search hook (debounce, SWR)
│   └── useKeyboard.ts              # Keyboard shortcut handler
├── lib/
│   ├── search/
│   │   ├── embeddings.ts            # Embedding generation
│   │   ├── indexing.ts              # Document indexing logic
│   │   ├── chunking.ts             # Text chunking utilities
│   │   └── query.ts                # Query processing
│   └── openai.ts                    # OpenAI client setup
├── types/
│   └── search.ts                    # Search-related types
├── i18n/
│   └── messages/
│       ├── en.json                  # (add search.* keys)
│       └── zh.json                  # (add search.* keys)
scripts/
└── reindex-search.ts                # Manual reindex script
supabase/
└── migrations/
    └── 004_search_documents.sql     # Database migration
```

---

## 14. Environment Variables

```env
# .env.local additions

# OpenAI (for embeddings + Q&A)
OPENAI_API_KEY=sk-...

# Search configuration
SEARCH_EMBEDDING_MODEL=text-embedding-3-small
SEARCH_AI_MODEL=gpt-4o-mini
SEARCH_MAX_CONTEXT_TOKENS=6000
SEARCH_SIMILARITY_THRESHOLD=0.5
SEARCH_MAX_RESULTS=20

# Sanity webhook
SANITY_WEBHOOK_SECRET=your-webhook-secret

# Rate limiting
SEARCH_RATE_LIMIT_MAX=60
SEARCH_AI_RATE_LIMIT_MAX=20
```

---

## 15. Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `openai` | Embeddings + GPT-4o-mini | `^4.x` |
| `ai` | Vercel AI SDK for streaming | `^4.x` |
| `swr` | Client-side data fetching & caching | `^2.x` |

**No new infrastructure** — uses existing Supabase (pgvector), Vercel (edge caching), and OpenAI API.

---

## 16. Cost Estimation

### 16.1 One-time Indexing

| Item | Quantity | Cost |
|------|----------|------|
| Embedding documents | ~500 docs × 3 chunks avg = 1500 embeddings | ~$0.03 |
| Total (initial index) | — | **< $0.10** |

### 16.2 Monthly Operating Cost

| Item | Quantity | Cost |
|------|----------|------|
| Query embeddings | 1000 queries × 200 tokens = 200K tokens | ~$0.004 |
| AI Q&A (GPT-4o-mini) | 500 AI queries × 1500 tokens avg = 750K tokens | ~$0.11 |
| Supabase pgvector | Included in free tier (500MB) | $0 |
| OpenAI embedding storage | 1500 vectors × 1536 dims × 4 bytes ≈ 9MB | $0 |
| **Monthly Total** | — | **~$0.12** |

**Well within free-tier budgets.** At scale (10x), still under $2/month for AI costs.

---

## 17. Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Prompt injection** | Sanitize user queries; system prompt emphasizes using only provided context |
| **Data leakage** | Only public content is indexed; no user data or ticket content in search index |
| **API key exposure** | OpenAI key in server env only; never sent to client |
| **Rate limiting** | Per-IP limits prevent abuse of OpenAI API |
| **Input validation** | Query length capped at 500 chars; special characters sanitized |
| **CORS** | Search API restricted to same-origin requests |

---

## 18. Implementation Phases

| Phase | Scope | Effort | Dependencies |
|-------|-------|--------|--------------|
| **Phase 1** | Semantic search (no AI) | 2-3 days | Supabase pgvector setup, indexing script |
| **Phase 2** | Search UI (modal, results) | 2 days | shadcn Dialog component |
| **Phase 3** | AI Q&A mode | 2 days | OpenAI API integration |
| **Phase 4** | Sanity webhook + incremental indexing | 1 day | Sanity webhook config |
| **Phase 5** | Caching, rate limiting, polish | 1-2 days | Vercel edge config |
| **Total** | — | **8-10 days** | — |

---

## 19. Open Questions

| # | Question | Options | Recommended |
|---|----------|---------|-------------|
| 1 | OpenAI API key management | Single key vs organization key | Single key (simpler for now) |
| 2 | Conversation memory for follow-up Q&A | Store conversation history or stateless | Stateless initially; add memory later |
| 3 | Search analytics tracking | Track what users search for | Yes — log queries (anonymized) to improve content |
| 4 | Auto-suggest / trending searches | Show popular queries in idle state | Phase 2 feature |
| 5 | Search within specific sections | Dedicated search on blog/products pages | Phase 2 feature |
| 6 | pgvector vs external vector DB (Pinecone/Weaviate) | Supabase built-in vs dedicated | Supabase pgvector (simpler, sufficient for <100K docs) |

---

*End of Smart Search Design Document*
