# AI Hub Integration Solution - Technical Design Document

**Version:** 1.0
**Date:** 2026-07-05
**Status:** Draft
**PRD References:** [S1]-[S22] Full PRD Coverage
**Companion Documents:** Smart-Ticket-Assistant-Design.md, Smart-Form-Design.md, Ticket-Trend-Analysis-Design.md

---

## 1. Executive Summary

### 1.1 What Is the AI Hub

The AI Hub is a centralized AI-powered intelligence layer that unifies and extends the existing Smart Form, Smart Ticket Assistant, and Ticket Trend Analysis features into a cohesive, platform-wide AI experience — similar to 53ai's hub model but purpose-built for B2B IT services.

Unlike standalone AI features bolted onto individual pages, the AI Hub creates a **persistent, context-aware AI presence** across the entire TGWS website — from pre-sales product discovery to post-sales support resolution.

### 1.2 Gap Analysis: Current State vs AI Hub

| Capability | Current (3 Separate Features) | With AI Hub | Gap |
|------------|------------------------------|-------------|-----|
| AI Entry Points | Ticket form + Contact form only | Every page, every interaction | **Major** |
| Context Sharing | None (isolated features) | Shared user context across all AI features | **Major** |
| Knowledge Base | None (AI generates from prompt only) | RAG over product docs, KB articles, past tickets | **Major** |
| Conversational UI | None | Persistent AI chat widget | **Major** |
| Proactive AI | None (reactive only) | AI-driven recommendations, alerts, suggestions | **Major** |
| Multi-Model Routing | Single model (GPT-4o-mini) | Model selection based on task complexity | **Minor** |
| Admin AI Tools | Trend analysis only | Full AI admin dashboard with insights | **Medium** |
| Self-Learning | None | Feedback loop from ticket resolutions | **Medium** |
| A/B Testing | None | AI feature experiment framework | **Minor** |

### 1.3 Business Value Proposition

| Stakeholder | Value | Quantified Impact |
|-------------|-------|-------------------|
| **IT Managers/CTOs** | Instant answers without waiting for sales | 3x faster pre-sales engagement |
| **Sales Team** | AI-scored leads, auto-enriched CRM entries | 40% more qualified leads |
| **Support Team** | AI auto-triage, suggested resolutions, knowledge base | 50% faster first response |
| **Management** | Real-time business intelligence across all touchpoints | Data-driven decisions |
| **TGWS Brand** | Differentiated "AI-first" positioning in HK/SEA market | Competitive moat |

---

## 2. Integration Architecture

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TGWS WEBSITE (Next.js 16)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Homepage   │  │   Products   │  │  Solutions   │  │   Support    │   │
│  │   /en/home   │  │   /en/...    │  │  /en/...     │  │   /en/...    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │                 │             │
│  ───────┼─────────────────┼─────────────────┼─────────────────┼─────────── │
│         │          AI HUB LAYER             │                 │             │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴───────┐   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              AI CONTEXT MANAGER                             │   │   │
│  │  │  • User session state  • Browsing history  • Auth state     │   │   │
│  │  │  • Page context        • Language preference                 │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────┐   │   │
│  │  │ AI Chat     │ │ Smart Forms  │ │ Knowledge   │ │ AI Admin  │   │   │
│  │  │ Widget      │ │ Engine       │ │ Base (RAG)  │ │ Dashboard │   │   │
│  │  └──────┬──────┘ └──────┬───────┘ └──────┬──────┘ └─────┬─────┘   │   │
│  │         │               │               │               │          │   │
│  │  ┌──────┴───────────────┴───────────────┴───────────────┴──────┐   │   │
│  │  │                AI ORCHESTRATION LAYER                        │   │   │
│  │  │                                                              │   │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │   │
│  │  │  │ Model Router │  │ Prompt Cache │  │ Rate Limiter     │  │   │   │
│  │  │  │              │  │              │  │                  │  │   │   │
│  │  │  │ • gpt-4o-mini│  │ • System     │  │ • Per-user       │  │   │   │
│  │  │  │   (analysis) │  │   prompts    │  │ • Per-endpoint   │  │   │   │
│  │  │  │ • gpt-4o     │  │ • RAG docs   │  │ • Global cap     │  │   │   │
│  │  │  │   (complex)  │  │ • Product    │  │                  │  │   │   │
│  │  │  │ • Embeddings │  │   catalog    │  └──────────────────┘  │   │   │
│  │  │  │   (RAG)      │  └──────────────┘                        │   │   │
│  │  │  └──────────────┘                                          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────── API ROUTES LAYER ─────────────────────────────── │
│                                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ /api/ai/   │ │ /api/ai/   │ │ /api/ai/   │ │ /api/ai/   │             │
│  │ chat       │ │ knowledge  │ │ forms      │ │ insights   │             │
│  └──────┬─────┘ └──────┬─────┘ └──────┬─────┘ └──────┬─────┘             │
│         │              │              │              │                     │
│  ───────┼──────────────┼──────────────┼──────────────┼─────────────────── │
│         │       EXTERNAL SERVICES     │              │                     │
│  ┌──────┴──────────────┴──────────────┴──────────────┴─────────────┐      │
│  │                                                                  │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │      │
│  │  │ OpenAI   │  │ Supabase │  │ Sanity   │  │ Vector Store   │  │      │
│  │  │ API      │  │ (DB/Auth)│  │ (CMS)    │  │ (pgvector)     │  │      │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │      │
│  │                                                                  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Integration Map

| AI Hub Component | Existing Feature | Integration Method | New Code Required |
|------------------|------------------|--------------------|-------------------|
| AI Chat Widget | None (new) | New component, sits in layout | `src/components/ai-hub/ChatWidget/` |
| Smart Forms Engine | Smart-Form-Design.md | Refactor into AI Hub module | `src/components/ai-hub/SmartForms/` |
| Knowledge Base (RAG) | None (new) | Supabase pgvector + embeddings | `src/lib/ai/knowledge-base/` |
| AI Admin Dashboard | Ticket-Trend-Analysis-Design.md | Extend with new panels | `src/components/ai-hub/AdminDashboard/` |
| Context Manager | None (new) | React Context + server-side | `src/lib/ai/context-manager.ts` |
| Model Router | None (new) | Abstraction layer | `src/lib/ai/model-router.ts` |

### 2.3 File Structure

```
src/
├── lib/
│   ├── ai/
│   │   ├── context-manager.ts       # Shared AI context across features
│   │   ├── model-router.ts          # Multi-model routing
│   │   ├── rate-limit.ts            # Unified rate limiting
│   │   ├── sanitize.ts              # Input sanitization (existing, shared)
│   │   ├── prompts/
│   │   │   ├── chat.ts              # Chat widget prompts
│   │   │   ├── analysis.ts          # Form/ticket analysis (existing)
│   │   │   ├── knowledge.ts         # RAG retrieval prompts
│   │   │   ├── insights.ts          # Admin insight generation
│   │   │   └── products.ts          # Product recommendation prompts
│   │   ├── knowledge-base/
│   │   │   ├── embeddings.ts        # Text embedding generation
│   │   │   ├── retrieval.ts         # Semantic search over KB
│   │   │   ├── indexer.ts           # Content indexing pipeline
│   │   │   └── sources/
│   │   │       ├── sanity-sync.ts   # Index Sanity content
│   │   │       ├── ticket-sync.ts   # Index resolved tickets
│   │   │       └── doc-sync.ts      # Index uploaded docs
│   │   ├── feedback/
│   │   │   └── learning-loop.ts     # Track AI accuracy, improve prompts
│   │   └── cache/
│   │       ├── prompt-cache.ts      # Cache system prompts
│   │       └── response-cache.ts    # Cache frequent AI responses
│   └── supabase/
│       └── migrations/
│           └── 005_ai_hub.sql       # New tables for AI Hub
│
├── components/
│   ├── ai-hub/
│   │   ├── ChatWidget/
│   │   │   ├── index.tsx            # Main chat widget (FAB + drawer)
│   │   │   ├── ChatMessage.tsx      # Message bubble component
│   │   │   ├── ChatInput.tsx        # Input with file upload support
│   │   │   ├── ChatSuggestions.tsx   # Pre-built suggestion chips
│   │   │   ├── KnowledgeResult.tsx  # KB article card display
│   │   │   └── hooks/
│   │   │       ├── useChat.ts       # Chat state management
│   │   │       ├── useStreamResponse.ts  # SSE streaming
│   │   │       └── useChatContext.ts     # Context awareness
│   │   │
│   │   ├── SmartForms/
│   │   │   ├── SmartFormProvider.tsx # Unified form intelligence context
│   │   │   ├── SmartFormWrapper.tsx  # HOC for any form
│   │   │   ├── AnalysisPanel.tsx     # Side panel (refactored from existing)
│   │   │   ├── SuggestionChips.tsx
│   │   │   ├── FollowUpQuestions.tsx
│   │   │   ├── QualityIndicator.tsx
│   │   │   └── hooks/
│   │   │       ├── useSmartAnalysis.ts
│   │   │       ├── useAutoFill.ts
│   │   │       └── useLeadScore.ts
│   │   │
│   │   ├── KnowledgeBase/
│   │   │   ├── ArticleCard.tsx       # KB article display
│   │   │   ├── SearchResults.tsx     # KB search results
│   │   │   ├── ArticleViewer.tsx     # Full article view
│   │   │   └── FeedbackWidget.tsx    # "Was this helpful?" feedback
│   │   │
│   │   ├── AdminDashboard/
│   │   │   ├── OverviewPanel.tsx     # Main metrics overview
│   │   │   ├── AIInsightsPanel.tsx   # AI-generated business insights
│   │   │   ├── TrendCharts.tsx       # Extended from Ticket-Trend-Analysis
│   │   │   ├── ForecastPanel.tsx     # AI predictions
│   │   │   ├── UsageTracker.tsx      # AI API usage & cost tracking
│   │   │   └── hooks/
│   │   │       ├── useAnalytics.ts
│   │   │       └── useForecast.ts
│   │   │
│   │   └── shared/
│   │       ├── AIBadge.tsx           # "AI-powered" badge component
│   │       ├── ConfidenceMeter.tsx   # Confidence score display
│   │       ├── StreamingText.tsx     # Typewriter streaming effect
│   │       └── ThinkingIndicator.tsx # "AI is thinking..." animation
│   │
│   └── layout/
│       └── AIHubProvider.tsx         # Root provider for AI context
│
├── app/
│   └── api/
│       └── ai/
│           ├── chat/
│           │   └── route.ts          # POST /api/ai/chat (SSE streaming)
│           ├── knowledge/
│           │   ├── search/
│           │   │   └── route.ts      # POST /api/ai/knowledge/search
│           │   └── index/
│           │       └── route.ts      # POST /api/ai/knowledge/index (admin)
│           ├── forms/
│           │   ├── analyze/
│           │   │   └── route.ts      # POST /api/ai/forms/analyze
│           │   ├── followup/
│           │   │   └── route.ts      # POST /api/ai/forms/followup
│           │   ├── validate/
│           │   │   └── route.ts      # POST /api/ai/forms/validate
│           │   └── score/
│           │       └── route.ts      # POST /api/ai/forms/score
│           ├── insights/
│           │   ├── daily/
│           │   │   └── route.ts      # GET /api/ai/insights/daily
│           │   ├── forecast/
│           │   │   └── route.ts      # GET /api/ai/insights/forecast
│           │   └── anomalies/
│           │       └── route.ts      # GET /api/ai/insights/anomalies
│           ├── products/
│           │   └── recommend/
│           │       └── route.ts      # POST /api/ai/products/recommend
│           └── feedback/
│               └── route.ts          # POST /api/ai/feedback (learning loop)
│
└── types/
    └── ai-hub.ts                     # All AI Hub TypeScript types
```

---

## 3. Feature Mapping: 53ai Hub Features → TGWS AI Hub

### 3.1 Feature Comparison Matrix

| # | 53ai Hub Feature | TGWS AI Hub Equivalent | Priority | Phase |
|---|------------------|------------------------|----------|-------|
| 1 | AI Chatbot | AI Chat Widget with KB grounding | **P0** | 1 |
| 2 | Knowledge Base | RAG-powered Knowledge Base (Supabase pgvector) | **P0** | 1 |
| 3 | AI-powered Search | Semantic search across products, solutions, tickets | **P0** | 1 |
| 4 | Auto-categorization | Smart Forms category detection (existing) | **P0** | 1 |
| 5 | Lead Scoring | Smart Forms lead scoring (existing) | **P1** | 1 |
| 6 | Intent Detection | Smart Forms intent classification (existing) | **P1** | 1 |
| 7 | FAQ Auto-generation | AI-generated FAQ from KB articles | **P1** | 2 |
| 8 | Proactive Engagement | Context-aware chat suggestions based on page | **P1** | 2 |
| 9 | Multi-language AI | Bilingual (EN/ZH) AI responses | **P0** | 1 |
| 10 | Product Recommendations | AI-powered product discovery | **P1** | 2 |
| 11 | Sentiment Analysis | Ticket sentiment tracking (existing) | **P1** | 1 |
| 12 | Conversation History | Persistent chat history for logged-in users | **P2** | 3 |
| 13 | AI-powered Analytics | Ticket trend analysis + AI insights (existing+) | **P1** | 2 |
| 14 | Custom AI Workflows | Prompt chain orchestration for complex queries | **P2** | 3 |
| 15 | API Integration | CRM sync, email triggers via AI Hub | **P1** | 2 |
| 16 | Human Handoff | Seamless chat → ticket creation escalation | **P0** | 1 |
| 17 | Analytics Dashboard | Admin AI dashboard with usage tracking | **P1** | 2 |
| 18 | A/B Testing | AI feature experimentation framework | **P2** | 3 |
| 19 | Feedback Loop | User feedback on AI responses → improvement | **P1** | 2 |
| 20 | Content Generation | Blog drafts, product descriptions, email drafts | **P2** | 3 |

### 3.2 Phase Definitions

| Phase | Timeline | Features | Effort |
|-------|----------|----------|--------|
| **Phase 1: Foundation** | 4 weeks | Chat Widget, KB (RAG), Form Intelligence, Human Handoff | 320 hrs |
| **Phase 2: Intelligence** | 3 weeks | Product Recommendations, Analytics, FAQ Generation, Feedback Loop | 200 hrs |
| **Phase 3: Advanced** | 3 weeks | Conversation History, Custom Workflows, A/B Testing, Content Generation | 200 hrs |

---

## 4. Detailed Feature Design

### 4.1 AI Chat Widget

The AI Chat Widget is the centerpiece of the AI Hub — a persistent, context-aware conversational AI that lives on every page.

#### 4.1.1 User Experience

```
┌──────────────────────────────────────────────┐
│  Every Page: Floating Action Button (FAB)     │
│                                               │
│  ┌─────────────┐                              │
│  │  💬 Ask AI  │  ← Floating bottom-right     │
│  └─────────────┘                              │
│                                               │
│  Click → Expands to chat drawer:              │
│                                               │
│  ┌──────────────────────────────────────┐    │
│  │  TechGuru AI Assistant          [X] │    │
│  ├──────────────────────────────────────┤    │
│  │                                      │    │
│  │  👋 Hi! I'm TechGuru AI. I can     │    │
│  │  help you with:                      │    │
│  │                                      │    │
│  │  ┌──────────────────────────┐       │    │
│  │  │ 🛡️ Security solutions   │       │    │
│  │  ├──────────────────────────┤       │    │
│  │  │ ☁️ Cloud infrastructure  │       │    │
│  │  ├──────────────────────────┤       │    │
│  │  │ 🔄 VMware alternatives   │       │    │
│  │  ├──────────────────────────┤       │    │
│  │  │ 📋 Check my tickets      │       │    │
│  │  ├──────────────────────────┤       │    │
│  │  │ 💰 Get a quote           │       │    │
│  │  └──────────────────────────┘       │    │
│  │                                      │    │
│  │  ┌──────────────────────────────┐   │    │
│  │  │ Type your question...  [📎]  │   │    │
│  │  └──────────────────────────────┘   │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

#### 4.1.2 Context-Aware Behavior

The chat widget adapts its suggestions based on the current page:

| Current Page | Default Suggestions | AI Context |
|-------------|---------------------|------------|
| `/products/protect/ngfw` | "Compare NGFW products", "Get NGFW pricing", "NGFW vs WAF" | Product catalog context loaded |
| `/solutions/healthcare` | "Healthcare compliance requirements", "HIPAA solutions", "Talk to expert" | Healthcare solution context |
| `/vmware-alternative` | "VMware migration steps", "Cost comparison", "Hardware compatibility" | VMware migration context |
| `/support` | "Check ticket status", "Common issues", "Contact support" | User's ticket history |
| `/blog/[slug]` | "Summarize this article", "Related products", "Ask follow-up" | Article content context |

#### 4.1.3 API Design

```
POST /api/ai/chat
```

**Request:**
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  context: {
    pagePath: string;           // Current page URL
    locale: 'en' | 'zh';
    userId?: string;            // If authenticated
    sessionId: string;          // Chat session ID
  };
  options: {
    stream: boolean;            // Enable SSE streaming
    maxTokens?: number;
    knowledgeBase?: boolean;    // Enable RAG retrieval
  };
}
```

**Response (non-streaming):**
```typescript
{
  success: true;
  data: {
    message: {
      role: 'assistant';
      content: string;
      sources?: Array<{
        type: 'knowledge_base' | 'product' | 'ticket' | 'blog';
        title: string;
        url: string;
        relevance: number;
      }>;
    };
    suggestions: string[];      // Follow-up suggestion chips
    handoff?: {
      type: 'ticket' | 'contact' | 'sales';
      reason: string;
    };
  },
  meta: {
    tokensUsed: number;
    processingTimeMs: number;
    model: string;
    knowledgeBaseHits: number;
  };
}
```

**Response (streaming via SSE):**
```
event: token
data: {"content": "Based on your requirements..."}

event: sources
data: {"sources": [{"title": "NGFW Product Guide", "url": "/products/protect/ngfw"}]}

event: suggestions
data: {"suggestions": ["Compare with WAF", "Get pricing", "Talk to expert"]}

event: done
data: {"tokensUsed": 234, "model": "gpt-4o-mini"}
```

#### 4.1.4 Streaming Implementation

```typescript
// src/app/api/ai/chat/route.ts
import { OpenAI } from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  const { messages, context, options } = await req.json();

  // 1. Retrieve relevant knowledge base documents
  const kbResults = options.knowledgeBase
    ? await searchKnowledgeBase(messages[messages.length - 1].content, context.locale)
    : [];

  // 2. Build system prompt with context
  const systemPrompt = buildChatSystemPrompt(context, kbResults);

  // 3. Stream response
  const stream = await openai.chat.completions.create({
    model: selectModel(messages),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    max_tokens: options.maxTokens || 1000,
    temperature: 0.7,
  });

  // 4. Create ReadableStream for SSE
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          controller.enqueue(
            encoder.encode(`event: token\ndata: ${JSON.stringify({ content })}\n\n`)
          );
        }
      }

      // Send sources and suggestions after content is complete
      const suggestions = await generateFollowUpSuggestions(fullContent, context);
      controller.enqueue(
        encoder.encode(`event: suggestions\ndata: ${JSON.stringify({ suggestions })}\n\n`)
      );

      // Check if handoff is needed
      const handoff = detectHandoffNeed(fullContent, context);
      if (handoff) {
        controller.enqueue(
          encoder.encode(`event: handoff\ndata: ${JSON.stringify({ handoff })}\n\n`)
        );
      }

      controller.enqueue(
        encoder.encode(`event: done\ndata: ${JSON.stringify({ tokensUsed: 0 })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 4.2 Knowledge Base (RAG)

The Knowledge Base provides Retrieval-Augmented Generation (RAG) over TechGuru's content — product documentation, case studies, resolved tickets, and blog posts.

#### 4.2.1 Data Sources

| Source | Content | Indexing | Update Frequency |
|--------|---------|----------|------------------|
| Sanity CMS | Product descriptions, solutions, case studies | On content publish (webhook) | Real-time |
| Resolved Tickets | Historical ticket descriptions + resolutions | Nightly batch job | Daily |
| Blog Posts | Technical articles, news | On publish (webhook) | Real-time |
| Uploaded Docs | PDFs, manuals, whitepapers | On upload (admin) | Manual |
| FAQ Entries | Curated FAQ answers | On edit (admin) | Real-time |

#### 4.2.2 Embedding & Vector Storage

```sql
-- Enable pgvector extension in Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base documents table
CREATE TABLE kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL,     -- 'product', 'solution', 'case_study', 'ticket', 'blog', 'faq'
  source_id VARCHAR(100),               -- Reference to original content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_embedding vector(1536),       -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}',          -- Category, tags, locale, etc.
  locale VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX kb_documents_embedding_idx ON kb_documents
  USING hnsw (content_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Index for filtering by source type and locale
CREATE INDEX kb_documents_source_locale_idx ON kb_documents (source_type, locale);

-- Content search index (for hybrid search)
CREATE INDEX kb_documents_content_fts_idx ON kb_documents
  USING GIN (to_tsvector('english', title || ' ' || content));
```

#### 4.2.3 Retrieval Pipeline

```typescript
// src/lib/ai/knowledge-base/retrieval.ts

interface KBSearchResult {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  relevance: number;
  url?: string;
}

export async function searchKnowledgeBase(
  query: string,
  locale: 'en' | 'zh',
  options: {
    maxResults?: number;
    minRelevance?: number;
    sourceTypes?: string[];
    hybrid?: boolean;  // Combine vector + FTS
  } = {}
): Promise<KBSearchResult[]> {
  const { maxResults = 5, minRelevance = 0.7, sourceTypes, hybrid = true } = options;

  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Vector similarity search
  const vectorResults = await supabase.rpc('search_kb_documents', {
    query_embedding: queryEmbedding,
    match_locale: locale,
    match_source_types: sourceTypes || null,
    match_count: maxResults * 2,  // Over-fetch for hybrid re-ranking
  });

  // 3. Optional: Full-text search for hybrid retrieval
  let ftsResults: any[] = [];
  if (hybrid) {
    ftsResults = await supabase
      .from('kb_documents')
      .select('id, title, content, source_type, metadata')
      .textSearch('content', query, { type: 'websearch' })
      .eq('locale', locale)
      .limit(maxResults * 2);
  }

  // 4. Reciprocal Rank Fusion (RRF) for hybrid re-ranking
  const mergedResults = reciprocalRankFusion(
    vectorResults.data || [],
    ftsResults.data || [],
    { k: 60 }  // RRF constant
  );

  // 5. Filter by minimum relevance
  return mergedResults
    .filter(r => r.relevance >= minRelevance)
    .slice(0, maxResults)
    .map(r => ({
      id: r.id,
      title: r.title,
      content: r.content.slice(0, 500),  // Truncate for prompt
      sourceType: r.source_type,
      relevance: r.relevance,
      url: r.metadata?.url,
    }));
}

function reciprocalRankFusion(
  vectorResults: any[],
  ftsResults: any[],
  { k = 60 }: { k: number }
): any[] {
  const scores = new Map<string, number>();

  vectorResults.forEach((r, rank) => {
    scores.set(r.id, (scores.get(r.id) || 0) + 1 / (k + rank + 1));
  });

  ftsResults.forEach((r, rank) => {
    scores.set(r.id, (scores.get(r.id) || 0) + 1 / (k + rank + 1));
  });

  // Return merged + sorted
  const allDocs = new Map<string, any>();
  [...vectorResults, ...ftsResults].forEach(r => allDocs.set(r.id, r));

  return Array.from(scores.entries())
    .map(([id, score]) => ({ ...allDocs.get(id), relevance: score }))
    .sort((a, b) => b.relevance - a.relevance);
}
```

#### 4.2.4 Embedding Generation

```typescript
// src/lib/ai/knowledge-base/embeddings.ts

import OpenAI from 'openai';

const openai = new OpenAI();

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8192),  // Model max input
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  // Batch API for indexing (max 2048 per call)
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map(t => t.slice(0, 8192)),
    dimensions: 1536,
  });
  return response.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
}
```

#### 4.2.5 Content Indexing Pipeline

```typescript
// src/lib/ai/knowledge-base/indexer.ts

export async function indexSanityContent(type: string, document: any) {
  // Chunk long content into embedding-friendly sizes
  const chunks = chunkContent(document.body, {
    maxChunkSize: 500,
    overlapSize: 50,
    separators: ['\n\n', '\n', '. ', ' '],
  });

  const embeddings = await generateEmbeddingsBatch(chunks.map(c => c.text));

  // Upsert into kb_documents
  for (let i = 0; i < chunks.length; i++) {
    await supabase.from('kb_documents').upsert({
      source_type: type,
      source_id: document._id,
      title: document.title,
      content: chunks[i].text,
      content_embedding: embeddings[i],
      metadata: {
        url: `/${type}/${document.slug}`,
        chunkIndex: i,
        totalChunks: chunks.length,
      },
      locale: document.locale || 'en',
    });
  }
}

function chunkContent(
  text: string,
  options: { maxChunkSize: number; overlapSize: number; separators: string[] }
): Array<{ text: string; startIndex: number }> {
  const chunks: Array<{ text: string; startIndex: number }> = [];
  let remaining = text;
  let startIndex = 0;

  while (remaining.length > 0) {
    if (remaining.length <= options.maxChunkSize) {
      chunks.push({ text: remaining.trim(), startIndex });
      break;
    }

    // Find best split point
    let splitPoint = -1;
    for (const sep of options.separators) {
      const lastSep = remaining.lastIndexOf(sep, options.maxChunkSize);
      if (lastSep > options.maxChunkSize * 0.5) {
        splitPoint = lastSep + sep.length;
        break;
      }
    }

    if (splitPoint === -1) splitPoint = options.maxChunkSize;

    chunks.push({
      text: remaining.slice(0, splitPoint).trim(),
      startIndex,
    });

    remaining = remaining.slice(splitPoint - options.overlapSize);
    startIndex += splitPoint - options.overlapSize;
  }

  return chunks.filter(c => c.text.length > 20);  // Filter tiny chunks
}
```

### 4.3 Product Recommendation Engine

#### 4.3.1 Algorithm

The recommendation engine uses a combination of:
1. **Semantic matching** — user query ↔ product descriptions
2. **Behavioral signals** — pages visited, time spent, prior interactions
3. **Collaborative filtering** — similar users' product interests

```typescript
// src/lib/ai/products/recommend.ts

interface ProductRecommendation {
  productId: string;
  name: string;
  category: 'build' | 'run' | 'protect';
  relevance: number;
  reason: string;
  cta: string;       // Call-to-action text
  ctaUrl: string;
}

export async function getRecommendations(context: {
  query?: string;
  pageContext?: string;
  userHistory?: UserHistory;
  locale: 'en' | 'zh';
  limit?: number;
}): Promise<ProductRecommendation[]> {
  const recommendations: ProductRecommendation[] = [];

  // 1. Semantic matching from query
  if (context.query) {
    const queryEmbedding = await generateEmbedding(context.query);
    const semanticMatches = await supabase.rpc('search_products_by_embedding', {
      query_embedding: queryEmbedding,
      match_count: 5,
    });
    recommendations.push(...semanticMatches.data.map(r => ({
      ...r,
      reason: 'Based on your question',
    })));
  }

  // 2. Page context matching
  if (context.pageContext) {
    const contextProducts = await getContextualProducts(context.pageContext);
    recommendations.push(...contextProducts);
  }

  // 3. User history-based
  if (context.userHistory?.visitedProducts?.length) {
    const relatedProducts = await getRelatedProducts(context.userHistory.visitedProducts);
    recommendations.push(...relatedProducts);
  }

  // 4. Deduplicate and rank
  return deduplicateAndRank(recommendations, context.limit || 3);
}
```

### 4.4 Human Handoff System

Seamless escalation from AI chat to human support:

```
AI Chat detects escalation trigger
    │
    ├──▶ "I understand this requires expert assistance."
    │
    ├──▶ Option 1: Create Ticket (auto-populated from chat context)
    │    ┌─────────────────────────────────────┐
    │    │  Would you like me to create a      │
    │    │  support ticket from our chat?       │
    │    │                                      │
    │    │  [Yes, create ticket]  [No, continue]│
    │    └─────────────────────────────────────┘
    │
    ├──▶ Option 2: Contact Form (for sales inquiries)
    │    ┌─────────────────────────────────────┐
    │    │  Let me connect you with our sales  │
    │    │  team. I've pre-filled your info.   │
    │    │                                      │
    │    │  [Go to contact form]               │
    │    └─────────────────────────────────────┘
    │
    └──▶ Option 3: Schedule a Call
         ┌─────────────────────────────────────┐
         │  Book a 15-min consultation:        │
         │  [Calendar link]                     │
         └─────────────────────────────────────┘
```

#### 4.4.1 Chat-to-Ticket Conversion

```typescript
// src/lib/ai/handoff/chat-to-ticket.ts

export async function createTicketFromChat(
  chatSessionId: string,
  userId: string
): Promise<{ ticketId: string; ticketNumber: string }> {
  // 1. Retrieve chat history
  const messages = await getChatMessages(chatSessionId);

  // 2. AI extracts ticket fields from conversation
  const ticketData = await extractTicketFromConversation(messages);

  // 3. Create ticket with AI metadata
  const { data: ticket } = await supabase
    .from('tickets')
    .insert({
      user_id: userId,
      category: ticketData.category,
      product_service: ticketData.product,
      subject: ticketData.subject,
      description: ticketData.description,
      priority: ticketData.priority,
      status: 'open',
      ai_source: 'chat_handoff',
      ai_analysis: {
        chatSessionId,
        extractedFrom: 'ai_chat',
        confidence: ticketData.confidence,
      },
    })
    .select('id, ticket_number')
    .single();

  // 4. Generate acknowledgment with chat context
  await sendTicketAcknowledgment(ticket, { chatSummary: ticketData.summary });

  return { ticketId: ticket.id, ticketNumber: ticket.ticket_number };
}

async function extractTicketFromConversation(messages: ChatMessage[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Extract ticket fields from this chat conversation.
Return JSON: { category, product, subject, description, priority, summary }.
Use TechGuru categories: build/run/protect.
Use priority: low/medium/high/critical.`,
      },
      {
        role: 'user',
        content: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 4.5 Admin AI Dashboard

Extends the Ticket Trend Analysis design with AI-specific panels:

#### 4.5.1 AI Insights Panel

```
┌───────────────────────────────────────────────────────────┐
│  AI-POWERED INSIGHTS                                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  🔍 Trend Alert                                           │
│  "Protect category tickets increased 23% this week,      │
│   driven by 15 firewall-related tickets from 3           │
│   enterprise customers. Consider promoting NGFW           │
│   health checks to existing customers."                   │
│                                                           │
│  📊 Product Opportunity                                   │
│  "12 chat sessions this week mentioned 'VMware costs'    │
│   but didn't convert to tickets. Consider creating a     │
│   VMware cost calculator page."                           │
│                                                           │
│  🎯 Customer Insight                                      │
│  "Healthcare sector tickets have 40% higher urgency      │
│   scores. Recommend dedicated healthcare support          │
│   escalation path."                                       │
│                                                           │
│  ⚡ Efficiency Tip                                        │
│  "AI auto-categorization accuracy is 87%. The 13%        │
│   misclassification is concentrated in 'run' vs          │
│   'protect' boundary. Refine product taxonomy."          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

#### 4.5.2 AI Usage & Cost Tracking

```sql
-- AI usage tracking table
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  endpoint VARCHAR(100) NOT NULL,
  model VARCHAR(50) NOT NULL,
  tokens_input INTEGER NOT NULL,
  tokens_output INTEGER NOT NULL,
  cost_usd DECIMAL(10,6) NOT NULL,
  processing_time_ms INTEGER,
  cache_hit BOOLEAN DEFAULT FALSE,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily usage aggregation view
CREATE MATERIALIZED VIEW ai_daily_usage AS
SELECT
  DATE(created_at) as date,
  endpoint,
  model,
  COUNT(*) as request_count,
  SUM(tokens_input) as total_input_tokens,
  SUM(tokens_output) as total_output_tokens,
  SUM(cost_usd) as total_cost,
  AVG(processing_time_ms) as avg_processing_time,
  SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) as cache_hits,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as error_count
FROM ai_usage_log
GROUP BY DATE(created_at), endpoint, model;
```

### 4.6 Feedback Loop & Learning

#### 4.6.1 Feedback Collection

```typescript
// Feedback types
interface AIFeedback {
  id: string;
  sessionId: string;
  feature: 'chat' | 'form' | 'recommendation' | 'knowledge_base';
  feedbackType: 'helpful' | 'not_helpful' | 'incorrect' | 'partial';
  userComment?: string;
  context: {
    query: string;
    aiResponse: string;
    sourcesUsed: string[];
  };
  userId?: string;
  createdAt: Date;
}
```

#### 4.6.2 Continuous Improvement Pipeline

```
User Feedback Collected
    │
    ├──▶ Stored in ai_feedback table
    │
    ├──▶ Daily batch analysis:
    │    • Aggregate feedback by feature
    │    • Identify low-rated responses
    │    • Extract common complaint patterns
    │
    ├──▶ Weekly prompt optimization:
    │    • AI analyzes feedback patterns
    │    • Suggests prompt improvements
    │    • Admin reviews and approves changes
    │
    └──▶ Monthly accuracy report:
         • Track accuracy trends per feature
         • Identify knowledge gaps (questions AI can't answer)
         • Recommend new KB articles needed
```

---

## 5. Data Model Extensions

### 5.1 New Tables

```sql
-- Chat sessions
CREATE TABLE ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  page_path TEXT,
  locale VARCHAR(5) DEFAULT 'en',
  status VARCHAR(20) DEFAULT 'active',   -- active, ended, handed_off
  message_count INTEGER DEFAULT 0,
  handoff_type VARCHAR(50),              -- ticket, contact, sales
  handoff_id UUID,                       -- Reference to created ticket/contact
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,             -- user, assistant, system
  content TEXT NOT NULL,
  sources JSONB,                         -- KB sources used
  tokens_used INTEGER,
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI feedback
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id UUID,
  feature VARCHAR(50) NOT NULL,          -- chat, form, recommendation, knowledge_base
  feedback_type VARCHAR(20) NOT NULL,    -- helpful, not_helpful, incorrect, partial
  user_comment TEXT,
  context JSONB,                         -- query, response, sources
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge base documents (vector storage)
CREATE TABLE kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL,
  source_id VARCHAR(100),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  locale VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product embeddings for semantic search
CREATE TABLE product_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  locale VARCHAR(5) DEFAULT 'en',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI configuration (admin-editable)
CREATE TABLE ai_config (
  id VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 RLS Policies

```sql
-- Chat sessions: users see their own, admins see all
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chat sessions"
  ON ai_chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all chat sessions"
  ON ai_chat_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Chat messages: follow session access rules
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view messages in own sessions"
  ON ai_chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM ai_chat_sessions
      WHERE user_id = auth.uid()
    )
  );

-- KB documents: read-only for all authenticated users
ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can search KB"
  ON kb_documents FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage KB"
  ON kb_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- AI feedback: users insert their own
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own feedback"
  ON ai_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all feedback"
  ON ai_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );
```

---

## 6. Cost Analysis

### 6.1 Development Costs

| Component | Estimated Hours | Hourly Rate (USD) | Total |
|-----------|----------------|-------------------|-------|
| AI Chat Widget (full) | 80 | $75 | $6,000 |
| Knowledge Base (RAG) | 60 | $75 | $4,500 |
| Product Recommendations | 40 | $75 | $3,000 |
| Admin AI Dashboard | 50 | $75 | $3,750 |
| Human Handoff System | 30 | $75 | $2,250 |
| Feedback Loop | 25 | $75 | $1,875 |
| Integration Testing | 25 | $75 | $1,875 |
| Security Review | 15 | $75 | $1,125 |
| **Total Development** | **325 hrs** | - | **$24,375** |

### 6.2 Monthly Operational Costs

| Service | Tier | Monthly Cost | Notes |
|---------|------|-------------|-------|
| **OpenAI API** | Pay-as-you-go | $5-25/mo | GPT-4o-mini: $0.15/M input, $0.60/M output |
| **OpenAI Embeddings** | text-embedding-3-small | $1-3/mo | $0.02/M tokens |
| **Supabase** | Free tier | $0 | 500MB DB, pgvector included |
| **Vercel** | Free tier | $0 | 100GB bandwidth |
| **Total Operational** | - | **$6-28/mo** | Scalable with usage |

### 6.3 Usage Projections

| Usage Level | Daily AI Requests | Daily Tokens | Monthly Cost |
|-------------|-------------------|--------------|--------------|
| **Startup** (0-100 users/mo) | 20-50 | 15K-40K | $5-10 |
| **Growth** (100-500 users/mo) | 50-200 | 40K-160K | $10-25 |
| **Scale** (500-2000 users/mo) | 200-800 | 160K-640K | $25-100 |
| **Enterprise** (2000+ users/mo) | 800+ | 640K+ | $100+ |

### 6.4 Cost Optimization Strategies

| Strategy | Impact | Implementation |
|----------|--------|----------------|
| **Response Caching** | 30-40% cost reduction | Cache identical queries for 5-10 min |
| **Model Routing** | 50% cost reduction | Use gpt-4o-mini for simple tasks, gpt-4o only for complex |
| **Prompt Caching** | 10-20% cost reduction | Cache system prompts server-side |
| **Batch Embeddings** | 20% cost reduction | Use batch embedding API for indexing |
| **Local Fallbacks** | 100% cost avoidance | Rule-based responses for common queries |

---

## 7. Risk Assessment & Mitigation

### 7.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **AI hallucination** | Medium | High | RAG grounding, confidence thresholds, "I don't know" fallback |
| **Prompt injection** | Medium | High | Input sanitization, system prompt hardening, output validation |
| **High latency** | Medium | Medium | Response streaming, caching, model selection |
| **Knowledge base staleness** | Low | Medium | Webhook-triggered re-indexing, nightly full rebuilds |
| **API rate limits** | Low | Medium | Token bucket rate limiting, graceful degradation |
| **Vector search accuracy** | Medium | Medium | Hybrid search (vector + FTS), relevance threshold tuning |

### 7.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Low user adoption** | Medium | High | Progressive disclosure, contextual suggestions, not forced |
| **AI provides wrong pricing** | Low | Critical | Never include pricing in AI responses; always redirect to sales |
| **Competitor copies approach** | High | Low | Continuous improvement, feedback loop, unique KB content |
| **GDPR/data privacy** | Low | High | PII stripping, zero data retention API, user consent |
| **Cost overrun** | Low | Medium | Usage alerts, monthly caps, budget dashboard |

### 7.3 Security Mitigations

| Threat | Protection | Implementation |
|--------|------------|----------------|
| **Prompt injection** | Multi-layer defense | Input sanitization → system prompt hardening → output validation |
| **Data leakage** | PII stripping | Strip emails, phones, IPs before sending to AI APIs |
| **Abuse/overuse** | Rate limiting | Per-user + per-IP + global caps |
| **Sensitive data in logs** | Log redaction | Never log full prompts/responses; only metadata |
| **Cross-session data leak** | Session isolation | Separate chat sessions; no cross-user context sharing |

---

## 8. Implementation Roadmap

### 8.1 Phase 1: Foundation (Weeks 1-4)

#### Week 1: Infrastructure
| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Database schema migrations | `005_ai_hub.sql` |
| 1 | pgvector extension setup | Vector search capability |
| 2 | AI context manager | `src/lib/ai/context-manager.ts` |
| 2 | Model router | `src/lib/ai/model-router.ts` |
| 3 | Rate limiter (unified) | `src/lib/ai/rate-limit.ts` |
| 3 | Input sanitizer (shared) | `src/lib/ai/sanitize.ts` |
| 4 | Embedding service | `src/lib/ai/knowledge-base/embeddings.ts` |
| 4 | KB indexing pipeline | `src/lib/ai/knowledge-base/indexer.ts` |
| 5 | Sanity webhook for KB sync | Real-time content indexing |
| 5 | Unit tests | Rate limit, sanitizer, embedding tests |

#### Week 2: Knowledge Base
| Day | Task | Deliverable |
|-----|------|-------------|
| 6 | KB retrieval service | `src/lib/ai/knowledge-base/retrieval.ts` |
| 6 | Hybrid search (vector + FTS) | Reciprocal rank fusion |
| 7 | Sanity content indexing | Products, solutions indexed |
| 7 | Case study indexing | Historical case studies indexed |
| 8 | Blog post indexing | All blog content indexed |
| 8 | FAQ entries indexing | FAQ content indexed |
| 9 | KB search API | `POST /api/ai/knowledge/search` |
| 9 | Initial product embeddings | All products embedded |
| 10 | KB search testing + tuning | Relevance threshold calibration |

#### Week 3: AI Chat Widget
| Day | Task | Deliverable |
|-----|------|-------------|
| 11 | Chat API route (SSE streaming) | `POST /api/ai/chat` |
| 11 | System prompt with KB context | RAG-grounded prompts |
| 12 | ChatWidget container component | FAB + drawer UI |
| 12 | ChatMessage component | Message bubbles |
| 13 | ChatInput component | Input + file upload |
| 13 | useChat hook (state management) | Chat state management |
| 14 | useStreamResponse hook (SSE) | Real-time streaming |
| 14 | ChatSuggestions component | Pre-built suggestion chips |
| 15 | Context-aware suggestions | Page-based suggestion adaptation |
| 15 | ChatWidget integration in layout | Available on all pages |

#### Week 4: Handoff + Smart Forms Integration
| Day | Task | Deliverable |
|-----|------|-------------|
| 16 | Chat-to-ticket conversion | `src/lib/ai/handoff/chat-to-ticket.ts` |
| 16 | Chat-to-contact conversion | Sales lead handoff |
| 17 | Smart Forms refactoring | Move into AI Hub structure |
| 17 | Smart Form analysis API | `POST /api/ai/forms/analyze` |
| 18 | Smart Form followup API | `POST /api/ai/forms/followup` |
| 18 | Smart Form validation API | `POST /api/ai/forms/validate` |
| 19 | Smart Form lead scoring API | `POST /api/ai/forms/score` |
| 19 | Lead score Odoo integration | Score pushed to CRM |
| 20 | E2E testing (Playwright) | Critical user flows tested |
| 20 | Staging deployment | Phase 1 preview |

### 8.2 Phase 2: Intelligence (Weeks 5-7)

#### Week 5: Product Recommendations
| Day | Task | Deliverable |
|-----|------|-------------|
| 21 | Product embedding generation | All products with embeddings |
| 21 | Recommendation API | `POST /api/ai/products/recommend` |
| 22 | Product recommendation UI | Sidebar + inline suggestions |
| 22 | Context-aware recommendations | Page-based product matching |
| 23 | "People also viewed" logic | Collaborative filtering |
| 23 | Recommendation tracking | Track impressions + clicks |
| 24 | FAQ auto-generation | AI-generated FAQ from KB gaps |
| 24 | FAQ display component | FAQ section on product pages |
| 25 | Follow-up question generation | Smart form enhancements |
| 25 | Unit + integration tests | Recommendation tests |

#### Week 6: Analytics & Insights
| Day | Task | Deliverable |
|-----|------|-------------|
| 26 | AI usage tracking table | Usage log + daily aggregation |
| 26 | Cost tracking dashboard | Admin cost visibility |
| 27 | AI insights generation | `GET /api/ai/insights/daily` |
| 27 | Trend alert system | Anomaly detection alerts |
| 28 | Forecast API | `GET /api/ai/insights/forecast` |
| 28 | Forecast chart component | Confidence band visualization |
| 29 | AI insights panel (admin) | Business insight display |
| 29 | Anomaly detection panel | Spike/pattern alerts |
| 30 | Knowledge gap analysis | "Questions AI can't answer" report |
| 30 | Analytics testing | Dashboard testing |

#### Week 7: Feedback Loop + Polish
| Day | Task | Deliverable |
|-----|------|-------------|
| 31 | Feedback collection UI | Helpful/not helpful buttons |
| 31 | Feedback API | `POST /api/ai/feedback` |
| 32 | Feedback analysis pipeline | Daily batch analysis |
| 32 | Prompt improvement suggestions | AI-assisted prompt tuning |
| 33 | KnowledgeResult component | KB source cards in chat |
| 33 | Article viewer component | Full article view in chat |
| 34 | Mobile responsive testing | Chat widget mobile UX |
| 34 | Accessibility audit | WCAG 2.1 AA compliance |
| 35 | Performance optimization | Caching, lazy loading |
| 35 | Staging deployment | Phase 2 preview |

### 8.3 Phase 3: Advanced (Weeks 8-10)

#### Week 8: Conversation History + Personalization
| Day | Task | Deliverable |
|-----|------|-------------|
| 36 | Chat history persistence | Store messages in Supabase |
| 36 | Chat history sidebar | "Previous conversations" list |
| 37 | Conversation resumption | Continue old chats |
| 37 | User preference learning | Adapt to user patterns |
| 38 | Personalized recommendations | History-informed suggestions |
| 38 | Cross-session context | "You asked about X last time" |
| 39 | Export chat transcripts | Download conversation |
| 39 | Admin chat review tool | Review flagged conversations |
| 40 | Personalization testing | Cross-session flow testing |

#### Week 9: Custom Workflows + Content Generation
| Day | Task | Deliverable |
|-----|------|-------------|
| 41 | Prompt chain framework | Multi-step AI workflows |
| 41 | "Solution Architect" workflow | Multi-question solution builder |
| 42 | "VMware Migration Assessment" | Guided migration analysis |
| 42 | Blog draft generation | AI-assisted content creation |
| 43 | Email draft generation | AI-drafted follow-up emails |
| 43 | Case study outline generator | AI-structured case studies |
| 44 | Product description generator | New product copy drafts |
| 44 | Content review workflow | Admin approval before publish |
| 45 | Workflow testing | End-to-end workflow testing |

#### Week 10: A/B Testing + Launch
| Day | Task | Deliverable |
|-----|------|-------------|
| 46 | A/B test framework | Feature experimentation |
| 46 | Chat widget variant test | FAB placement testing |
| 47 | Form intelligence variant test | Auto-fill threshold testing |
| 47 | Conversion tracking | Chat → ticket/contact conversion |
| 48 | Final security review | Pen testing + code audit |
| 48 | Load testing | 100 concurrent AI sessions |
| 49 | Documentation | API docs, admin guide |
| 49 | Training materials | Support team training |
| 50 | Production deployment | Full AI Hub launch |
| 50 | Post-launch monitoring | Error tracking + metrics |

---

## 9. Competitive Advantage

### 9.1 Market Differentiation

| Feature | Typical B2B IT Sites | TGWS with AI Hub |
|---------|---------------------|-------------------|
| Product Discovery | Static pages, manual search | AI-powered semantic search + recommendations |
| Support Experience | Submit ticket, wait 24h | Instant AI answers + smart ticket routing |
| Pre-sales Engagement | Contact form → wait for callback | AI chat with product context + lead scoring |
| Content Discovery | Manual blog browsing | AI-powered content suggestions + summaries |
| Customer Intelligence | None | Real-time behavior analytics + sentiment tracking |
| Knowledge Management | Static FAQ pages | Living RAG knowledge base that grows with tickets |

### 9.2 ROI Projections

| Metric | Before AI Hub | After AI Hub (6 months) | Improvement |
|--------|---------------|-------------------------|-------------|
| Lead Response Time | 4-8 hours | 1-2 hours (AI triage) | 75% faster |
| Ticket First Response | 12-24 hours | 2-4 hours (AI auto-triage) | 80% faster |
| Pre-sales Engagement | 5% of visitors | 15% of visitors (AI chat) | 3x increase |
| Form Completion Rate | 60% | 80% (smart auto-fill) | 33% increase |
| Knowledge Reuse | 0% (no KB) | 40% (AI suggests KB articles) | From zero |
| Customer Satisfaction | 3.8/5 | 4.3/5 (projected) | 13% increase |

### 9.3 SEO Benefits

| SEO Factor | AI Hub Impact |
|------------|---------------|
| **Content Depth** | AI-generated FAQ sections on product pages |
| **Engagement Time** | AI chat keeps users engaged longer |
| **Bounce Rate** | AI recommendations reduce single-page visits |
| **Structured Data** | AI-generated FAQ schema markup |
| **Content Freshness** | Auto-generated content keeps pages updated |

---

## 10. Success Metrics

### 10.1 Key Performance Indicators

| Category | Metric | Target | Measurement Method |
|----------|--------|--------|--------------------|
| **Adoption** | Chat widget usage rate | >15% of visitors | Chat open / page views |
| **Adoption** | AI suggestion acceptance rate | >60% | Suggestions accepted / shown |
| **Accuracy** | AI classification accuracy | >85% | AI category vs actual |
| **Accuracy** | KB retrieval relevance | >80% | User feedback scores |
| **Efficiency** | Ticket triage time reduction | >50% | Avg triage time before/after |
| **Efficiency** | First response time reduction | >40% | Avg first response before/after |
| **Revenue** | AI-assisted lead conversion | >10% | AI leads / AI interactions |
| **Revenue** | Chat-to-contact conversion | >5% | Contact forms from chat |
| **Cost** | Monthly AI API cost | <$50 | OpenAI billing dashboard |
| **Satisfaction** | AI response helpfulness | >80% | Feedback "helpful" rate |
| **Quality** | AI hallucination rate | <5% | Manual audit + feedback |

### 10.2 Monitoring Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  AI HUB HEALTH DASHBOARD                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  API Status: 🟢 All Systems Operational                │
│  Current Cost: $12.40/mo (budget: $50)                 │
│  Active Sessions: 3                                     │
│  Today's Requests: 127 (avg: 95)                       │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Chat     │ │ Forms    │ │ KB       │ │ Products │  │
│  │ 89 req   │ │ 23 req   │ │ 15 req   │ │ N/A      │  │
│  │ 92%      │ │ 87%      │ │ 78%      │ │          │  │
│  │ helpful  │ │ accurate │ │ relevant │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ⚠️ Alerts: None                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 10.3 Rollout Strategy

| Stage | Audience | Duration | Success Criteria |
|-------|----------|----------|-----------------|
| **Internal Alpha** | TechGuru team only | 1 week | No critical bugs, basic accuracy |
| **Closed Beta** | 5-10 existing customers | 2 weeks | >70% helpfulness, <10% errors |
| **Open Beta** | All users (chat widget) | 2 weeks | >15% adoption, >75% helpfulness |
| **GA Launch** | All users, all features | Ongoing | All KPI targets met |

---

## 11. Open Questions & Decisions

| # | Question | Options | Recommendation | Owner |
|---|----------|---------|----------------|-------|
| 1 | Embedding model choice | text-embedding-3-small vs text-embedding-ada-002 | **3-small** (cheaper, same quality) | Tech Lead |
| 2 | Chat widget default state | Open vs collapsed | **Collapsed** (respect user space) | UX |
| 3 | AI identity in chat | Named character vs generic | **"TechGuru AI"** (branded) | Marketing |
| 4 | Knowledge base scope at launch | Full catalog vs curated subset | **Curated** (top products + FAQ) | Content |
| 5 | Admin access to AI features | All admins vs super_admin only | **All admins** (broader visibility) | Management |
| 6 | Chat history retention | 30 days vs 90 days vs indefinite | **90 days** (GDPR compliant) | Legal |
| 7 | Maximum concurrent AI sessions | Hard limit vs auto-scale | **50 concurrent** (cost control) | Tech Lead |
| 8 | AI response disclaimer | Required vs optional | **Required** ("AI-generated") | Legal |
| 9 | Fallback behavior when AI unavailable | Hide widget vs show offline message | **Show offline** ("AI is resting") | UX |
| 10 | Product recommendation placement | Chat only vs also in product pages | **Both** (maximize exposure) | Product |

---

## 12. Appendix

### 12.1 Glossary

| Term | Definition |
|------|------------|
| **RAG** | Retrieval-Augmented Generation — AI that retrieves relevant documents before generating responses |
| **pgvector** | PostgreSQL extension for vector similarity search |
| **Embedding** | Numerical vector representation of text for semantic search |
| **Hybrid Search** | Combining vector similarity + full-text search for better results |
| **RRF** | Reciprocal Rank Fusion — method to combine multiple search result rankings |
| **SSE** | Server-Sent Events — streaming protocol for real-time AI responses |
| **FAB** | Floating Action Button — persistent UI element for chat access |
| **HNSW** | Hierarchical Navigable Small World — fast approximate nearest neighbor algorithm |

### 12.2 Dependencies

| Dependency | Version | Purpose | Free Tier |
|------------|---------|---------|-----------|
| openai | ^4.x | GPT-4o-mini, embeddings | Pay-per-use |
| @supabase/supabase-js | ^2.x | Database, auth, vectors | 500MB free |
| @supabase/pgvector | latest | Vector search | Included with Supabase |
| recharts | ^2.x | Dashboard charts | Free |
| @react-pdf/renderer | ^3.x | PDF report generation | Free |
| next-intl | ^3.x | i18n (existing) | Free |

### 12.3 Environment Variables

```env
# AI Hub Configuration
OPENAI_API_KEY=sk-...              # OpenAI API key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_COMPLEX_MODEL=gpt-4o

# Rate Limiting
AI_RATE_LIMIT_ANALYZE=30           # Per user per hour
AI_RATE_LIMIT_CHAT=50              # Per user per hour
AI_RATE_LIMIT_KB_SEARCH=100        # Per user per hour

# Knowledge Base
KB_MIN_RELEVANCE=0.7               # Minimum relevance threshold
KB_MAX_RESULTS=5                   # Max search results
KB_CHUNK_SIZE=500                  # Text chunk size for embedding

# Cost Control
AI_MONTHLY_BUDGET_USD=50           # Monthly budget cap
AI_DAILY_TOKEN_LIMIT=1000000       # Daily token limit

# Feature Flags
AI_CHAT_ENABLED=true
AI_SMART_FORMS_ENABLED=true
AI_KB_ENABLED=true
AI_RECOMMENDATIONS_ENABLED=true
AI_ADMIN_DASHBOARD_ENABLED=true
```
