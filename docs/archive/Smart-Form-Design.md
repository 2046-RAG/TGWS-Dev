# Smart Form Feature - Technical Design Document

**Version:** 1.0
**Date:** 2026-07-05
**Status:** Draft
**PRD References:** [S6] Customer Ticket System, [S13] Contact Us, [S18] API Design
**Related:** Smart-Ticket-Assistant-Design.md (extends and supersedes ticket-only analysis)

---

## 1. Feature Overview

### 1.1 What Is Smart Form

Smart Form is an AI-powered intelligent form assistance layer that sits on top of the existing Contact Form and Ticket Form in the TGWS website. It transforms static form-filling into an interactive, guided experience by leveraging GPT-4o-mini for real-time analysis, auto-fill, validation, and lead prioritization.

### 1.2 Scope

| Form | Current Fields | Smart Form Enhancement |
|------|---------------|----------------------|
| **Contact** | Name, Email, Company, Phone, Message | Auto-detect intent, enrich company data, score lead priority, suggest relevant products/solutions |
| **Ticket** | Category, Product, OccurredAt, Subject, Description, Screenshots, Attachments | Auto-classify category/product, detect priority, suggest similar tickets, draft resolution steps, generate follow-up questions |

### 1.3 Core Capabilities

| Capability | Description |
|-----------|-------------|
| **Auto-fill Logic** | Predict and pre-populate form fields from user context (URL path, cookies, auth state, prior submissions) |
| **Requirement Analysis** | Real-time AI understanding of what the user actually needs, beyond what they type |
| **Smart Defaults** | Set intelligent default values (category, product, priority) based on contextual signals |
| **Validation Enhancement** | AI-powered semantic validation (not just format checks) — e.g., detecting vague descriptions |
| **Response Drafting** | Auto-generate clarifying questions when input is ambiguous; draft follow-up suggestions post-submission |
| **Lead Scoring** | Assign priority/score to contact submissions and tickets for CRM triage |
| **Similarity Detection** | Find related existing tickets or past contact submissions to reduce redundancy |
| **Sentiment Detection** | Infer customer frustration level for escalation awareness |

### 1.4 Value Proposition

| Metric | Without Smart Form | With Smart Form | Improvement |
|--------|-------------------|-----------------|-------------|
| Form completion time | 3-5 min | 1.5-3 min | ~40% faster |
| Ticket misclassification rate | ~35% | ~10% | 70% reduction |
| Duplicate ticket rate | ~15% | ~5% | 67% reduction |
| Lead response time | 4-8 hours | 1-2 hours | 75% faster |
| First-contact resolution | ~30% | ~50% | 67% improvement |
| Customer satisfaction | 3.8/5 | 4.5/5 | 18% increase |

### 1.5 Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| AI Model | GPT-4o-mini | Cost-effective ($0.15/M input, $0.60/M output), fast inference, good at structured extraction |
| API Layer | Next.js Route Handlers | Existing pattern, no new infrastructure |
| Client Hooks | Custom React hooks with debounce | Matches existing `useAutoSave` pattern |
| Rate Limiting | In-memory + Supabase | Tiered per user role |
| Caching | React Query + localStorage | Reduces redundant API calls |
| Storage | Supabase (existing) | AI analysis metadata, usage logs |

---

## 2. Auto-fill Logic

### 2.1 Data Sources for Auto-fill

The system draws from multiple context signals to predict form field values:

| Source | Data Available | Fields Enriched |
|--------|---------------|-----------------|
| **URL Path** | Page the user navigated from (`/products/build`, `/vmware-alternative`) | Category, Product, Subject |
| **Auth State** | Logged-in user's company, phone, email from Supabase `users` table | Name, Email, Company, Phone |
| **Prior Submissions** | Previous tickets/contacts stored in `contact_submissions` + `tickets` | All fields (historical pattern) |
| **localStorage** | Auto-saved form drafts via existing `useAutoSave` hook | All fields (draft recovery) |
| **Product Page Context** | Product ID/slug from referring page (query params or sessionStorage) | Product/Service, Category |
| **Browser Headers** | Accept-Language, timezone (server-side only) | Language preference |

### 2.2 Auto-fill Priority Matrix

When multiple sources provide conflicting values, the system resolves conflicts by priority:

| Priority | Source | Rationale |
|----------|--------|-----------|
| 1 (Highest) | User's explicit input this session | User always wins |
| 2 | localStorage draft | User was actively working on this |
| 3 | Auth state (profile) | Known user data |
| 4 | Prior submissions | Historical pattern |
| 5 | URL/page context | Inferred from navigation |
| 6 (Lowest) | Smart defaults | AI-predicted fallback |

### 2.3 Auto-fill Implementation

#### 2.3.1 URL-Based Category Prediction

```
Navigation Path                      → Category      → Product
─────────────────────────────────────────────────────────────────
/products/build/*                    → build         → (from URL slug)
/products/run/*                      → run           → (from URL slug)
/products/protect/*                  → protect       → (from URL slug)
/vmware-alternative                  → run           → VMware Alternative
/solutions/healthcare                → (ask user)    → Healthcare Solutions
/case-studies/*                      → (ask user)    → (from case study)
/blog/*                              → (ask user)    → (from post tags)
```

#### 2.3.2 User Profile Auto-fill

When a logged-in user opens a form, the system fetches their profile and pre-fills:

```typescript
// Server-side: fetch user profile for auto-fill context
async function getAutoFillContext(userId: string) {
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, company, phone')
    .eq('id', userId)
    .single();

  // Fetch last 5 tickets for pattern detection
  const { data: recentTickets } = await supabase
    .from('tickets')
    .select('category, product_service, subject')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    profile,
    dominantCategory: computeMode(recentTickets?.map(t => t.category)),
    dominantProduct: computeMode(recentTickets?.map(t => t.product_service)),
  };
}
```

#### 2.3.3 Contact Form Auto-fill Strategy

For the Contact Form, auto-fill is simpler (no auth required):

| Field | Auto-fill Source | Method |
|-------|-----------------|--------|
| Name | localStorage draft | Direct |
| Email | localStorage draft | Direct |
| Company | localStorage draft | Direct |
| Phone | localStorage draft | Direct |
| Message | URL context keywords | AI-generated greeting template |

When user arrives from a product page, the message textarea can pre-fill with a contextual template:

```
"I'm interested in [Product Name] and would like to learn more about..."
```

#### 2.3.4 Ticket Form Auto-fill Strategy

| Field | Auto-fill Source | Method |
|-------|-----------------|--------|
| Category | URL path + user history | Rule-based + AI confirmation |
| Product | URL slug + Sanity product lookup | Direct mapping |
| Subject | Description (AI-generated from first 50 chars) | GPT-4o-mini |
| Description | URL context + prior similar tickets | Template suggestion |

### 2.4 Auto-fill Consent & Transparency

```typescript
// UI disclosure — shown once per session
interface AutoFillDisclosure {
  shown: boolean;
  accepted: boolean;
  timestamp: number;
}
```

- Show a one-time banner: "Smart Form can pre-fill fields based on your browsing context. [Accept] [Skip]"
- Store consent in localStorage
- Never auto-fill sensitive fields (password, payment) without explicit consent
- Allow user to clear all auto-filled values with one click

---

## 3. Requirement Analysis

### 3.1 What the AI Analyzes

The AI doesn't just validate — it **understands** what the user needs and provides guided assistance:

#### 3.1.1 Intent Classification

When the user types in any free-text field, the AI classifies their intent:

| Intent | Example Input | AI Action |
|--------|--------------|-----------|
| **Bug Report** | "Our server keeps crashing" | Suggest category=run, priority=high |
| **Feature Request** | "We need a dashboard for monitoring" | Suggest category=build, ask for requirements |
| **How-to Question** | "How do I configure the firewall?" | Suggest self-help resources first |
| **Urgent Issue** | "Production is down, need help now!" | Suggest category=protect, priority=critical, trigger escalation |
| **Sales Inquiry** | "Looking for a VMware replacement" | Redirect to sales flow, enrich lead score |
| **General Inquiry** | "What services do you offer?" | Suggest solutions page or contact sales |

#### 3.1.2 Contextual Understanding

The AI analyzes multiple inputs together, not in isolation:

```
Input Combination → Analysis Result
──────────────────────────────────────────────
message mentions "VMware" + category = run
  → Confidence boost for VMware-related products
  → Suggest specific VMware alternatives from catalog

message mentions "breach" + no category selected
  → Auto-suggest category = protect
  → Set priority = critical
  → Flag for immediate attention

message mentions "demo" + company field filled
  → Classify as sales lead
  → Increase lead score
  → Suggest scheduling a call
```

### 3.2 Analysis Pipeline

```
User Input (debounced 800ms)
    │
    ▼
┌─────────────────────────────────┐
│  1. Input Sanitization          │  Strip injection patterns, limit length
│     src/lib/ai/sanitize.ts     │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  2. Context Assembly            │  Combine: typed text + URL + profile + history
│     src/lib/ai/context.ts       │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  3. AI Analysis (GPT-4o-mini)  │  Structured output: intent, category, priority,
│     POST /api/smart-form        │  products, sentiment, confidence scores
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  4. Response Validation (Zod)   │  Ensure AI output matches expected schema
│     src/lib/ai/validate.ts      │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  5. Confidence Gating           │  Only show suggestions above threshold
│     Threshold: >= 0.7           │  Below threshold → "Need more details?"
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  6. UI Update                   │  Render suggestion panel with apply/edit options
│     SmartAssistant component    │
└─────────────────────────────────┘
```

### 3.3 Follow-up Question Generation

When the AI detects ambiguity, it generates targeted questions:

| Ambiguity Detected | Generated Question | Target Field |
|-------------------|-------------------|--------------|
| Vague description | "Can you describe the error message or behavior you're seeing?" | Description |
| Multiple products mentioned | "Which product is primarily affected?" | Product |
| No urgency indicators | "Is this affecting production systems or is it a non-urgent question?" | Priority (internal) |
| Missing environment info | "What operating system / browser / version are you using?" | Description (append) |
| Security keywords without detail | "Can you confirm: Is there evidence of unauthorized access?" | Category + Priority |
| Sales intent detected | "Would you like to schedule a demo or receive a quote?" | Message (redirect) |

**Question Generation Prompt:**

```typescript
const FOLLOWUP_PROMPT = `You are a smart form assistant for TechGuru IT support.

Based on the user's partial input, generate 1-3 targeted follow-up questions to gather the missing information needed to properly categorize and prioritize their request.

Rules:
- Questions must be specific and actionable
- Max 15 words per question
- Prioritize questions that affect category/priority classification
- Don't ask for information already provided
- If user input is clear enough, return empty array
- Match the language of the user's input (English or Traditional Chinese)

Return JSON: { "questions": string[], "missingInfo": string[] }`;
```

---

## 4. Smart Defaults

### 4.1 Default Value Strategy

Smart defaults are pre-set values that appear **before** the user types anything. They are based on statistical patterns and contextual signals:

#### 4.1.1 Ticket Form Defaults

| Field | Default Value Source | Fallback Default |
|-------|---------------------|-----------------|
| Category | URL path → product category mapping | Empty (require selection) |
| Product | URL slug → Sanity product lookup | Empty (require selection) |
| OccurredAt | Current date/time (already implemented) | Current date/time |
| Subject | AI-generated from first 50 chars of description | Empty |
| Priority | Not user-visible; set by AI analysis | `medium` |

#### 4.1.2 Contact Form Defaults

| Field | Default Value Source | Fallback Default |
|-------|---------------------|-----------------|
| Name | Auth profile → full_name | Empty |
| Email | Auth profile → email | Empty |
| Company | Auth profile → company | Empty |
| Phone | Auth profile → phone | Empty |
| Message | Contextual template from referrer page | Empty |

### 4.2 Smart Default Computation

#### 4.2.1 Category Detection Algorithm

```typescript
function detectCategory(context: FormContext): string | null {
  const signals: Array<{ category: string; weight: number }> = [];

  // Signal 1: URL path (weight: 0.4)
  if (context.urlPath) {
    const urlCategory = mapUrlToCategory(context.urlPath);
    if (urlCategory) signals.push({ category: urlCategory, weight: 0.4 });
  }

  // Signal 2: User history (weight: 0.3)
  if (context.userHistory?.dominantCategory) {
    signals.push({ category: context.userHistory.dominantCategory, weight: 0.3 });
  }

  // Signal 3: Page metadata (weight: 0.2)
  if (context.pageProduct?.category) {
    signals.push({ category: context.pageProduct.category, weight: 0.2 });
  }

  // Signal 4: Time of day heuristic (weight: 0.1)
  // Business hours (9-18 HKT) → more likely support; after hours → more likely urgent
  const hour = new Date().getUTCHours() + 8; // HKT
  if (hour < 9 || hour > 18) {
    signals.push({ category: 'protect', weight: 0.1 }); // After hours = security/incident
  }

  // Aggregate and return highest confidence
  const scores = aggregateByCategory(signals);
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return best && best[1] >= 0.5 ? best[0] : null;
}
```

#### 4.2.2 Product Suggestion Algorithm

```typescript
function suggestProducts(context: FormContext, category: string): ProductSuggestion[] {
  const suggestions: ProductSuggestion[] = [];

  // 1. Direct URL mapping (highest confidence)
  if (context.urlProduct) {
    suggestions.push({
      product: context.urlProduct,
      confidence: 0.95,
      source: 'url',
    });
  }

  // 2. User's historical product usage
  if (context.userHistory?.recentProducts) {
    for (const product of context.userHistory.recentProducts) {
      if (!suggestions.find(s => s.product === product)) {
        suggestions.push({ product, confidence: 0.7, source: 'history' });
      }
    }
  }

  // 3. AI-suggested products (from description analysis)
  if (context.aiAnalysis?.suggestedProducts) {
    for (const aiProduct of context.aiAnalysis.suggestedProducts) {
      if (!suggestions.find(s => s.product === aiProduct.name)) {
        suggestions.push({
          product: aiProduct.name,
          confidence: aiProduct.confidence,
          source: 'ai',
        });
      }
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}
```

### 4.3 Default Application Rules

| Rule | Description |
|------|-------------|
| **Show, don't overwrite** | Pre-select defaults but make it visually clear they are AI-suggested, not user-chosen |
| **One-click clear** | User can clear all defaults with a single "Clear suggestions" button |
| **Confidence threshold** | Only auto-apply defaults with confidence >= 0.85; below that, show as suggestion |
| **User override wins** | If user explicitly selects a different value, never re-apply the default |
| **Session persistence** | Defaults reset on page refresh (don't persist across sessions) |

---

## 5. Validation Enhancement

### 5.1 Traditional vs AI-Powered Validation

| Aspect | Traditional (Current) | AI-Enhanced (Smart Form) |
|--------|----------------------|-------------------------|
| Email format | Regex check | Format + domain reputation check |
| Required fields | Empty check | Completeness + specificity check |
| Description length | Character count | Semantic quality score |
| Product selection | Required check | Relevance to described issue |
| Phone format | Regex check | International format + country detection |

### 5.2 AI Validation Rules

#### 5.2.1 Description Quality Scoring

```typescript
interface DescriptionQuality {
  score: number;           // 0-100
  issues: ValidationIssue[];
  suggestions: string[];
}

interface ValidationIssue {
  type: 'too_vague' | 'missing_details' | 'unclear_impact' | 'missing_steps' | 'language_mismatch';
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;            // Suggested fix
}
```

| Quality Check | Threshold | Issue Type | Severity |
|--------------|-----------|-----------|----------|
| Description < 30 chars | Below threshold | `too_vague` | warning |
| No technical terms detected | Score < 0.3 | `missing_details` | info |
| No impact/business context | Score < 0.4 | `unclear_impact` | info |
| No reproduction steps (for bugs) | Score < 0.5 | `missing_steps` | warning |
| Chinese content in English form | Detected | `language_mismatch` | info |

#### 5.2.2 Cross-Field Validation

The AI validates relationships between fields:

| Cross-Field Rule | Example | Issue |
|-----------------|---------|-------|
| Category-Product mismatch | Category=Build but Product=Firewall | "Firewall is a Protect product. Did you mean Protect?" |
| Category-Description mismatch | Category=Build but description mentions "server crash" | "Your description sounds like a Run issue. Consider changing category." |
| Priority-Description mismatch | User-selected priority=Low but description says "production down" | "This sounds urgent. Consider upgrading to High or Critical priority." |

### 5.3 Validation Feedback UI

Validation messages appear inline with the field, using the existing error pattern:

```tsx
// Enhanced validation display
<div className="relative">
  <textarea ... />
  
  {/* Quality Score Bar */}
  <div className="absolute bottom-2 right-2 flex items-center gap-1">
    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all ${
          qualityScore >= 80 ? 'bg-green-500' : 
          qualityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${qualityScore}%` }}
      />
    </div>
    <span className="text-xs text-gray-400">{qualityScore}/100</span>
  </div>

  {/* AI Suggestions */}
  {validationIssues.map(issue => (
    <div key={issue.type} className={`mt-1 text-xs flex items-start gap-1 ${
      issue.severity === 'error' ? 'text-red-500' :
      issue.severity === 'warning' ? 'text-yellow-600' : 'text-blue-500'
    }`}>
      <Info size={12} className="mt-0.5 shrink-0" />
      <span>{issue.message}</span>
      {issue.fix && (
        <button onClick={() => applyFix(issue)} className="underline ml-1">
          {issue.fix}
        </button>
      )}
    </div>
  ))}
</div>
```

### 5.4 Real-time vs On-Submit Validation

| Validation Type | When | Why |
|----------------|------|-----|
| Format checks (email, phone) | On blur | Immediate feedback |
| Required field checks | On blur + on submit | Prevent submission |
| AI description quality | Debounced (1500ms after typing stops) | Cost control |
| Cross-field consistency | On any field change | Catch mismatches early |
| Final pre-submit check | On submit, before API call | Last chance to catch issues |

---

## 6. Response Drafting

### 6.1 Pre-Submission: Follow-up Questions

When the user's input is ambiguous or incomplete, the AI generates clarifying questions (see Section 3.3). These appear as clickable chips below the form field:

```
┌─────────────────────────────────────────────────┐
│  Description *                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Our server is having issues...              │ │
│  └─────────────────────────────────────────────┘ │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░ 58/100 quality               │
│                                                   │
│  💡 To help us assist you better:                │
│  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ What error message?  │  │ When did it start│  │
│  └──────────────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────────┐        │
│  │ Is this affecting production?        │        │
│  └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

When the user clicks a suggestion chip, it appends the question to the description textarea and the user fills in the answer.

### 6.2 Post-Submission: Resolution Suggestions

After a ticket is submitted, the AI generates immediate next steps:

```typescript
interface PostSubmissionDraft {
  estimatedResponseTime: string;   // "Within 2 hours"
  suggestedActions: string[];      // Pre-emptive troubleshooting steps
  relatedResources: Array<{        // Links to knowledge base
    title: string;
    url: string;
  }>;
  followUpTemplate: string;        // Email template for status check
}
```

### 6.3 Contact Form: Auto-Response Draft

For contact submissions, the AI drafts a contextual acknowledgment:

```
"Thank you for reaching out about [detected topic]. 

Based on your inquiry about [Product/Service], here's what happens next:
1. Our [department] team will review your request within [timeframe]
2. [If sales lead] A representative will contact you to schedule a consultation
3. [If support] Please check your email for a ticket number

In the meantime, you might find these resources helpful:
- [Related solution page]
- [Related case study]"
```

This draft is shown to the user **before submission** as a preview, and also sent as the actual acknowledgment email via Resend.

### 6.4 Implementation

```typescript
// src/lib/ai/response-draft.ts

export async function draftPostSubmission(context: {
  formType: 'contact' | 'ticket';
  formData: Record<string, string>;
  aiAnalysis: AIAnalysis;
  locale: 'en' | 'zh';
}): Promise<PostSubmissionDraft> {
  const prompt = buildDraftPrompt(context);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', system: RESPONSE_DRAFT_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 500,
    temperature: 0.3,  // Low temperature for consistency
  });

  return validateAndParseDraft(response.choices[0].message.content);
}
```

---

## 7. Lead Scoring

### 7.1 Scoring Model

Lead scoring determines how quickly and thoroughly TechGuru should respond to a contact submission or ticket:

| Score Range | Tier | Response SLA | Action |
|------------|------|-------------|--------|
| 80-100 | **Hot** | < 1 hour | Immediate callback, sales team notified |
| 60-79 | **Warm** | < 4 hours | Priority queue, follow-up within 24h |
| 40-59 | **Nurture** | < 24 hours | Standard queue, email nurture sequence |
| 0-39 | **Low** | < 48 hours | Standard queue, self-service resources |

### 7.2 Scoring Signals

| Signal | Weight | Source | Scoring Logic |
|--------|--------|--------|---------------|
| **Company size indicator** | +25 | Company field + AI inference | Enterprise keywords (+25), Mid-market (+15), Small (+5) |
| **Purchase intent** | +20 | Message analysis | "buy/purchase/quote" (+20), "evaluating" (+15), "information" (+5) |
| **Urgency language** | +15 | Message analysis | "urgent/ASAP/down" (+15), "soon" (+10), no urgency (+0) |
| **Budget signals** | +10 | Message analysis | Mentions budget/PoC/pilot (+10) |
| **Technical maturity** | +10 | Description detail | Detailed technical description (+10), vague (+0) |
| **Existing customer** | +15 | Auth state + Supabase | Has prior tickets (+15), new customer (+0) |
| **Industry fit** | +5 | Company + AI inference | Target industry (healthcare/finance/gov) (+5) |

### 7.3 Scoring Algorithm

```typescript
interface LeadScore {
  total: number;            // 0-100
  tier: 'hot' | 'warm' | 'nurture' | 'low';
  signals: ScoreSignal[];
  confidence: number;       // 0-1
  recommendedAction: string;
}

interface ScoreSignal {
  factor: string;
  score: number;
  reason: string;
}

export function computeLeadScore(context: {
  formData: ContactFormData | TicketFormData;
  aiAnalysis: AIAnalysis;
  userHistory?: UserHistory;
  formType: 'contact' | 'ticket';
}): LeadScore {
  const signals: ScoreSignal[] = [];

  // Company size detection
  const companySignal = detectCompanySize(context.formData.company, context.aiAnalysis);
  signals.push(companySignal);

  // Purchase intent
  const intentSignal = detectPurchaseIntent(
    context.formData.message || context.formData.description,
    context.aiAnalysis
  );
  signals.push(intentSignal);

  // Urgency
  const urgencySignal = detectUrgency(
    context.formData.message || context.formData.description,
    context.aiAnalysis
  );
  signals.push(urgencySignal);

  // Existing customer bonus
  if (context.userHistory?.ticketCount > 0) {
    signals.push({
      factor: 'existing_customer',
      score: 15,
      reason: `Has ${context.userHistory.ticketCount} prior tickets`,
    });
  }

  // Contact form gets extra weight for completeness
  if (context.formType === 'contact') {
    const completeness = computeCompleteness(context.formData);
    signals.push({
      factor: 'form_completeness',
      score: completeness * 10, // 0-10
      reason: `${Math.round(completeness * 100)}% fields filled`,
    });
  }

  const total = Math.min(100, signals.reduce((sum, s) => sum + s.score, 0));
  const tier = total >= 80 ? 'hot' : total >= 60 ? 'warm' : total >= 40 ? 'nurture' : 'low';

  return {
    total,
    tier,
    signals,
    confidence: computeConfidence(signals),
    recommendedAction: getRecommendedAction(tier, context.formType),
  };
}
```

### 7.4 CRM Integration

Lead scores are passed to Odoo CRM as custom fields:

```typescript
// Enhanced Odoo lead creation with lead score
await createOdooLead({
  name: formData.name,
  email: formData.email,
  company: formData.company,
  phone: formData.phone,
  description: formData.message,
  // New fields:
  lead_score: leadScore.total,
  lead_tier: leadScore.tier,
  ai_category: aiAnalysis.category,
  ai_confidence: aiAnalysis.categoryConfidence,
  source_id: 'TechGuru Website - Smart Form',
});
```

### 7.5 Score Visibility

| Audience | Score Visible | Where |
|----------|-------------|-------|
| Submitter (customer) | No | Score is internal only |
| Sales team | Yes, full breakdown | Odoo CRM lead detail |
| Support team | Tier only (hot/warm/nurture/low) | Ticket detail page |
| Admin dashboard | Aggregate stats | Analytics page |

---

## 8. API Design

### 8.1 Endpoint Overview

```
POST /api/smart-form/analyze          # Main analysis endpoint (both forms)
POST /api/smart-form/followup         # Generate follow-up questions
POST /api/smart-form/validate         # AI-powered field validation
POST /api/smart-form/score            # Lead scoring
GET  /api/smart-form/autofill         # Get auto-fill context (authenticated)
POST /api/smart-form/similar          # Find similar submissions
```

### 8.2 Endpoint Details

#### 8.2.1 POST /api/smart-form/analyze

The primary endpoint that orchestrates all AI analysis for both contact and ticket forms.

**Request:**
```typescript
{
  formType: 'contact' | 'ticket';
  locale: 'en' | 'zh';
  inputs: {
    // Contact form fields (partial — send only what user has typed)
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
    message?: string;
    
    // Ticket form fields (partial)
    category?: string;
    product?: string;
    subject?: string;
    description?: string;
  };
  context?: {
    urlPath?: string;           // Page URL the user is on
    referrerProduct?: string;   // Product ID/slug from referring page
    previousAnalysisId?: string; // ID of prior analysis (for incremental updates)
  };
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    analysisId: string;          // Unique ID for this analysis session
    
    // Core analysis
    intent: {
      type: 'bug_report' | 'feature_request' | 'how_to' | 'urgent_issue' | 'sales_inquiry' | 'general_inquiry';
      confidence: number;
    };
    
    // Category & product suggestions
    suggestions: {
      category?: {
        value: string;
        confidence: number;
        reason: string;
      };
      product?: {
        value: string;
        confidence: number;
        alternatives: Array<{ name: string; confidence: number }>;
        reason: string;
      };
    };
    
    // Priority (tickets only)
    priority?: {
      value: 'low' | 'medium' | 'high' | 'critical';
      confidence: number;
      reason: string;
      urgencyIndicators: string[];
    };
    
    // Sentiment
    sentiment: {
      level: 'neutral' | 'positive' | 'frustrated' | 'angry';
      confidence: number;
    };
    
    // Description quality (tickets)
    quality?: {
      score: number;              // 0-100
      issues: Array<{
        type: string;
        severity: 'error' | 'warning' | 'info';
        message: string;
        fix?: string;
      }>;
      suggestions: string[];
    };
    
    // Follow-up questions
    followUpQuestions: string[];
    
    // Lead scoring (contacts)
    leadScore?: {
      total: number;
      tier: 'hot' | 'warm' | 'nurture' | 'low';
      signals: Array<{ factor: string; score: number; reason: string }>;
    };
    
    // Auto-fill recommendations
    autoFill: Array<{
      field: string;
      value: string;
      confidence: number;
      source: 'url' | 'history' | 'ai' | 'default';
    }>;
    
    // Similar existing items
    similarItems: Array<{
      id: string;
      type: 'ticket' | 'contact';
      title: string;
      similarity: number;
      resolution?: string;
    }>;
  };
  
  meta: {
    tokensUsed: number;
    processingTimeMs: number;
    model: string;
    cached: boolean;
  };
}
```

#### 8.2.2 POST /api/smart-form/followup

Lightweight endpoint for generating follow-up questions (called separately to reduce main analysis cost).

**Request:**
```typescript
{
  formType: 'contact' | 'ticket';
  field: 'description' | 'message' | 'subject';
  currentValue: string;
  currentSuggestions?: {
    category?: string;
    product?: string;
  };
  locale: 'en' | 'zh';
  maxQuestions?: number;  // Default: 3
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    questions: string[];
    missingInfo: string[];
  },
  meta: {
    tokensUsed: number;
    processingTimeMs: number;
  };
}
```

#### 8.2.3 POST /api/smart-form/validate

AI-powered semantic validation for specific fields.

**Request:**
```typescript
{
  formType: 'contact' | 'ticket';
  field: string;
  value: string;
  context?: {
    category?: string;
    product?: string;
    otherFields?: Record<string, string>;
  };
  locale: 'en' | 'zh';
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    valid: boolean;
    score: number;          // 0-100
    issues: Array<{
      type: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
      fix?: string;
    }>;
    enrichedValue?: string;  // If AI can improve the input (e.g., fix typos)
  },
  meta: {
    tokensUsed: number;
    processingTimeMs: number;
  };
}
```

#### 8.2.4 POST /api/smart-form/score

Standalone lead scoring (called after form submission for contact form).

**Request:**
```typescript
{
  formData: ContactFormData;
  aiAnalysisId?: string;    // Reference to prior analysis
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    score: number;
    tier: string;
    signals: Array<{ factor: string; score: number; reason: string }>;
    confidence: number;
    recommendedAction: string;
    suggestedFollowUp: string;
  },
  meta: {
    tokensUsed: number;
    processingTimeMs: number;
  };
}
```

#### 8.2.5 GET /api/smart-form/autofill

Server-side endpoint to fetch auto-fill context for authenticated users.

**Request (query params):**
```
GET /api/smart-form/autofill?formType=ticket&urlPath=/products/build/aigc
```

**Response:**
```typescript
{
  success: true;
  data: {
    profile: {
      name: string;
      email: string;
      company: string;
      phone: string;
    } | null;
    contextualDefaults: {
      category?: string;
      product?: string;
      suggestedSubject?: string;
      suggestedMessage?: string;
    };
    userHistory: {
      dominantCategory?: string;
      dominantProduct?: string;
      recentSubjects: string[];
      ticketCount: number;
    };
  }
}
```

#### 8.2.6 POST /api/smart-form/similar

Find similar existing tickets or contact submissions.

**Request:**
```typescript
{
  query: string;
  formType: 'contact' | 'ticket';
  category?: string;
  excludeId?: string;
  limit?: number;  // Default: 5
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    items: Array<{
      id: string;
      type: 'ticket' | 'contact';
      title: string;
      description: string;
      status?: string;
      similarity: number;
      matchReasons: string[];
      resolution?: string;
    }>;
    totalFound: number;
    searchTimeMs: number;
  }
}
```

### 8.3 Rate Limiting

| Endpoint | Anonymous | Authenticated | Admin |
|----------|-----------|---------------|-------|
| `/analyze` | 5/hour | 30/hour | 100/hour |
| `/followup` | 10/hour | 60/hour | 200/hour |
| `/validate` | 20/hour | 100/hour | 500/hour |
| `/score` | 10/hour | 50/hour | 200/hour |
| `/autofill` | N/A (auth required) | 60/hour | 300/hour |
| `/similar` | 10/hour | 30/hour | 100/hour |

Rate limiting uses the existing in-memory + Supabase pattern from Smart-Ticket-Assistant-Design.md Section 7.3.

---

## 9. UI/UX Design

### 9.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Non-intrusive** | AI suggestions appear alongside the form, never blocking user input |
| **Progressive disclosure** | Show minimal suggestions first, reveal more as user engages |
| **Clear attribution** | Every AI suggestion shows "AI suggested" badge with confidence |
| **Easy override** | One click to accept, one click to dismiss, one click to edit |
| **Accessible** | All AI elements have proper ARIA labels and screen reader text |
| **Bilingual** | Full i18n support for English and Traditional Chinese |

### 9.2 Component Architecture

```
src/components/smart-form/
├── SmartFormProvider.tsx           # Context provider (analysis state, settings)
├── SmartFormWrapper.tsx            # Main wrapper that adds AI to any form
├── AutoFillBanner.tsx              # One-time auto-fill consent banner
├── AnalysisPanel.tsx               # Side panel showing AI suggestions
├── SuggestionChips.tsx             # Clickable suggestion chips (category, product)
├── FollowUpQuestions.tsx           # Generated follow-up question chips
├── QualityIndicator.tsx            # Description quality score bar
├── ValidationFeedback.tsx          # AI validation messages
├── LeadScorePreview.tsx            # Internal: lead score display (admin only)
├── SimilarItemsPanel.tsx           # Similar tickets/contacts list
├── LoadingPulse.tsx                # "Analyzing..." animated indicator
├── hooks/
│   ├── useSmartAnalysis.ts         # Main debounced analysis hook
│   ├── useAutoFill.ts              # Auto-fill logic hook
│   ├── useValidation.ts            # AI validation hook
│   ├── useFollowUp.ts              # Follow-up question generation hook
│   └── useLeadScore.ts             # Lead scoring hook (post-submit)
└── utils/
    ├── urlContext.ts                # Extract context from URL
    ├── historyPattern.ts           # Detect user patterns from history
    └── scoreThresholds.ts          # Confidence thresholds config
```

### 9.3 SmartFormWrapper Component

The main wrapper that enhances any form with AI capabilities:

```typescript
// src/components/smart-form/SmartFormWrapper.tsx
'use client';

import { SmartFormProvider } from './SmartFormProvider';
import AnalysisPanel from './AnalysisPanel';
import AutoFillBanner from './AutoFillBanner';

interface SmartFormWrapperProps {
  formType: 'contact' | 'ticket';
  children: React.ReactNode;
  formData: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
  locale: 'en' | 'zh';
}

export default function SmartFormWrapper({
  formType,
  children,
  formData,
  onFieldChange,
  locale,
}: SmartFormWrapperProps) {
  return (
    <SmartFormProvider formType={formType} locale={locale}>
      <AutoFillBanner />
      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Main form (existing) */}
        <div>{children}</div>
        
        {/* AI Sidebar */}
        <aside className="hidden lg:block">
          <AnalysisPanel
            formData={formData}
            onApplySuggestion={(field, value) => onFieldChange(field, value)}
          />
        </aside>
      </div>
      
      {/* Mobile: AI panel below form */}
      <div className="lg:hidden mt-6">
        <AnalysisPanel
          formData={formData}
          onApplySuggestion={(field, value) => onFieldChange(field, value)}
        />
      </div>
    </SmartFormProvider>
  );
}
```

### 9.4 Visual Design System

#### 9.4.1 AI Badge

```tsx
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-200">
  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
    <span className="text-white text-[8px] font-bold">AI</span>
  </span>
  Suggested
</span>
```

#### 9.4.2 Suggestion Chip

```tsx
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm 
  bg-white border border-gray-200 text-gray-700 
  hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 
  transition-all duration-200 group">
  <CheckCircle size={14} className="text-gray-400 group-hover:text-cyan-500" />
  {label}
  <span className="text-xs text-gray-400 group-hover:text-cyan-500">
    {confidence}%
  </span>
</button>
```

#### 9.4.3 Quality Score Bar

```
┌──────────────────────────────────────────────┐
│  Quality Score                                │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  78/100           │
│  Good — Add reproduction steps for higher     │
│  score                                         │
└──────────────────────────────────────────────┘

Colors: 
  80-100: green-500 (#22c55e)
  50-79:  yellow-500 (#eab308)
  0-49:   red-500 (#ef4444)
```

#### 9.4.4 Analysis Panel Layout

```
┌─────────────────────────────────────┐
│  ✦ Smart Assistant            [−]  │  ← Collapsible header
├─────────────────────────────────────┤
│                                     │
│  ▶ Category                         │
│  ┌─────────────────────────────┐   │
│  │ 🏷 Build         92% [Apply]│   │  ← Suggestion with confidence
│  └─────────────────────────────┘   │
│                                     │
│  ▶ Priority                         │
│  ┌─────────────────────────────┐   │
│  │ ⚠ High          AI detected │   │
│  │ Critical systems affected    │   │  ← Reason text
│  └─────────────────────────────┘   │
│                                     │
│  ▶ Products                         │
│  ┌─────────────────────────────┐   │
│  │ ✓ AIGC Platform     87%    │   │
│  │ ○ AI Agent Dev      45%    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ▶ Description Quality              │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  72/100         │  ← Quality bar
│  ⚠ Missing error details           │
│  💡 Add reproduction steps         │
│                                     │
│  ▶ Similar Tickets (3 found)        │
│  ┌─────────────────────────────┐   │
│  │ TG-20260628-A1B2           │   │
│  │ "Firewall blocking Azure"   │   │
│  │ Match: 78% · Resolved       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ▶ Quick Questions                  │
│  ┌────────────────────┐            │
│  │ What error message? │  [chip]   │
│  └────────────────────┘            │
│  ┌────────────────────────┐        │
│  │ Is this production?    │ [chip]  │
│  └────────────────────────┘        │
│                                     │
├─────────────────────────────────────┤
│  📊 342ms · 847 tokens · $0.0003   │  ← Dev stats (dev only)
└─────────────────────────────────────┘
```

### 9.5 Interaction Flow

#### 9.5.1 Contact Form Flow

```
1. User arrives at /contact
   │
   ├──▶ Auto-fill banner shown (first visit)
   │    "Smart Form can pre-fill your info. [Accept] [Skip]"
   │
   ├──▶ If accepted: profile data pre-fills name/email/company/phone
   │
   ├──▶ User types in message field
   │    │
   │    ├──▶ After 800ms debounce: AI analyzes message
   │    │    │
   │    │    ├──▶ Intent classification (sales inquiry? support? general?)
   │    │    │
   │    │    ├──▶ Lead scoring (background)
   │    │    │
   │    │    └──▶ Follow-up questions generated (if needed)
   │    │
   │    └──▶ Suggestions appear in sidebar:
   │         "Based on your message, you might be interested in..."
   │
   ├──▶ User fills remaining fields
   │
   ├──▶ On submit:
   │    │
   │    ├──▶ Final lead score computed
   │    │
   │    ├──▶ Contact saved to Supabase + Odoo lead created with score
   │    │
   │    └──▶ Success page shows: "Thank you! Our [team] will respond within [time]"
   │
   └──▶ Post-submission: AI drafts acknowledgment email (via Resend)
```

#### 9.5.2 Ticket Form Flow

```
1. User arrives at /support (authenticated)
   │
   ├──▶ Auto-fill: category/product from URL, profile data
   │
   ├──▶ User types description
   │    │
   │    ├──▶ After 800ms: AI analysis runs
   │    │    │
   │    │    ├──▶ Category suggestion (with confidence)
   │    │    ├──▶ Product suggestion (with confidence)
   │    │    ├──▶ Priority detection
   │    │    ├──▶ Sentiment analysis
   │    │    ├──▶ Description quality scoring
   │    │    ├──▶ Similar tickets search
   │    │    └──▶ Follow-up questions
   │    │
   │    ├──▶ If confidence >= 0.85: auto-fill category + product
   │    │
   │    └──▶ If similar tickets found: show panel
   │         "Found 2 similar tickets that may help:"
   │
   ├──▶ If user clicks follow-up question chip:
   │    → Question appended to description
   │    → User fills in the answer
   │
   ├──▶ Description quality score updates in real-time
   │
   ├──▶ Pre-submit validation: cross-field consistency check
   │
   ├──▶ On submit:
   │    │
   │    ├──▶ Ticket created with AI metadata
   │    ├──▶ AI generates resolution suggestions (background)
   │    └──▶ Success page shows: ticket # + suggested next steps
   │
   └──▶ Post-submission: acknowledgment email includes AI-suggested self-help steps
```

### 9.6 Accessibility (PRD [S19])

| Requirement | Implementation |
|-------------|---------------|
| Screen reader support | AI suggestions wrapped in `aria-live="polite"` region |
| Keyboard navigation | All suggestion chips are focusable and activatable via Enter/Space |
| Color independence | Confidence levels shown as text labels, not just colors |
| Reduced motion | Respect `prefers-reduced-motion` for loading animations |
| Focus management | After applying suggestion, focus returns to the form field |
| ARIA labels | `aria-label="AI suggested category: Build, 92% confidence"` |
| Skip link | "Skip AI suggestions" link for keyboard users |

### 9.7 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| Desktop (>= 1024px) | Form + AI sidebar (320px) side by side |
| Tablet (768-1023px) | Form full width, AI panel below |
| Mobile (< 768px) | Form full width, AI collapsed into expandable section at bottom |

---

## 10. Privacy Considerations

### 10.1 Data Classification

| Data Type | Classification | AI Processing | Retention |
|-----------|---------------|---------------|-----------|
| Name, Email, Phone | PII | Sent to OpenAI (stripped of direct identifiers where possible) | Per GDPR: deleted on request |
| Company name | Business data | Sent to OpenAI for context | 2 years |
| Message/Description | User content | Sent to OpenAI for analysis | 1 year |
| AI analysis results | Derived data | N/A (generated, not stored externally) | 30 days (logs) |
| Lead score | Derived data | Computed server-side only | Matches contact retention |
| Form auto-fill data | Session data | Never sent externally | Cleared on session end |
| Token usage logs | Operational | N/A | 30 days |

### 10.2 Privacy Principles

| Principle | Implementation |
|-----------|---------------|
| **Data minimization** | Only send fields relevant to the current analysis; don't send entire user profile |
| **Purpose limitation** | AI data used only for form assistance, never for marketing/profiling beyond lead scoring |
| **Consent** | Auto-fill requires explicit consent; AI analysis disclosed in UI |
| **Right to erasure** | User can request deletion of all AI analysis logs via support ticket |
| **No training data** | OpenAI API configured with zero data retention; data not used for model training |
| **Local processing** | Lead scoring and rule-based fallbacks run entirely server-side (no external API) |
| **Transparency** | "AI-powered" badge on all AI-generated suggestions |

### 10.3 PII Stripping

Before sending user input to OpenAI, the system strips or masks sensitive data:

```typescript
// src/lib/ai/privacy.ts

export function stripPII(input: string): string {
  return input
    // Email addresses
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]')
    // Phone numbers (international format)
    .replace(/\+?[\d\s()-]{7,15}/g, '[PHONE]')
    // IP addresses
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP]')
    // Credit card numbers (basic pattern)
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
    // API keys and tokens
    .replace(/\b(sk|pk|api|token)[_-][\w]{20,}\b/gi, '[KEY]');
}

export function stripEmailFromContext(context: FormContext): FormContext {
  return {
    ...context,
    formData: {
      ...context.formData,
      email: context.formData.email ? '[USER_EMAIL]' : undefined,
    },
    profile: undefined, // Never send profile to AI
  };
}
```

### 10.4 Prompt Injection Protection

| Threat | Mitigation |
|--------|------------|
| User types "ignore previous instructions" in description | Input sanitization removes injection patterns |
| User types system-prompt-like content | System prompt clearly separates user input boundary |
| Response contains unexpected instructions | Output validation enforces strict JSON schema |
| Token exhaustion attack | Rate limiting per user + global cap |

```typescript
// Enhanced sanitization for Smart Form
export function sanitizeForSmartForm(input: string): string {
  let sanitized = input;

  // Remove common injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|all|above|your)\s+instructions?/gi,
    /you\s+are\s+now\s+(a|an|the)/gi,
    /system\s*:\s*/gi,
    /assistant\s*:\s*/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /###\s*(system|assistant|user)/gi,
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Limit length (configurable per form type)
  if (sanitized.length > 2000) {
    sanitized = sanitized.slice(0, 2000);
  }

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  return sanitized;
}
```

### 10.5 OpenAI Data Handling

| Configuration | Value |
|--------------|-------|
| API data retention | Zero (OpenAI API does not retain input/output) |
| Training data | No (API usage not used for training) |
| Data processing agreement | OpenAI DPA in place |
| Encryption | TLS 1.3 for all API calls |
| API key management | Stored in `.env.local`, rotated quarterly, never in code/logs |
| Region | OpenAI API called from Vercel edge (US/EU), no cross-border issues for HK/SEA customers |

### 10.6 Consent Management

```typescript
// src/components/smart-form/AutoFillBanner.tsx
'use client';

import { useState, useEffect } from 'react';

export default function AutoFillBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('smart-form-consent');
    if (!consent) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('smart-form-consent', JSON.stringify({
      autofill: true,
      aiAnalysis: true,
      timestamp: Date.now(),
    }));
    setShow(false);
  };

  const handleSkip = () => {
    localStorage.setItem('smart-form-consent', JSON.stringify({
      autofill: false,
      aiAnalysis: true,  // AI analysis still works, just no auto-fill
      timestamp: Date.now(),
    }));
    setShow(false);
  };

  const handleOptOut = () => {
    localStorage.setItem('smart-form-consent', JSON.stringify({
      autofill: false,
      aiAnalysis: false,
      timestamp: Date.now(),
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 font-medium">
            Smart Form Assistance
          </p>
          <p className="text-xs text-gray-500 mt-1">
            We use AI to help pre-fill fields and provide smarter suggestions. 
            Your data is processed securely and not stored by our AI provider.
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAccept} className="px-3 py-1.5 bg-[#00D4FF] text-white text-xs font-medium rounded-full hover:bg-[#00B8DB] transition-colors">
              Enable Smart Fill
            </button>
            <button onClick={handleSkip} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-50 transition-colors">
              Skip Auto-fill
            </button>
            <button onClick={handleOptOut} className="px-3 py-1.5 text-gray-400 text-xs hover:text-gray-600 transition-colors">
              Opt out entirely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 11. Database Schema Extensions

### 11.1 New Tables

```sql
-- AI analysis sessions (tracks each analysis request)
CREATE TABLE smart_form_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  form_type VARCHAR(20) NOT NULL CHECK (form_type IN ('contact', 'ticket')),
  
  -- Input snapshot (PII stripped for stored version)
  input_summary TEXT,
  
  -- AI output
  intent_type VARCHAR(30),
  intent_confidence DECIMAL(3,2),
  suggested_category VARCHAR(20),
  category_confidence DECIMAL(3,2),
  suggested_product VARCHAR(200),
  product_confidence DECIMAL(3,2),
  priority_suggestion VARCHAR(20),
  priority_confidence DECIMAL(3,2),
  sentiment VARCHAR(20),
  quality_score INTEGER,
  lead_score INTEGER,
  lead_tier VARCHAR(20),
  
  -- Full analysis JSON (for debugging, PII stripped)
  analysis_json JSONB,
  
  -- Metadata
  tokens_input INTEGER,
  tokens_output INTEGER,
  processing_time_ms INTEGER,
  model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  
  -- User interaction
  suggestions_accepted INTEGER DEFAULT 0,
  suggestions_edited INTEGER DEFAULT 0,
  suggestions_ignored INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Track individual suggestion interactions for model improvement
CREATE TABLE smart_form_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES smart_form_analyses(id) ON DELETE CASCADE,
  field VARCHAR(50) NOT NULL,
  ai_suggestion VARCHAR(200),
  user_action VARCHAR(20) CHECK (user_action IN ('accepted', 'edited', 'ignored')),
  user_final_value VARCHAR(200),
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX smart_form_analyses_user_idx ON smart_form_analyses (user_id, created_at);
CREATE INDEX smart_form_analyses_form_type_idx ON smart_form_analyses (form_type, created_at);
CREATE INDEX smart_form_feedback_analysis_idx ON smart_form_feedback (analysis_id);
CREATE INDEX smart_form_analyses_lead_tier_idx ON smart_form_analyses (lead_tier) WHERE lead_tier IS NOT NULL;
```

### 11.2 Alter Existing Tables

```sql
-- Add AI metadata to tickets
ALTER TABLE tickets ADD COLUMN ai_analysis_id UUID REFERENCES smart_form_analyses(id);
ALTER TABLE tickets ADD COLUMN ai_suggested_category VARCHAR(20);
ALTER TABLE tickets ADD COLUMN ai_suggested_priority VARCHAR(20);
ALTER TABLE tickets ADD COLUMN ai_confidence DECIMAL(3,2);
ALTER TABLE tickets ADD COLUMN description_quality_score INTEGER;

-- Add lead score to contact_submissions
ALTER TABLE contact_submissions ADD COLUMN lead_score INTEGER;
ALTER TABLE contact_submissions ADD COLUMN lead_tier VARCHAR(20);
ALTER TABLE contact_submissions ADD COLUMN ai_analysis_id UUID REFERENCES smart_form_analyses(id);
ALTER TABLE contact_submissions ADD COLUMN intent_type VARCHAR(30);
```

---

## 12. Prompt Engineering

### 12.1 System Prompt for Smart Form Analysis

```typescript
const SMART_FORM_ANALYSIS_PROMPT = `You are TechGuru's Smart Form Assistant — an AI that helps users fill out support tickets and contact forms for an IT infrastructure company in Hong Kong/Southeast Asia.

## Your Role
Analyze user input in real-time and provide structured suggestions for form fields. Be helpful, accurate, and culturally aware (Hong Kong/SEA business context).

## Company Context
TechGuru Network & Data Solutions provides:
- **Build**: AIGC, AI Agent Development, Legacy System AI Transformation
- **Run**: Virtualization (VMware alternatives), HCI, Cloud, Hardware, Managed Services, BC/DR
- **Protect**: NGFW, WAF, EDR, NDR/XDR, CASB/SASE/ZTNA, SD-WAN, MDR, Incident Response

## Analysis Requirements

Given partial or complete form input, return JSON with:

1. **intent**: Classification of user's intent (bug_report, feature_request, how_to, urgent_issue, sales_inquiry, general_inquiry)
2. **suggestions**: Category, product, and other field suggestions with confidence scores
3. **priority**: For tickets — low/medium/high/critical with reasoning
4. **sentiment**: Customer emotional state (neutral/positive/frustrated/angry)
5. **quality**: For descriptions — score 0-100 with specific improvement suggestions
6. **followUpQuestions**: 1-3 targeted questions to gather missing info (max 15 words each)
7. **similarKeywords**: Key terms for similarity matching
8. **leadScore**: For contacts — scoring signals

## Rules
- Confidence scores must reflect actual certainty (0.0 to 1.0)
- Only suggest products that exist in TechGuru's catalog
- Flag security-related keywords (malware, breach, unauthorized, ransomware) as high priority
- Consider timezone context (HKT = UTC+8)
- Match response language to input language (English or Traditional Chinese)
- Never generate suggestions with confidence below 0.5
- If input is too vague (< 20 chars), return empty suggestions with follow-up questions

## Output Format
Return valid JSON matching the SmartFormAnalysis schema. No markdown, no explanations outside JSON.`;
```

### 12.2 System Prompt for Follow-up Questions

```typescript
const FOLLOWUP_SYSTEM_PROMPT = `You are a smart form assistant generating follow-up questions for TechGuru IT support forms.

## Rules
- Generate 1-3 questions maximum
- Each question max 15 words
- Questions must be specific and actionable
- Prioritize info needed for category/priority classification
- Don't ask for info already provided
- Match the language of the user's input
- For security issues, ask about evidence of compromise
- For sales inquiries, ask about timeline and budget

## Output Format
{ "questions": ["question1", "question2"], "missingInfo": ["info1", "info2"] }`;
```

### 12.3 System Prompt for Validation

```typescript
const VALIDATION_SYSTEM_PROMPT = `You are a form validation assistant for TechGuru IT support. Analyze a single form field value and return validation results.

## Checks
1. Format validity (email, phone patterns)
2. Specificity (is the input vague or specific?)
3. Relevance (does it match the expected field type?)
4. Cross-field consistency (does it conflict with other fields?)
5. Quality (for descriptions: completeness, technical detail, actionable info)

## Rules
- Return score 0-100
- Issues array with type, severity, message, and optional fix suggestion
- Never block submission — only warn or suggest improvements
- Be constructive, not judgmental
- Match output language to input language

## Output Format
{ "valid": boolean, "score": number, "issues": [...], "enrichedValue": null | string }`;
```

---

## 13. Error Handling & Fallback Strategies

### 13.1 Error Matrix

| Error | Impact | Fallback | User Sees |
|-------|--------|----------|-----------|
| OpenAI API down | No AI analysis | Rule-based categorization + manual form | "Smart suggestions unavailable — fill form manually" |
| Rate limit hit | Temp block on AI | Allow manual submission | "Slow down — try again in X seconds" |
| Invalid AI response | No suggestions | Skip suggestions, form works normally | No sidebar content, form unaffected |
| Network timeout (10s) | Delayed suggestions | Cancel request, allow manual flow | Loading indicator → timeout message |
| PII stripping fails | Security risk | Block AI call entirely, log error | "Analysis temporarily unavailable" |
| Database write fails | No analysis saved | Log to console, form still submits | Form works, AI metadata lost |
| Consent not stored | No auto-fill | Skip auto-fill, show banner | Banner reappears next visit |

### 13.2 Rule-based Fallback

When AI is unavailable, the system falls back to keyword-based rules:

```typescript
// src/lib/ai/fallback.ts

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  build: ['aigc', 'ai agent', 'machine learning', 'development', 'custom', 'transform', 'legacy'],
  run: ['server', 'vmware', 'proxmox', 'cloud', 'backup', 'storage', 'hci', 'vm', 'virtualization', 'nutanix'],
  protect: ['firewall', 'security', 'virus', 'malware', 'breach', 'waf', 'edr', 'intrusion', 'ransomware', 'vulnerability'],
};

const PRIORITY_KEYWORDS = {
  critical: ['down', 'critical', 'emergency', 'production', 'outage', 'data loss', 'breach', 'ransomware'],
  high: ['urgent', 'blocking', 'cannot', 'failed', 'error', 'important'],
  low: ['question', 'how to', 'information', 'demo', 'quote', 'pricing'],
};

export function ruleBasedAnalysis(input: string): Partial<SmartFormAnalysis> {
  const lower = input.toLowerCase();
  
  // Category detection
  let category: string | null = null;
  let maxHits = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const hits = keywords.filter(k => lower.includes(k)).length;
    if (hits > maxHits) { maxHits = hits; category = cat; }
  }
  
  // Priority detection
  let priority = 'medium';
  for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) { priority = level; break; }
  }
  
  // Intent detection
  let intent = 'general_inquiry';
  if (lower.includes('error') || lower.includes('crash') || lower.includes('fail')) intent = 'bug_report';
  if (lower.includes('feature') || lower.includes('need') || lower.includes('want')) intent = 'feature_request';
  if (lower.includes('how') || lower.includes('guide') || lower.includes('tutorial')) intent = 'how_to';
  if (lower.includes('down') || lower.includes('urgent') || lower.includes('emergency')) intent = 'urgent_issue';
  if (lower.includes('buy') || lower.includes('quote') || lower.includes('demo') || lower.includes('price')) intent = 'sales_inquiry';
  
  return {
    intent: { type: intent as any, confidence: 0.6 },
    suggestions: {
      category: category ? { value: category, confidence: 0.65, reason: 'Keyword match' } : undefined,
    },
    priority: { value: priority as any, confidence: 0.6, reason: 'Keyword match', urgencyIndicators: [] },
    sentiment: { level: 'neutral', confidence: 0.5 },
  };
}
```

---

## 14. Cost Estimation

### 14.1 Token Usage Projections (Smart Form Only)

| Operation | Avg Input Tokens | Avg Output Tokens | Frequency/Day | Total Daily Tokens |
|-----------|------------------|-------------------|---------------|-------------------|
| `/analyze` | 500 | 300 | 80 | 64,000 |
| `/followup` | 200 | 100 | 40 | 12,000 |
| `/validate` | 150 | 80 | 60 | 13,800 |
| `/score` | 300 | 100 | 50 | 20,000 |
| `/similar` | 200 | 50 | 30 | 7,500 |
| **Daily Total** | — | — | **260** | **117,300** |

### 14.2 Monthly Cost

| Component | Calculation | Cost (USD) |
|-----------|-------------|------------|
| Input tokens | 75,000/day × 30 × $0.15/M | $0.338 |
| Output tokens | 42,300/day × 30 × $0.60/M | $0.761 |
| **AI API Total** | — | **$1.10/month** |
| Combined with Smart Ticket Assistant | $0.32 + $1.10 | **$1.42/month** |

### 14.3 Cost Controls

| Control | Implementation |
|---------|---------------|
| Debouncing | 800ms on `/analyze`, 1500ms on `/validate` |
| Minimum input | Skip AI if description < 20 chars |
| Caching | Cache identical inputs for 5 minutes |
| Batch analysis | Single `/analyze` call returns category + priority + sentiment + quality |
| Rule-based fallback | Simple cases handled without AI ($0) |
| Monthly budget cap | `$10/month` auto-disable threshold |

---

## 15. Implementation Timeline

### Phase 1: Foundation (Week 1, Days 1-5)

| Day | Task | Files |
|-----|------|-------|
| 1 | Database migration (smart_form_analyses, smart_form_feedback) | `supabase/migrations/` |
| 1 | Privacy utilities (PII stripping, sanitization) | `src/lib/ai/privacy.ts`, `src/lib/ai/sanitize.ts` |
| 2 | OpenAI client setup | `src/lib/openai.ts` |
| 2 | Rule-based fallback | `src/lib/ai/fallback.ts` |
| 3 | POST /api/smart-form/analyze endpoint | `src/app/api/smart-form/analyze/route.ts` |
| 3 | Analysis Zod schema | `src/lib/ai/schemas.ts` |
| 4 | POST /api/smart-form/followup endpoint | `src/app/api/smart-form/followup/route.ts` |
| 4 | POST /api/smart-form/validate endpoint | `src/app/api/smart-form/validate/route.ts` |
| 5 | Rate limiting middleware | `src/lib/ai/rate-limit.ts` |
| 5 | Unit tests for all lib utilities | `src/lib/ai/__tests__/` |

### Phase 2: Client Hooks (Week 2, Days 6-10)

| Day | Task | Files |
|-----|------|-------|
| 6 | SmartFormProvider context | `src/components/smart-form/SmartFormProvider.tsx` |
| 6 | useSmartAnalysis hook | `src/components/smart-form/hooks/useSmartAnalysis.ts` |
| 7 | useAutoFill hook | `src/components/smart-form/hooks/useAutoFill.ts` |
| 7 | Auto-fill context API endpoint | `src/app/api/smart-form/autofill/route.ts` |
| 8 | useValidation hook | `src/components/smart-form/hooks/useValidation.ts` |
| 8 | useFollowUp hook | `src/components/smart-form/hooks/useFollowUp.ts` |
| 9 | useLeadScore hook | `src/components/smart-form/hooks/useLeadScore.ts` |
| 9 | POST /api/smart-form/score endpoint | `src/app/api/smart-form/score/route.ts` |
| 10 | POST /api/smart-form/similar endpoint | `src/app/api/smart-form/similar/route.ts` |
| 10 | FTS index for similarity search | Database migration |

### Phase 3: UI Components (Week 3, Days 11-15)

| Day | Task | Files |
|-----|------|-------|
| 11 | SmartFormWrapper | `src/components/smart-form/SmartFormWrapper.tsx` |
| 11 | AutoFillBanner | `src/components/smart-form/AutoFillBanner.tsx` |
| 12 | AnalysisPanel | `src/components/smart-form/AnalysisPanel.tsx` |
| 12 | SuggestionChips | `src/components/smart-form/SuggestionChips.tsx` |
| 13 | FollowUpQuestions | `src/components/smart-form/FollowUpQuestions.tsx` |
| 13 | QualityIndicator | `src/components/smart-form/QualityIndicator.tsx` |
| 14 | ValidationFeedback | `src/components/smart-form/ValidationFeedback.tsx` |
| 14 | SimilarItemsPanel | `src/components/smart-form/SimilarItemsPanel.tsx` |
| 15 | LoadingPulse | `src/components/smart-form/LoadingPulse.tsx` |
| 15 | i18n translations (en.json, zh.json) | `src/messages/` |

### Phase 4: Integration & Polish (Week 4, Days 16-20)

| Day | Task | Files |
|-----|------|-------|
| 16 | Integrate SmartFormWrapper with ContactPage | `src/app/[locale]/contact/page.tsx` |
| 16 | Integrate SmartFormWrapper with TicketForm | `src/components/tickets/TicketForm.tsx` |
| 17 | Post-submission AI drafts | `src/lib/ai/response-draft.ts` |
| 17 | Resend integration for smart acknowledgments | `src/lib/resend.ts` (extend) |
| 18 | Odoo integration with lead scores | `src/lib/odoo.ts` (extend) |
| 18 | Accessibility audit (WCAG 2.1 AA) | Manual testing |
| 19 | Unit tests for all components | `src/components/smart-form/__tests__/` |
| 19 | E2E tests (Playwright with Edge) | `e2e/smart-form/` |
| 20 | Performance testing | Load test with 100 concurrent users |
| 20 | Security review | Prompt injection + PII handling audit |

---

## 16. Success Metrics

### 16.1 KPIs

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| AI classification accuracy | >85% | Compare AI suggestion vs final user selection |
| User acceptance rate | >70% | Suggestions accepted without edit |
| Form completion time reduction | >30% | Before/after timing comparison |
| Duplicate ticket reduction | >20% | Month-over-month duplicate rate |
| Lead score accuracy | >80% | Score correlates with actual conversion |
| Description quality improvement | >40% | Average quality score increase |
| Customer satisfaction | >4.5/5 | Post-submission survey |
| AI uptime | >99.5% | Monitoring dashboard |
| Average response time | <2s | P95 latency tracking |
| Monthly AI cost | <$2 | OpenAI billing dashboard |

### 16.2 Feedback Loop

```
User submits form
    │
    ├──▶ AI suggestion recorded (what was suggested)
    │
    ├──▶ User action recorded (accepted/edited/ignored)
    │
    ├──▶ Final values recorded (what user actually submitted)
    │
    └──▶ Feedback data stored in smart_form_feedback table
         │
         └──▶ Weekly analysis:
              - Which suggestions have highest acceptance?
              - Which fields need better prompts?
              - Which categories have lowest confidence?
              → Prompt refinement cycle
```

---

## 17. Open Questions

| Question | Options | Recommendation |
|----------|---------|----------------|
| Streaming vs batch analysis | Stream partial results / Wait for full analysis | Batch for simplicity (streaming adds complexity) |
| A/B testing framework | Required / Optional | Optional at launch, add if user base grows |
| Admin override of lead scores | Allow / Disallow | Allow with audit logging |
| Multi-language at launch | EN only / EN + ZH | EN first, ZH in Phase 2 |
| Model upgrade path | GPT-4o-mini only / Allow GPT-4o for complex | GPT-4o-mini only (cost control) |
| Knowledge base integration | Include KB search in analysis / Separate | Separate (KB feature not yet built) |
| Mobile-specific UX | Same as desktop / Simplified | Simplified: collapse AI panel by default on mobile |
| Feedback collection | Inline thumbs up/down / Post-submit survey | Inline (lower friction) |

---

## Appendix A: Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Optional (with defaults)
SMART_FORM_RATE_LIMIT_ANALYZE=30
SMART_FORM_RATE_LIMIT_FOLLOWUP=60
SMART_FORM_RATE_LIMIT_VALIDATE=100
SMART_FORM_RATE_LIMIT_SCORE=50
SMART_FORM_RATE_LIMIT_SIMILAR=30
SMART_FORM_TOKEN_BUDGET_MONTHLY=500000
SMART_FORM_MONTHLY_COST_LIMIT=10.00
SMART_FORM_AI_ENABLED=true
SMART_FORM_LOG_LEVEL=info
```

## Appendix B: Testing Checklist

- [ ] Unit: PII stripping for all patterns (email, phone, IP, card, API keys)
- [ ] Unit: Input sanitization (injection patterns, control chars, length)
- [ ] Unit: Rule-based fallback (all category/priority combinations)
- [ ] Unit: Rate limiting (per user, per IP, global)
- [ ] Unit: Lead scoring algorithm (all signal combinations)
- [ ] Unit: Auto-fill priority resolution (conflict scenarios)
- [ ] Integration: /api/smart-form/analyze (contact + ticket forms)
- [ ] Integration: /api/smart-form/followup (EN + ZH)
- [ ] Integration: /api/smart-form/validate (all field types)
- [ ] Integration: /api/smart-form/score (all tiers)
- [ ] Integration: /api/smart-form/similar (with FTS)
- [ ] Integration: /api/smart-form/autofill (authenticated + anonymous)
- [ ] E2E: Contact form full flow with AI assistance
- [ ] E2E: Ticket form full flow with AI assistance
- [ ] E2E: Graceful degradation when AI unavailable
- [ ] E2E: Rate limit handling + user feedback
- [ ] E2E: Auto-fill consent flow
- [ ] E2E: Mobile responsive layout
- [ ] Security: Prompt injection attempts (10+ patterns)
- [ ] Security: Input length limits (boundary testing)
- [ ] Security: PII not leaked in logs or error responses
- [ ] Performance: Analysis response < 2s (P95)
- [ ] Performance: Form remains interactive during AI calls
- [ ] Accessibility: WCAG 2.1 AA (all AI elements)
- [ ] Accessibility: Screen reader testing (VoiceOver / NVDA)
- [ ] i18n: All strings in en.json and zh.json
- [ ] i18n: AI responds in correct language

---

*Document Version: 1.0 | Last Updated: 2026-07-05*
