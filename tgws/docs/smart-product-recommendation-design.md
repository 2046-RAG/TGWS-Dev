# Smart Product Recommendation Feature — Technical Design

> **Feature ID**: S23  
> **Status**: Design  
> **PRD Section**: New — extends [S3] Product Categorization and [S16] VMware Alternative  
> **Dependencies**: Sanity CMS, Supabase (sessions), OpenAI GPT-4o-mini, Next.js App Router

---

## 1. Feature Overview

### 1.1 Purpose

TGWS offers 21 products across Build/Run/Protect categories, 6 industry verticals, and VMware migration services. A visitor who doesn't know which product fits their needs currently has to browse the full catalog. The Smart Product Recommendation assistant converses with the visitor, understands their situation, and suggests the best-fit products with explanations.

### 1.2 How It Works

```
Visitor opens chat widget
    │
    ▼
Greeting + 3 quick-start options:
  1. "I need help choosing a product"
  2. "I'm migrating from VMware"
  3. "Compare products for me"
    │
    ▼
Conversational Q&A (2-5 turns)
    │
    ▼
AI generates recommendation with:
  • Product card(s) with rationale
  • Industry-specific context
  • CTA: "Talk to an expert" or "See details"
    │
    ▼
Optional: comparison table, migration plan, or direct to /contact
```

### 1.3 Key Principles

1. **Guided, not freeform** — The AI asks structured questions, not open-ended chat. Each question narrows the product set.
2. **Grounded in real products** — Every recommendation must reference an actual Sanity product slug. No hallucinated products.
3. **Transparent reasoning** — The AI explains *why* each product fits, not just *what* it is.
4. **Multilingual** — Full en/zh support, consistent with existing i18n architecture.
5. **Low latency** — Target <2s for first token, <8s for complete recommendation.

---

## 2. Product Knowledge Base

### 2.1 Product Taxonomy (from existing Sanity data)

The 21 products are already structured in Sanity. We extend the schema with recommendation-specific fields:

```typescript
// Sanity schema extension: productRecommendationFields
interface ProductRecommendationData {
  // Existing fields (already in Sanity)
  _id: string;
  title: string;
  slug: { current: string };
  category: 'build' | 'run' | 'protect';
  subcategory?: string;
  order: number;

  // NEW fields for recommendation engine
  recommendationProfile: {
    // Keywords the AI should match against (en/zh)
    keywords: string[];
    keywordsZh: string[];

    // Problem statements this product solves
    painPoints: string[];
    painPointsZh: string[];

    // Industries this product is strongest in
    targetIndustries: string[];  // 'healthcare' | 'finance' | ...

    // Company size fit
    companySize: ('startup' | 'smb' | 'enterprise')[];

    // Budget tier
    budgetTier: 'low' | 'medium' | 'high';

    // Technical prerequisites
    prerequisites: string[];
    prerequisitesZh: string[];

    // What this product replaces (for migration scenarios)
    replaces?: string[];  // e.g. ['VMware vSphere', 'VMware vSAN']

    // Priority score for tie-breaking (higher = recommend first)
    recommendationPriority: number;
  };
}
```

### 2.2 Product Knowledge Document (for AI context)

A pre-built markdown document stored at `src/lib/ai/product-knowledge.md` that gets injected into the AI system prompt. This is the single source of truth for what the AI knows about products.

```markdown
# TGWS Product Catalog — AI Reference

## Build Products (AI & Development)
| Slug | Name | Solves | Best For | Keywords |
|------|------|--------|----------|----------|
| aigc | AI Generated Content (AIGC) | Create content at scale | Marketing, media | video, image, text generation, deepfake, AI content |
| aigc-coding | AI Assisted Coding | Accelerate development | Development teams | copilot, code review, autocomplete, dev productivity |
| ai-agent | AI Agent Development | Automate workflows | Operations, support | chatbot, automation, RPA, intelligent agent |
| legacy-ai | Legacy System AI Augmentation | Modernize old systems | Enterprises with legacy IT | legacy modernization, mainframe, COBOL, AI overlay |

## Run Products (Infrastructure)
### Compute & Virtualization
| Slug | Name | Solves | Best For | Replaces |
|------|------|--------|----------|----------|
| vm-platform | Server Virtualization Platform | Consolidate servers | Any enterprise | VMware vSphere, Hyper-V |
| hci | Hyper-Converged Infrastructure | Simplify infrastructure | Mid-large enterprise | VMware vSAN, Nutanix (legacy) |
| cloud-migration | Cloud Migration | Move to cloud | Cost optimization | On-prem |
| cloud-repatriation | Cloud Repatriation | Return from cloud | Cost/compliance | Public cloud |
| hardware | Enterprise Storage Solutions | High-performance storage | Data-intensive | Legacy SAN |
| hosting | Managed Hosting Services | Outsource operations | SMB | Self-managed |
| bcdr | Business Continuity & Disaster Recovery | Protect uptime | Compliance-heavy | Manual DR |

### Networking
| Slug | Name | Solves | Best For |
|------|------|--------|----------|
| enterprise-routers | Enterprise Routers | Core routing | Large campus |
| core-switches | Core Switches | High-bandwidth backbone | Data center |
| access-switches | Access Switches | End-user connectivity | Office floors |
| aggregation-switches | Aggregation Switches | Layer 2/3 aggregation | Multi-floor |
| enterprise-wireless-ap | Enterprise Wireless AP | Indoor WiFi | Office |
| wireless-controllers | Wireless Controllers | Centralized WiFi mgmt | Multi-site |
| outdoor-wireless-ap | Outdoor Wireless AP | External coverage | Campus, yard |
| wifi67-ap | WiFi 6/7 AP | High-density WiFi | Modern office |

## Protect Products (Security)
| Slug | Name | Solves | Best For |
|------|------|--------|----------|
| ngfw | Next-Gen Firewall / IPS | Perimeter defense | All enterprises |
| waf | Web Application Firewall | App-layer protection | Web apps, APIs |
| edr | Endpoint Detection & Response | Endpoint security | All endpoints |
| ndr | Network Detection & Response | Network threat detection | Internal network |
| cloud-security | Cloud Security | Cloud workload protection | Cloud users |
| sdwan | SD-WAN & Load Balancing | WAN optimization | Multi-site |
| mdr | Managed Detection & Response | Outsourced SOC | SMB, no SOC team |
| incident-response | Incident Response | Breach handling | Post-incident |

## VMware Migration Products
| Current VMware Product | Recommended Alternative | Why |
|----------------------|----------------------|-----|
| vSphere | Proxmox VE | Open-source, familiar UI, lower cost |
| vSphere (enterprise) | Sangfor HCI | Enterprise support, integrated stack |
| vSAN | Nutanix | Best hyper-converged, migration tools |
| NSX | H3C UniNetwork | SDN capability, competitive pricing |

## Industry Mappings
| Industry | Primary Needs | Top Products |
|----------|--------------|-------------|
| Healthcare | HIPAA compliance, patient data, uptime | ngfw, bcdr, cloud-security, edr |
| Finance | PCI-DSS, low latency, audit trails | ngfw, ndr, mdr, hcdr |
| Retail | E-commerce, peak scaling, customer data | waf, cloud-migration, sdwan |
| Logistics | Real-time tracking, warehouse IoT | enterprise-wireless-ap, sdwan, cloud-migration |
| Education | Campus WiFi, budget, student data | wifi67-ap, wireless-controllers, cloud-migration |
| Government | Compliance, sovereign data, air-gap | ngfw, ndr, incident-response, vm-platform |
```

### 2.3 Knowledge Base Maintenance

- **Source of truth**: Sanity CMS `product` documents
- **Sync mechanism**: A build-time script (`scripts/sync-product-knowledge.ts`) reads Sanity products and regenerates `product-knowledge.md`
- **Revalidation**: Sanity webhook triggers re-generation when a product is updated
- **Fallback**: If Sanity is unreachable, a stale cached version in `public/product-knowledge.md` is used

---

## 3. User Interaction Design

### 3.1 Entry Points

| Location | Trigger | Context Passed |
|----------|---------|---------------|
| Global floating button (bottom-right) | Click | None — fresh session |
| Products page — "Can't decide?" banner | Click | Pre-selected category |
| VMware Alternative page — "Get migration plan" | Click | Pre-filled VMware context |
| Solutions page — industry tab CTA | Click | Pre-selected industry |
| Contact page — "Let AI help first" link | Click | None |

### 3.2 Conversation Flow

**Phase 1: Greeting + Triage (1 turn)**

```
AI: Welcome to TechGuru! I can help you find the right solution.
    What brings you here today?

    [Choose a product]  [Migrating from VMware]  [Compare products]
```

**Phase 2: Needs Discovery (2-4 turns)**

The AI asks ONE question per turn, chosen from a priority queue:

| Question ID | Question | Type | Options |
|-------------|----------|------|---------|
| Q1 | What industry are you in? | Single-select | healthcare, finance, retail, logistics, education, government, other |
| Q2 | What's your main challenge? | Multi-select | security, cost, performance, compliance, modernization, scaling |
| Q3 | How many servers/endpoints? | Single-select | <10, 10-50, 50-200, 200+ |
| Q4 | What's your current setup? | Free text | (parsed by AI for keywords) |
| Q5 | What's your budget range? | Single-select | limited, moderate, flexible |
| Q6 | Any compliance requirements? | Multi-select | hipaa, pci, soc2, iso27001, gdpr, none |

**Skip logic**: If VMware context is pre-filled, skip Q4 and go directly to VMware-specific flow.

**Phase 3: Recommendation (1 turn)**

```
AI: Based on your needs, here are my top recommendations:

    ┌─────────────────────────────────────────┐
    │ 1. Next-Gen Firewall / IPS              │
    │    Why: Healthcare + HIPAA = perimeter   │
    │    defense is critical. Our NGFW gives   │
    │    you Layer 7 inspection + IPS in one.  │
    │    [See details] [Talk to expert]        │
    └─────────────────────────────────────────┘

    ┌─────────────────────────────────────────┐
    │ 2. Business Continuity & DR             │
    │    Why: Healthcare uptime is non-        │
    │    negotiable. BCDR ensures 99.99%       │
    │    availability with automated failover. │
    │    [See details] [Talk to expert]        │
    └─────────────────────────────────────────┘

    Would you like me to compare these, or learn more about either?
    [Compare]  [More options]  [Talk to expert]
```

**Phase 4: Follow-up (0-2 turns)**

- "Compare" → generates side-by-side comparison table
- "More options" → shows 1-2 additional products
- "Talk to expert" → deep link to `/contact` with pre-filled form
- "How about VMware?" → triggers VMware migration flow

### 3.3 Quick-Action Chips

After each AI response, contextual chips appear below the message:

| Context | Chips |
|---------|-------|
| After recommendation | `[Compare]` `[See details]` `[Talk to expert]` |
| After VMware mention | `[Migration plan]` `[Cost savings]` `[Compare alternatives]` |
| After comparison | `[Export PDF]` `[Talk to expert]` `[Start migration]` |
| Any time | `[Start over]` `[Browse products]` |

---

## 4. Recommendation Logic

### 4.1 Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend   │────▶│  API Route       │────▶│  GPT-4o-mini │
│  (React)     │◀────│  /api/recommend  │◀────│  (LLM)      │
└──────────────┘     └──────────────────┘     └─────────────┘
       │                      │
       │                      ▼
       │              ┌──────────────────┐
       │              │  Product Knowledge│
       │              │  (markdown doc)   │
       │              └──────────────────┘
       │
       ▼
  ┌──────────────┐
  │  Supabase    │
  │  (sessions)  │
  └──────────────┘
```

### 4.2 AI Prompt Structure

```typescript
const SYSTEM_PROMPT = `You are TechGuru's product recommendation assistant.

## Your Role
Help visitors find the right TGWS product for their needs. Be concise, helpful, and professional.

## Rules
1. ONLY recommend products that exist in the product catalog below.
2. ALWAYS explain WHY a product fits their specific situation.
3. Ask ONE question at a time to narrow down needs.
4. Maximum 4 questions before giving a recommendation.
5. For VMware migration questions, use the VMware Migration Guide.
6. Respond in the same language the user writes in.
7. If unsure, say "I'd recommend talking to our expert" rather than guessing.
8. Never invent product features or pricing.

## Output Format
When recommending products, use this exact JSON structure:
\`\`\`json
{
  "message": "Your conversational response",
  "recommendations": [
    {
      "productSlug": "slug-from-catalog",
      "productName": "Product Name",
      "reason": "Why this product fits their specific needs (2-3 sentences)",
      "confidence": 0.95,
      "category": "build|run|protect"
    }
  ],
  "nextAction": "ask_question|compare|contact|done",
  "question": { "id": "Q2", "text": "...", "type": "multi-select", "options": [...] },
  "chips": ["Compare", "Talk to expert"]
}
\`\`\`

## Product Catalog
${PRODUCT_KNOWLEDGE}

## VMware Migration Guide
${VMWARE_KNOWLEDGE}`;
```

### 4.3 Scoring Algorithm (Pre-filter)

Before sending to the AI, a server-side pre-filter narrows the 21 products to the top 8 candidates:

```typescript
function preFilterProducts(
  userContext: UserContext,
  allProducts: ProductRecommendationData[]
): ProductRecommendationData[] {
  return allProducts
    .map(product => {
      let score = 0;

      // Industry match (highest weight)
      if (userContext.industry &&
          product.recommendationProfile.targetIndustries.includes(userContext.industry)) {
        score += 40;
      }

      // Pain point match
      if (userContext.painPoints) {
        const matchedPains = userContext.painPoints.filter(
          p => product.recommendationProfile.painPoints.includes(p)
        );
        score += matchedPains.length * 15;
      }

      // Company size match
      if (userContext.companySize &&
          product.recommendationProfile.companySize.includes(userContext.companySize)) {
        score += 10;
      }

      // Budget match
      if (userContext.budget === product.recommendationProfile.budgetTier) {
        score += 10;
      }

      // Compliance match
      if (userContext.compliance) {
        const prereqMatch = userContext.compliance.filter(
          c => product.recommendationProfile.prerequisites.some(p =>
            p.toLowerCase().includes(c.toLowerCase())
          )
        );
        score += prereqMatch.length * 20;
      }

      // VMware replacement match
      if (userContext.currentVendor) {
        const replaces = product.recommendationProfile.replaces || [];
        if (replaces.some(r => r.toLowerCase().includes(userContext.currentVendor.toLowerCase()))) {
          score += 50;
        }
      }

      // Base priority
      score += product.recommendationProfile.recommendationPriority;

      return { ...product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
```

### 4.4 Confidence Calibration

The AI returns a confidence score (0-1) per recommendation. We post-process:

```typescript
function calibrateConfidence(
  aiConfidence: number,
  preFilterScore: number,
  userProfileCompleteness: number
): number {
  // Blend AI judgment with data-driven signals
  const weighted = (
    aiConfidence * 0.5 +
    (preFilterScore / 100) * 0.3 +
    userProfileCompleteness * 0.2
  );
  return Math.round(weighted * 100) / 100;
}
```

---

## 5. VMware Migration Flow

### 5.1 Specific Flow

When the user selects "Migrating from VMware" or mentions VMware products:

```
Turn 1: AI asks "Which VMware product are you looking to replace?"
        [vSphere]  [vSAN]  [NSX]  [VMware Cloud]  [Not sure]

Turn 2: AI asks "What's driving the migration?"
        [Cost]  [Licensing concerns]  [Better alternatives]  [All of the above]

Turn 3: AI asks "How many VMs/servers do you manage?"
        [1-10]  [10-50]  [50-200]  [200+]

Turn 4: Recommendation with migration plan
```

### 5.2 Migration Recommendation Template

```typescript
interface VMwareMigrationRecommendation {
  currentProduct: string;          // "VMware vSphere 8.0"
  alternative: string;             // "Proxmox VE"
  alternativeSlug: string;         // "server-virtualization-platform"
  whySwitch: string;               // "Cost savings of 60-80% with comparable features"
  migrationDifficulty: 'easy' | 'moderate' | 'complex';
  estimatedDowntime: string;       // "2-4 hours per host"
  keyConsiderations: string[];     // ["No native VMware migration tool", ...]
  costComparison: {
    vmware: { license: string; support: string; total: string };
    alternative: { license: string; support: string; total: string };
  };
  migrationSteps: string[];        // Step-by-step high-level plan
}
```

### 5.3 VMware Migration Knowledge

Stored in `src/lib/ai/vmware-knowledge.md`:

```markdown
# VMware Migration Guide

## Migration Paths
| From | To | Difficulty | Cost Savings | Notes |
|------|----|-----------|-------------|-------|
| vSphere | Proxmox VE | Easy | 60-80% | Open-source, similar UI concepts |
| vSphere | Sangfor HCI | Moderate | 40-60% | Enterprise support included |
| vSAN | Nutanix | Moderate | 30-50% | Built-in migration tools |
| NSX | H3C UniNetwork | Complex | 50-70% | SDN equivalent |
| VMware Cloud | Hybrid approach | Varies | 20-40% | Keep some cloud, move rest |

## Common Migration Concerns
1. **Data loss risk**: Always backup before migration. Test restore.
2. **Downtime planning**: Schedule maintenance windows. Use live migration where possible.
3. **Staff retraining**: Proxmox has steeper learning curve than vSphere for complex features.
4. **Support coverage**: Evaluate 24/7 support needs before choosing open-source options.
```

---

## 6. Comparison Generator

### 6.1 When It Triggers

- User clicks "Compare" chip after receiving recommendations
- User explicitly asks "Compare X and Y"
- AI determines a comparison would help (e.g., two close-scored products)

### 6.2 Comparison Table Structure

```typescript
interface ComparisonTable {
  products: Array<{
    slug: string;
    name: string;
    category: string;
  }>;
  dimensions: Array<{
    label: string;           // "Deployment Complexity"
    labelZh: string;
    values: string[];        // One per product
    winner?: number;         // Index of best option (-1 if tie)
  }>;
  summary: string;           // AI-generated one-line recommendation
}

// Pre-defined comparison dimensions
const COMPARISON_DIMENSIONS = [
  'deployment_complexity',
  'cost_range',
  'scalability',
  'vendor_support',
  'learning_curve',
  'integration_ecosystem',
  'compliance_ready',
  'migration_from_vmware',
];
```

### 6.3 Comparison Generation Prompt

```
Given these products: [product1, product2], generate a comparison table.

Product details:
{product_knowledge_for_both_products}

Return JSON:
{
  "dimensions": [...],
  "summary": "For a healthcare company with 50 servers, Product A is recommended because...",
  "winner": "product-slug"
}
```

---

## 7. API Design

### 7.1 Endpoints

#### `POST /api/recommend`

Main recommendation endpoint. Stateless — session state managed client-side.

```typescript
// Request
interface RecommendRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  context?: {
    preselectedCategory?: string;    // From products page
    preselectedIndustry?: string;    // From solutions page
    preselectedVMware?: string;      // From vmware page
    locale: 'en' | 'zh';
  };
  action?: 'compare';                // Trigger comparison mode
  compareProducts?: string[];        // Slugs to compare
}

// Response
interface RecommendResponse {
  message: string;
  recommendations: Array<{
    productSlug: string;
    productName: string;
    reason: string;
    confidence: number;
    category: 'build' | 'run' | 'protect';
    productUrl: string;               // /en/products#slug
    contactUrl: string;               // /en/contact?product=slug
  }>;
  nextAction: 'ask_question' | 'compare' | 'contact' | 'done';
  question?: {
    id: string;
    text: string;
    type: 'single-select' | 'multi-select' | 'free-text';
    options?: Array<{ label: string; value: string }>;
  };
  chips?: string[];
  comparison?: ComparisonTable;       // Only when nextAction === 'compare'
}
```

#### `GET /api/recommend/session/:sessionId`

Retrieve conversation history for resume.

```typescript
// Response
interface SessionResponse {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  userProfile: UserContext;
  createdAt: string;
  expiresAt: string;
}
```

#### `POST /api/recommend/feedback`

Collect user feedback on recommendations.

```typescript
// Request
interface FeedbackRequest {
  sessionId: string;
  productSlug: string;
  action: 'clicked' | 'contacted' | 'dismissed' | 'helpful' | 'not_helpful';
  comment?: string;
}
```

### 7.2 Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Anonymous | 20 requests | 1 hour |
| Authenticated | 50 requests | 1 hour |

Implemented via Supabase RLS + edge middleware.

### 7.3 Cost Control

```typescript
// Token budget per recommendation session
const TOKEN_LIMITS = {
  input: 4000,        // ~3000 words system prompt + conversation
  output: 1000,       // ~750 words response
  maxTurns: 8,        // Max conversation turns per session
  model: 'gpt-4o-mini',
  estimatedCostPerSession: '$0.003-0.008',  // At current pricing
};
```

---

## 8. Frontend Component Design

### 8.1 Component Tree

```
RecommendationWidget (floating button + panel)
├── ChatPanel
│   ├── ChatHeader (title, minimize, close)
│   ├── MessageList
│   │   ├── ChatMessage (AI/user bubbles)
│   │   │   ├── ProductCard (inline recommendation)
│   │   │   │   ├── ProductIcon
│   │   │   │   ├── ProductTitle
│   │   │   │   ├── RecommendationReason
│   │   │   │   └── ActionButtons (details, compare, contact)
│   │   │   └── QuickReplyChips
│   │   └── ThinkingIndicator (typing animation)
│   └── ChatInput
│       ├── TextInput
│       └── QuickSelectButtons (for structured questions)
├── ComparisonPanel (slides in from right)
│   ├── ComparisonHeader
│   ├── ComparisonTable
│   └── ComparisonSummary
└── FeedbackWidget (post-recommendation)
```

### 8.2 File Structure

```
src/components/recommendation/
├── RecommendationWidget.tsx      # Main entry — floating button + panel toggle
├── ChatPanel.tsx                 # Chat container with message list
├── ChatMessage.tsx               # Single message bubble (AI or user)
├── ProductRecommendationCard.tsx  # Inline product card within AI message
├── QuickReplyChips.tsx           # Action chips below messages
├── QuickSelectButtons.tsx        # Button grid for structured questions
├── ComparisonPanel.tsx           # Side-by-side comparison view
├── ComparisonTable.tsx           # The actual comparison grid
├── ThinkingIndicator.tsx         # Typing animation
├── FeedbackWidget.tsx            # Thumbs up/down + optional comment
├── useRecommendation.ts          # Custom hook — state, API calls, session
└── types.ts                      # Shared TypeScript types
```

### 8.3 Widget State Machine

```typescript
type WidgetState =
  | 'closed'        // Only floating button visible
  | 'opening'       // Panel sliding in
  | 'open'          // Chat panel active
  | 'comparing'     // Comparison panel overlay
  | 'minimized';    // Collapsed to small bar

type ChatState =
  | 'idle'          // Waiting for user input
  | 'thinking'      // AI is generating
  | 'awaiting_input' // Waiting for user to answer question
  | 'recommendation' // Recommendation displayed
  | 'error';        // Something went wrong
```

### 8.4 Responsive Behavior

| Breakpoint | Widget Behavior |
|------------|----------------|
| Desktop (>1024px) | Fixed bottom-right, 400px wide panel |
| Tablet (768-1024px) | Fixed bottom-right, 360px wide panel |
| Mobile (<768px) | Full-screen overlay |

### 8.5 Styling

Uses existing TGWS design tokens:

```css
/* Chat panel */
.widget-panel {
  @apply bg-white border border-gray-200 rounded-2xl shadow-2xl;
  @apply w-[400px] h-[600px] max-h-[80vh];
}

/* AI message bubble */
.message-ai {
  @apply bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm;
  @apply px-5 py-4 text-sm text-gray-700;
}

/* User message bubble */
.message-user {
  @apply bg-[#00D4FF] text-white rounded-2xl rounded-tr-sm;
  @apply px-5 py-4 text-sm;
}

/* Product recommendation card */
.rec-card {
  @apply bg-white border border-gray-200 rounded-xl p-4;
  @apply hover:border-[#00D4FF]/30 hover:shadow-md transition-all;
}

/* Quick reply chips */
.chip {
  @apply px-4 py-2 rounded-full border border-gray-200 text-sm;
  @apply hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all;
}

/* Floating button */
.widget-button {
  @apply w-14 h-14 rounded-full bg-[#00D4FF] text-white;
  @apply shadow-lg hover:shadow-xl hover:scale-105 transition-all;
}
```

---

## 9. Personalization

### 9.1 User Profile (built during conversation)

```typescript
interface UserContext {
  industry?: string;
  painPoints: string[];
  companySize?: 'startup' | 'smb' | 'enterprise' | 'large-enterprise';
  budget?: 'limited' | 'moderate' | 'flexible';
  compliance: string[];
  currentVendor?: string;          // e.g., 'VMware'
  currentProducts?: string[];      // e.g., ['vSphere', 'vSAN']
  techStack?: string[];            // e.g., ['Kubernetes', 'Docker']
  locale: 'en' | 'zh';
}
```

### 9.2 Personalization Strategies

| Signal | How Used | Example |
|--------|----------|---------|
| **Industry** | Filters target industries, adds compliance context | Healthcare → HIPAA-relevant products prioritized |
| **Pain points** | Maps to product painPoints field | "cost" → open-source alternatives ranked higher |
| **Company size** | Filters companySize compatibility | Startup → skip enterprise-only products |
| **Budget** | Adjusts recommendations | Limited → Proxmox over Nutanix |
| **Compliance** | Hard filter for must-have features | HIPAA → only HIPAA-ready products |
| **Current vendor** | Triggers migration-specific recommendations | VMware → migration alternatives |
| **Conversation path** | Adapts question priority | Quick answers → fewer questions |

### 9.3 Session Persistence

```typescript
// Supabase table: recommendation_sessions
interface RecommendationSession {
  id: string;                     // UUID
  user_id?: string;               // nullable for anonymous
  locale: 'en' | 'zh';
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  user_profile: UserContext;
  recommendations_made: string[]; // product slugs
  feedback?: Record<string, 'helpful' | 'not_helpful'>;
  created_at: string;
  updated_at: string;
  expires_at: string;             // Auto-delete after 30 days
}
```

### 9.4 Returning Visitor Recognition

- If user has Supabase Auth session → load their past recommendations
- If no auth → use localStorage session ID (30-day expiry)
- On return: "Welcome back! Last time we discussed [product]. Would you like to continue or start fresh?"

---

## 10. Success Metrics

### 10.1 Primary Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Recommendation CTR** | % of users who click a recommended product | >30% | Feedback API `clicked` events |
| **Expert CTA Rate** | % who click "Talk to expert" after recommendation | >15% | Feedback API + UTM tracking |
| **Conversation Completion** | % of sessions that reach a recommendation | >70% | Session logs |
| **Time to Recommendation** | Avg turns from start to first recommendation | <4 turns | Session logs |

### 10.2 Secondary Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Satisfaction Score** | Thumbs up / (thumbs up + thumbs down) | >80% | Feedback API |
| **Return Rate** | % of users who use widget again within 7 days | >10% | Session tracking |
| **VMware Migration Leads** | # of users who complete VMware flow → contact | >5/week | Contact form + UTM |
| **Comparison Usage** | % of sessions that use comparison feature | >20% | Session logs |

### 10.3 Business Impact Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| **Assisted Revenue** | Revenue from leads sourced by recommendation widget | Track | CRM attribution |
| **Support Ticket Deflection** | Reduction in "which product do I need" tickets | >20% | Supabase ticket category analysis |
| **Product Page Depth** | Avg pages viewed after clicking recommendation | >2 | Analytics |

### 10.4 Implementation

```typescript
// Analytics events to track
const TRACKED_EVENTS = {
  WIDGET_OPENED: 'recommendation_widget_opened',
  WIDGET_CLOSED: 'recommendation_widget_closed',
  MESSAGE_SENT: 'recommendation_message_sent',
  RECOMMENDATION_SHOWN: 'recommendation_shown',
  RECOMMENDATION_CLICKED: 'recommendation_clicked',
  COMPARISON_VIEWED: 'comparison_viewed',
  CONTACT_CTA_CLICKED: 'contact_cta_clicked',
  FEEDBACK_GIVEN: 'feedback_given',
  SESSION_COMPLETED: 'recommendation_session_completed',
  VMWARE_FLOW_STARTED: 'vmware_migration_flow_started',
  VMWARE_FLOW_COMPLETED: 'vmware_migration_flow_completed',
};
```

Dashboard: A simple admin page at `/admin/recommendations` showing:
- Daily session count
- Average turns per session
- Top recommended products
- CTR by product
- Satisfaction trend
- VMware migration funnel

---

## 11. Implementation Plan

### Phase 1: Core (Week 1-2)
- [ ] Extend Sanity schema with recommendationProfile fields
- [ ] Create product-knowledge.md and vmware-knowledge.md
- [ ] Build `/api/recommend` endpoint with GPT-4o-mini integration
- [ ] Implement pre-filter scoring algorithm
- [ ] Build RecommendationWidget, ChatPanel, ChatMessage components

### Phase 2: VMware Flow (Week 3)
- [ ] Implement VMware-specific conversation flow
- [ ] Build migration recommendation templates
- [ ] Add migration comparison generator
- [ ] Deep-link integration with existing `/vmware-alternative` page

### Phase 3: Comparison & Polish (Week 4)
- [ ] Build ComparisonPanel and ComparisonTable components
- [ ] Implement comparison generation endpoint
- [ ] Add responsive design (mobile full-screen)
- [ ] Session persistence in Supabase

### Phase 4: Analytics & Optimization (Week 5)
- [ ] Add analytics event tracking
- [ ] Build admin dashboard at `/admin/recommendations`
- [ ] A/B test greeting messages and question order
- [ ] Tune pre-filter scoring based on click-through data

### Phase 5: i18n & Hardening (Week 6)
- [ ] Full zh-TW translation of all widget text
- [ ] Rate limiting and abuse prevention
- [ ] Error boundaries and fallback states
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance audit (Lighthouse, Core Web Vitals)

---

## 12. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| AI returns no recommendations | "I'm not sure I have the right product for that. Let me connect you with an expert." → CTA to /contact |
| AI recommends a product not in catalog | Filtered out server-side. Log as data quality issue. |
| User asks something unrelated | "I specialize in helping you find TGWS products. For other questions, please contact us directly." |
| Rate limit exceeded | "I've had a lot of visitors today. Please try again in a few minutes or contact us directly." |
| Sanity product data stale | Use cached product-knowledge.md. Show banner "Product info may be slightly outdated." |
| GPT-4o-mini API failure | Retry once. If still failing: "I'm having trouble right now. Let me connect you with our team." |
| User writes in unsupported language | "I can help in English or Traditional Chinese. / 我可以協助您使用英語或繁體中文。" |
| Multiple products with same score | Recommend all with equal confidence. Let user compare. |

---

## 13. Security Considerations

Per PRD [S2.5]:

| Concern | Mitigation |
|---------|-----------|
| Prompt injection | User messages sanitized before sending to GPT. System prompt uses delimiters. Product catalog is server-side only. |
| Data leakage | AI never sees user email, phone, or auth tokens. Only sees conversation text + public product data. |
| Rate limiting | 20 req/hour anonymous, 50 authenticated. Implemented via Supabase + edge middleware. |
| Session data | Supabase RLS enforced. Sessions auto-expire after 30 days. No PII stored in session. |
| API key security | OpenAI API key server-side only. Never exposed to client. |
| XSS | All AI-generated HTML escaped. Markdown rendered via safe library only. |
| CSRF | API routes use Next.js built-in CSRF protection for POST endpoints. |

---

## 14. Dependencies

| Dependency | Version | Purpose | Free Tier |
|-----------|---------|---------|-----------|
| OpenAI API (GPT-4o-mini) | Latest | Recommendation AI | $5/month free credit |
| Framer Motion | ^11.x | Widget animations | Yes (already installed) |
| React Markdown | ^9.x | Render AI markdown safely | Yes |
| Supabase | ^2.x | Session storage | Yes (already integrated) |
| Sanity | ^6.x | Product data | Yes (already integrated) |

**No new paid services required** — OpenAI free tier covers estimated 500+ sessions/month.

---

## Appendix A: Sanity Schema Addition

```groovy
// sanity/schemas/product.ts — add to existing schema
{
  name: 'recommendationProfile',
  title: 'Recommendation Profile',
  type: 'object',
  fields: [
    { name: 'keywords', type: 'array', of: [{ type: 'string' }], title: 'Keywords (EN)' },
    { name: 'keywordsZh', type: 'array', of: [{ type: 'string' }], title: 'Keywords (ZH)' },
    { name: 'painPoints', type: 'array', of: [{ type: 'string' }], title: 'Pain Points (EN)' },
    { name: 'painPointsZh', type: 'array', of: [{ type: 'string' }], title: 'Pain Points (ZH)' },
    { name: 'targetIndustries', type: 'array', of: [{ type: 'string' }], title: 'Target Industries' },
    { name: 'companySize', type: 'array', of: [{ type: 'string' }], title: 'Company Size Fit' },
    { name: 'budgetTier', type: 'string', options: { list: ['low', 'medium', 'high'] }, title: 'Budget Tier' },
    { name: 'prerequisites', type: 'array', of: [{ type: 'string' }], title: 'Prerequisites (EN)' },
    { name: 'replaces', type: 'array', of: [{ type: 'string' }], title: 'Replaces (competitor products)' },
    { name: 'recommendationPriority', type: 'number', title: 'Recommendation Priority (1-100)', initialValue: 50 },
  ],
}
```

## Appendix B: Supabase Table Addition

```sql
CREATE TABLE recommendation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  locale TEXT NOT NULL DEFAULT 'en',
  messages JSONB NOT NULL DEFAULT '[]',
  user_profile JSONB NOT NULL DEFAULT '{}',
  recommendations_made TEXT[] DEFAULT '{}',
  feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- RLS policies
ALTER TABLE recommendation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON recommendation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON recommendation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own sessions"
  ON recommendation_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
  DELETE FROM recommendation_sessions WHERE expires_at < now();
$$ LANGUAGE sql;

-- Index for efficient lookups
CREATE INDEX idx_recommendation_sessions_user ON recommendation_sessions(user_id);
CREATE INDEX idx_recommendation_sessions_expires ON recommendation_sessions(expires_at);
```
