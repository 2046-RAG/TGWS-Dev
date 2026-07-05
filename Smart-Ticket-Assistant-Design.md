# Smart Ticket Assistant - Technical Design Document

**Version:** 1.0
**Date:** 2026-07-05
**Status:** Draft
**PRD Reference:** [S6] Customer Ticket System

---

## 1. Feature Overview

### 1.1 What It Does

The Smart Ticket Assistant is an AI-powered feature that enhances the existing ticket submission workflow by:

1. **Auto-categorization** - Analyzes ticket description and suggests Build/Run/Protect category + specific product/service
2. **Priority Detection** - Infers urgency from keywords, business impact indicators, and system criticality
3. **Duplicate Detection** - Identifies similar existing tickets to prevent redundancy
4. **Solution Suggestions** - Provides instant troubleshooting steps for common issues before ticket creation
5. **Smart Routing** - Recommends the best technician based on expertise and current workload
6. **Sentiment Analysis** - Tracks customer frustration levels for escalation triggers

### 1.2 Value Proposition

| Benefit | Impact |
|---------|--------|
| Reduce ticket misclassification | 40% fewer reassignments |
| Faster first response | 60% reduction in initial triage time |
| Prevent duplicate tickets | 25% fewer redundant tickets |
| Improve customer satisfaction | Instant feedback vs waiting for human |
| Optimize technician allocation | 30% better workload distribution |

### 1.3 Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| AI Model | GPT-4o-mini | Cost-effective ($0.15/M input, $0.60/M output) |
| API | Next.js Route Handler | Existing pattern, no new infrastructure |
| Rate Limiting | In-memory + Supabase | Prevent abuse |
| Caching | React Query + localStorage | Reduce API calls |

---

## 2. User Flow

### 2.1 Happy Path - New Ticket with AI Assist

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TICKET CREATION FLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User starts typing description                                  │
│     │                                                               │
│     ▼                                                               │
│  2. Debounced analysis (500ms after last keystroke)                  │
│     │                                                               │
│     ▼                                                               │
│  3. AI analyzes description ──────────────────────────────────────┐ │
│     │                                                             │ │
│     ▼                                                             │ │
│  4. Suggestions appear (category, priority, products)             │ │
│     │                                                             │ │
│     ▼                                                             │ │
│  5. User accepts/edits suggestions                                │ │
│     │                                                             │ │
│     ▼                                                             │ │
│  6. Check for similar tickets ──────────────────────────────────┐ │ │
│     │                                                           │ │ │
│     ▼                                                           │ │ │
│  7. Show similar tickets if found ─────────────────────────────┐│ │ │
│     │                                                         ││ │ │
│     ▼                                                         ││ │ │
│  8. User decides: submit new or view existing                  ││ │ │
│     │                                                         ││ │ │
│     ▼                                                         ││ │ │
│  9. Submit ticket                                             ││ │ │
│     │                                                         ││ │ │
│     ▼                                                         ││ │ │
│  10. AI generates suggested resolution steps ────────────────┐││ │ │
│      │                                                       │││ │ │
│      ▼                                                       │││ │ │
│  11. Confirmation page with:                                 │││ │ │
│      - Ticket details                                        │││ │ │
│      - AI suggested next steps                               │││ │ │
│      - Estimated resolution time                             │││ │ │
│      - Assigned technician info                              │││ │ │
│                                                               │││ │ │
└───────────────────────────────────────────────────────────────┘││ │ │
                                                                ││ │ │
└───────────────────────────────────────────────────────────────┘││ │
                                                                ││ │
└───────────────────────────────────────────────────────────────┘││
                                                                ││
└───────────────────────────────────────────────────────────────┘│
                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 User Interactions

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Types description | Real-time character count |
| 2 | Stops typing (500ms) | "Analyzing your issue..." indicator |
| 3 | — | AI returns suggestions |
| 4 | Sees suggestions panel | Category, priority, products highlighted |
| 5 | Clicks "Accept" or edits | Form auto-populates |
| 6 | — | Similar tickets searched |
| 7 | Sees "Similar tickets found" | Expandable list with links |
| 8 | "Create anyway" or "View" | Proceeds or navigates |
| 9 | Clicks "Submit Ticket" | Ticket created |
| 10 | — | AI generates resolution steps |
| 11 | Views confirmation | Complete info with next steps |

### 2.3 Edge Cases

| Scenario | Handling |
|----------|----------|
| Description < 20 characters | Skip AI analysis, show "Please provide more details" |
| AI service unavailable | Graceful fallback, user can submit manually |
| Rate limit exceeded | Show "Try again in X seconds", allow manual submission |
| Multiple similar tickets | Show top 3, with "View all X similar tickets" |
| Ambiguous category | Show "Is this about X or Y?" clarifying question |

---

## 3. API Design

### 3.1 Endpoint Structure

```
POST /api/tickets/analyze          # Real-time description analysis
POST /api/tickets/similar          # Find similar tickets
GET  /api/tickets/:id/ai-suggest   # Get AI suggestions for existing ticket
POST /api/tickets/:id/ai-resolve   # Generate resolution steps
```

### 3.2 Request/Response Formats

#### 3.2.1 Analyze Description

**Request:**
```typescript
POST /api/tickets/analyze
{
  "description": "Our firewall is blocking all outbound traffic since this morning. Critical systems cannot reach cloud APIs.",
  "existingCategory": "protect",    // Optional: if user already selected
  "existingProduct": "",            // Optional: if user already selected
  "language": "en"                  // "en" or "zh"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "analysis": {
      "category": "protect",
      "categoryConfidence": 0.92,
      "suggestedProducts": [
        {
          "name": "Next-Generation Firewall (NGFW)",
          "confidence": 0.87,
          "reason": "Outbound traffic blocking is typical firewall issue"
        },
        {
          "name": "Web Application Firewall (WAF)",
          "confidence": 0.45,
          "reason": "If affecting web applications specifically"
        }
      ],
      "priority": "critical",
      "priorityReason": "Critical systems affected, business operations impacted",
      "sentiment": "frustrated",
      "keywords": ["firewall", "blocking", "outbound", "critical", "cloud APIs"],
      "estimatedImpact": "high",
      "urgencyIndicators": [
        "since this morning",
        "critical systems",
        "cannot reach"
      ]
    },
    "similarTickets": [
      {
        "id": "uuid-1",
        "ticketNumber": "TG-20260628-A1B2",
        "subject": "Firewall blocking Azure AD sync",
        "status": "resolved",
        "similarity": 0.78,
        "resolution": "Added exception rule for Azure IP range"
      }
    ],
    "quickSolution": {
      "available": true,
      "steps": [
        "Check firewall logs for blocked connections",
        "Verify if rule was recently modified",
        "Check if cloud provider IP ranges changed"
      ],
      "escalateTo": "human"  // "none" if auto-fixable
    }
  },
  "meta": {
    "tokensUsed": 847,
    "processingTime": 342,
    "model": "gpt-4o-mini"
  }
}
```

#### 3.2.2 Find Similar Tickets

**Request:**
```typescript
POST /api/tickets/similar
{
  "query": "firewall blocking outbound traffic",
  "category": "protect",
  "excludeTicketId": null,        // Exclude current ticket if editing
  "limit": 5
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "uuid",
        "ticketNumber": "TG-20260628-A1B2",
        "subject": "Firewall blocking Azure AD sync after upgrade",
        "description": "After upgrading to v8.2, Azure AD sync stopped...",
        "status": "resolved",
        "createdAt": "2026-06-15T10:30:00Z",
        "resolution": "Added Azure IP ranges to firewall whitelist",
        "matchScore": 0.82,
        "matchReasons": [
          "Both involve firewall blocking",
          "Both affect cloud connectivity",
          "Similar product: NGFW"
        ]
      }
    ],
    "totalFound": 3,
    "searchTime": 127
  }
}
```

#### 3.2.3 Generate Resolution Steps

**Request:**
```typescript
POST /api/tickets/:id/ai-resolve
{
  "includeHistory": true,         // Include ticket comments history
  "maxSteps": 5
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "ticketId": "uuid",
    "analysis": {
      "rootCauseHypothesis": "Firewall rule misconfiguration blocking cloud provider IPs",
      "confidence": 0.75,
      "relatedKnownIssues": [
        {
          "id": "KBA-001",
          "title": "Post-upgrade firewall rule migration",
          "url": "/knowledge-base/firewall-upgrade"
        }
      ]
    },
    "resolutionSteps": [
      {
        "step": 1,
        "action": "Check current firewall logs",
        "command": "show log firewall | grep blocked",
        "expectedResult": "List of blocked connections with destination IPs",
        "timeEstimate": "5 minutes",
        "requiresAdmin": true
      },
      {
        "step": 2,
        "action": "Compare with previous working configuration",
        "command": "show config firewall rules compare",
        "expectedResult": "Differences in rule sets",
        "timeEstimate": "10 minutes",
        "requiresAdmin": true
      }
    ],
    "estimatedResolutionTime": "30-45 minutes",
    "escalationPath": "Level 2 → Network Specialist → Vendor Support"
  },
  "meta": {
    "tokensUsed": 1243,
    "processingTime": 567,
    "model": "gpt-4o-mini"
  }
}
```

### 3.3 Rate Limiting

| Tier | Limit | Window | Scope |
|------|-------|--------|-------|
| Anonymous | 5 requests | 1 hour | IP-based |
| Authenticated | 30 requests | 1 hour | User ID |
| Admin | 100 requests | 1 hour | User ID |

---

## 4. Prompt Engineering

### 4.1 System Prompt for Ticket Analysis

```typescript
const TICKET_ANALYSIS_PROMPT = `You are TechGuru's AI Ticket Assistant for IT support ticket analysis.

## Role
Analyze IT support tickets and provide actionable insights for B2B infrastructure issues in Hong Kong/Southeast Asia.

## Categories (Build/Run/Protect)

### Build
- AIGC (Text-To-Video, Image-To-Video, AI Coding)
- AI Agent Development
- Legacy System AI Transformation

### Run
- Virtualization (VMware alternatives: Proxmox VE, Sangfor aSV, Sangfor HCI, Nutanix, Arcfra, H3C)
- Hyper-Converged Infrastructure (HCI)
- Cloud Platforms (Private, Public, Hybrid)
- Hardware (Servers, Storage, Modular Racks)
- Managed Cloud Services
- Business Continuity (DR-as-a-Service, Backup-as-a-Service)

### Protect
- Boundary: NGFW, IPS
- Application: WAF
- Endpoint: EDR, EPP, Antivirus
- Network: NDR, XDR
- Cloud: CASB, SASE, ZTNA
- Network Optimization: Traffic Management, Load Balancing, SD-WAN
- Managed Security: MDR, Penetration Testing
- Incident Response: Ransomware Response, Data Recovery

## Priority Levels

| Priority | Criteria |
|----------|----------|
| Critical | Production down, data loss risk, security breach, affects >100 users |
| High | Partial outage, degraded performance, workaround exists but limited |
| Medium | Feature not working, non-critical system affected, workaround available |
| Low | Question, enhancement request, minor issue |

## Output Requirements

Analyze the description and return:
1. category (build/run/protect) with confidence score
2. suggestedProducts[] with confidence and reasoning
3. priority (low/medium/high/critical) with reasoning
4. sentiment (neutral/positive/frustrated/angry)
5. urgencyIndicators[] - phrases indicating time sensitivity
6. estimatedImpact (low/medium/high)
7. keywords[] - important technical terms

## Important Notes
- Be specific to TechGuru's product lineup
- Consider regional context (Hong Kong/SEA timezone, compliance requirements)
- Flag security-related keywords (malware, breach, unauthorized access) as high priority
- If description mentions multiple products, rank by relevance
- Always provide reasoning for your classifications`;
```

### 4.2 Prompt for Resolution Suggestions

```typescript
const RESOLUTION_PROMPT = `You are TechGuru's AI support engineer generating resolution steps.

## Context
- Company: TechGuru Network & Data Solutions
- Region: Hong Kong/Southeast Asia
- Products: Build/Run/Protect IT infrastructure solutions
- Customers: B2B IT managers, CTOs, system administrators

## Response Format

Provide resolution steps in this structure:
1. Root cause hypothesis with confidence
2. Numbered resolution steps with:
   - Clear action description
   - CLI commands (if applicable)
   - Expected outcome
   - Time estimate
   - Whether admin access is required
3. Estimated total resolution time
4. Escalation path if not resolved

## Guidelines
- Start with least invasive steps
- Consider rollback procedures
- Include verification steps after each action
- Flag if customer should not attempt (escalate to TechGuru)
- Reference official documentation when available
- Account for regional specifics (e.g., data residency for HK/SEA)

## Security Considerations
- Never suggest disabling security controls permanently
- Always recommend enabling after testing
- Flag if issue might indicate compromise
- Suggest involving security team if suspicious activity detected`;
```

### 4.3 Prompt for Similar Ticket Detection

```typescript
const SIMILARITY_PROMPT = `You are a ticket matching assistant. Compare a new ticket description against existing tickets.

## Task
Determine if a new issue is similar to existing resolved tickets.

## Matching Criteria
1. Same product/service affected
2. Similar symptoms or error messages
3. Same root cause category
4. Overlapping keywords (at least 3 significant terms)

## Output
For each potential match:
- Match score (0-1)
- Matching reasons (specific phrases/keywords)
- Whether the resolution might apply

## Important
- Be strict: only flag truly similar issues
- False negatives are worse than false positives
- Consider that same symptoms can have different causes
- Note if the existing ticket was NOT resolved successfully`;
```

---

## 5. Frontend Component Design

### 5.1 Component Architecture

```
src/components/tickets/
├── TicketForm.tsx              # Existing (enhanced)
├── SmartAssistant/
│   ├── index.tsx               # Main container
│   ├── AnalysisPanel.tsx       # Shows AI suggestions
│   ├── SimilarTickets.tsx      # Displays similar tickets
│   ├── QuickSolution.tsx       # Instant troubleshooting
│   ├── LoadingIndicator.tsx    # "Analyzing..." state
│   └── hooks/
│       ├── useTicketAnalysis.ts  # Debounced analysis hook
│       └── useSimilarTickets.ts  # Similar tickets hook
```

### 5.2 SmartAssistant Component

```typescript
// src/components/tickets/SmartAssistant/index.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTicketAnalysis } from './hooks/useTicketAnalysis';
import { useSimilarTickets } from './hooks/useSimilarTickets';
import AnalysisPanel from './AnalysisPanel';
import SimilarTickets from './SimilarTickets';
import QuickSolution from './QuickSolution';
import LoadingIndicator from './LoadingIndicator';

interface SmartAssistantProps {
  description: string;
  category: string;
  product: string;
  onSuggestionApply: (suggestion: TicketSuggestion) => void;
  language?: 'en' | 'zh';
}

interface TicketSuggestion {
  category: string;
  priority: string;
  products: Array<{ name: string; confidence: number }>;
  similarTickets: SimilarTicket[];
}

export default function SmartAssistant({
  description,
  category,
  product,
  onSuggestionApply,
  language = 'en'
}: SmartAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSimilar, setShowSimilar] = useState(false);

  const {
    analysis,
    loading: analysisLoading,
    error: analysisError,
    tokensUsed
  } = useTicketAnalysis(description, category, product, language);

  const {
    similarTickets,
    loading: similarLoading
  } = useSimilarTickets(description, category, showSimilar);

  // Auto-apply if high confidence
  useEffect(() => {
    if (analysis?.categoryConfidence > 0.9 && !category) {
      onSuggestionApply({
        category: analysis.category,
        priority: analysis.priority,
        products: analysis.suggestedProducts,
        similarTickets: similarTickets || []
      });
    }
  }, [analysis, similarTickets, category, onSuggestionApply]);

  if (!description || description.length < 20) {
    return null; // Don't show until enough content
  }

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="font-medium text-gray-800">Smart Assistant</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Loading State */}
          {analysisLoading && <LoadingIndicator />}

          {/* Analysis Results */}
          {analysis && !analysisLoading && (
            <AnalysisPanel
              analysis={analysis}
              currentCategory={category}
              currentProduct={product}
              onApply={(s) => onSuggestionApply({ ...s, similarTickets: similarTickets || [] })}
            />
          )}

          {/* Similar Tickets Toggle */}
          {analysis?.similarTickets?.length > 0 && (
            <button
              onClick={() => setShowSimilar(!showSimilar)}
              className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {analysis.similarTickets.length} similar ticket(s) found
                </span>
                <span className="text-xs text-cyan-600">
                  {showSimilar ? 'Hide' : 'View'}
                </span>
              </div>
            </button>
          )}

          {/* Similar Tickets List */}
          {showSimilar && similarTickets && (
            <SimilarTickets
              tickets={similarTickets}
              loading={similarLoading}
            />
          )}

          {/* Quick Solution */}
          {analysis?.quickSolution?.available && (
            <QuickSolution solution={analysis.quickSolution} />
          )}

          {/* Token Usage (Dev only) */}
          {process.env.NODE_ENV === 'development' && tokensUsed && (
            <div className="text-xs text-gray-400 text-right">
              Tokens: {tokensUsed} | Cost: ${(tokensUsed * 0.0000003).toFixed(6)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 5.3 AnalysisPanel Component

```typescript
// src/components/tickets/SmartAssistant/AnalysisPanel.tsx
'use client';

import { CheckCircle, AlertTriangle, TrendingUp, Tag } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: TicketAnalysis;
  currentCategory: string;
  currentProduct: string;
  onApply: (suggestion: Partial<TicketSuggestion>) => void;
}

export default function AnalysisPanel({
  analysis,
  currentCategory,
  currentProduct,
  onApply
}: AnalysisPanelProps) {
  const confidenceColor = (conf: number) =>
    conf >= 0.8 ? 'text-green-600' : conf >= 0.6 ? 'text-yellow-600' : 'text-gray-500';

  return (
    <div className="space-y-3">
      {/* Category Suggestion */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Category</span>
          <span className={`text-xs ${confidenceColor(analysis.categoryConfidence)}`}>
            {(analysis.categoryConfidence * 100).toFixed(0)}% confident
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-cyan-500" />
          <span className="text-gray-900 font-medium capitalize">
            {analysis.category}
          </span>
          {!currentCategory && (
            <button
              onClick={() => onApply({ category: analysis.category })}
              className="ml-auto text-xs text-cyan-600 hover:text-cyan-700"
            >
              Apply
            </button>
          )}
        </div>
      </div>

      {/* Priority */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Priority</span>
          <span className="text-xs text-gray-500">AI detected</span>
        </div>
        <div className="flex items-center gap-2">
          {analysis.priority === 'critical' || analysis.priority === 'high' ? (
            <AlertTriangle size={14} className="text-orange-500" />
          ) : (
            <TrendingUp size={14} className="text-green-500" />
          )}
          <span className={`text-gray-900 font-medium capitalize ${
            analysis.priority === 'critical' ? 'text-red-600' :
            analysis.priority === 'high' ? 'text-orange-600' : ''
          }`}>
            {analysis.priority}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{analysis.priorityReason}</p>
      </div>

      {/* Suggested Products */}
      {analysis.suggestedProducts.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <span className="text-sm font-medium text-gray-700 block mb-2">
            Suggested Products
          </span>
          <div className="space-y-2">
            {analysis.suggestedProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className={confidenceColor(product.confidence)} />
                  <span className="text-sm text-gray-700">{product.name}</span>
                </div>
                <span className={`text-xs ${confidenceColor(product.confidence)}`}>
                  {(product.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Customer sentiment:</span>
        <span className={`font-medium ${
          analysis.sentiment === 'angry' ? 'text-red-600' :
          analysis.sentiment === 'frustrated' ? 'text-orange-600' :
          'text-green-600'
        }`}>
          {analysis.sentiment}
        </span>
        {analysis.sentiment === 'frustrated' || analysis.sentiment === 'angry' ? (
          <span className="text-orange-500">• May need priority escalation</span>
        ) : null}
      </div>
    </div>
  );
}
```

### 5.4 Loading Indicator

```typescript
// src/components/tickets/SmartAssistant/LoadingIndicator.tsx
'use client';

export default function LoadingIndicator() {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className="relative">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-200 border-t-cyan-500 animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-cyan-600">
          AI
        </span>
      </div>
      <div>
        <p className="text-sm text-gray-700">Analyzing your issue...</p>
        <p className="text-xs text-gray-500">Checking products and similar tickets</p>
      </div>
    </div>
  );
}
```

### 5.5 Similar Tickets Component

```typescript
// src/components/tickets/SmartAssistant/SimilarTickets.tsx
'use client';

import { ExternalLink, CheckCircle, Clock } from 'lucide-react';

interface SimilarTicketsProps {
  tickets: SimilarTicket[];
  loading: boolean;
}

export default function SimilarTickets({ tickets, loading }: SimilarTicketsProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) return null;

  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white rounded-lg p-3 border border-gray-200 hover:border-cyan-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {ticket.subject}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {ticket.description}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              {ticket.status === 'resolved' ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : (
                <Clock size={14} className="text-yellow-500" />
              )}
              <span className="text-xs text-gray-500 capitalize">
                {ticket.status}
              </span>
            </div>
          </div>

          {ticket.resolution && (
            <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
              <span className="font-medium">Resolution:</span> {ticket.resolution}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Match: {(ticket.matchScore * 100).toFixed(0)}%
            </span>
            <a
              href={`/support/tickets/${ticket.id}`}
              className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View details <ExternalLink size={10} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 5.6 Hooks

```typescript
// src/components/tickets/SmartAssistant/hooks/useTicketAnalysis.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TicketAnalysis {
  category: string;
  categoryConfidence: number;
  suggestedProducts: Array<{
    name: string;
    confidence: number;
    reason: string;
  }>;
  priority: string;
  priorityReason: string;
  sentiment: string;
  keywords: string[];
  estimatedImpact: string;
  urgencyIndicators: string[];
}

export function useTicketAnalysis(
  description: string,
  category: string,
  product: string,
  language: string
) {
  const [analysis, setAnalysis] = useState<TicketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async () => {
    if (!description || description.length < 20) {
      setAnalysis(null);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tickets/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          existingCategory: category,
          existingProduct: product,
          language
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.data.analysis);
      setTokensUsed(data.meta?.tokensUsed || 0);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        // Graceful fallback - don't block ticket submission
        setAnalysis(null);
      }
    } finally {
      setLoading(false);
    }
  }, [description, category, product, language]);

  // Debounced analysis
  useEffect(() => {
    const timer = setTimeout(analyze, 500);
    return () => clearTimeout(timer);
  }, [analyze]);

  return { analysis, loading, error, tokensUsed };
}
```

---

## 6. Data Flow Architecture

### 6.1 High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TicketForm                                                         │
│    │                                                                │
│    ├──▶ useTicketAnalysis hook ──────────────────────────────┐     │
│    │                                                         │     │
│    └──▶ useSimilarTickets hook ──────────────────────────┐  │     │
│                                                          │  │     │
│  SmartAssistant ◀────────────────────────────────────────┘  │     │
│    │                                                        │     │
│    ▼                                                        │     │
│  AnalysisPanel                                              │     │
│    │                                                        │     │
│    ▼                                                        │     │
│  onSuggestionApply()                                        │     │
│    │                                                        │     │
│    ▼                                                        │     │
│  Form state updated ◀───────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  POST /api/tickets/analyze                                         │
│    │                                                                │
│    ├──▶ Rate Limiter (in-memory + Supabase)                       │
│    │                                                                │
│    ├──▶ Input Validation (Zod)                                     │
│    │                                                                │
│    ├──▶ OpenAI API (GPT-4o-mini)                                   │
│    │     │                                                          │
│    │     ├── System prompt (cached)                                 │
│    │     ├── User description                                       │
│    │     └── Product catalog (from Sanity)                          │
│    │                                                                │
│    └──▶ Response transformation                                     │
│                                                                     │
│  POST /api/tickets/similar                                         │
│    │                                                                │
│    ├──▶ Supabase full-text search                                  │
│    │     │                                                          │
│    │     └── tickets table (FTS index)                              │
│    │                                                                │
│    └──▶ Similarity scoring                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  OpenAI API                                                        │
│    ├── GPT-4o-mini for analysis                                    │
│    ├── Token tracking                                               │
│    └── Fallback: rule-based categorization                         │
│                                                                     │
│  Supabase                                                          │
│    ├── tickets table (FTS)                                         │
│    ├── ticket_audit_log                                            │
│    └── Rate limiting counters                                      │
│                                                                     │
│  Sanity (cached)                                                    │
│    └── Product catalog for context                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|----------------|-----|--------------|
| Product catalog | Memory (server) | 1 hour | Sanity webhook |
| Analysis results | React Query | 5 minutes | User typing |
| Similar tickets | React Query | 10 minutes | New ticket created |
| Rate limit counters | In-memory | 1 hour | Sliding window |

### 6.3 Database Schema Extensions

```sql
-- Add AI analysis metadata to tickets table
ALTER TABLE tickets ADD COLUMN ai_analysis JSONB;
ALTER TABLE tickets ADD COLUMN ai_suggested_category VARCHAR(20);
ALTER TABLE tickets ADD COLUMN ai_suggested_priority VARCHAR(20);
ALTER TABLE tickets ADD COLUMN ai_confidence DECIMAL(3,2);

-- New table for AI usage tracking
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ticket_id UUID REFERENCES tickets(id),
  endpoint VARCHAR(50),
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10,6),
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for similar ticket search
CREATE INDEX tickets_search_idx ON tickets
  USING GIN (
    to_tsvector('english', subject || ' ' || description)
  );

-- Index for AI usage tracking
CREATE INDEX ai_usage_user_date_idx ON ai_usage_log (user_id, created_at);
```

---

## 7. Error Handling & Fallback Strategies

### 7.1 Error Scenarios

| Error | Impact | Fallback |
|-------|--------|----------|
| OpenAI API down | No AI suggestions | Form works normally, show "AI unavailable" |
| Rate limit exceeded | Temporary block | Allow manual submission, show cooldown timer |
| Invalid response | No analysis | Skip AI, user fills manually |
| Network timeout | Delay | 10s timeout, then fallback |
| Malicious input | Security risk | Input sanitization, prompt injection protection |

### 7.2 Fallback Implementation

```typescript
// src/lib/ai/fallback.ts

interface FallbackResult {
  category: string | null;
  priority: string | null;
  source: 'ai' | 'rule-based' | 'manual';
}

export function ruleBasedCategorization(description: string): FallbackResult {
  const lowerDesc = description.toLowerCase();

  // Rule-based category detection
  let category: string | null = null;
  const keywords: Record<string, string[]> = {
    build: ['aigc', 'ai agent', 'machine learning', 'development', 'custom'],
    run: ['server', 'vmware', 'proxmox', 'cloud', 'backup', 'storage', 'hci'],
    protect: ['firewall', 'security', 'virus', 'malware', 'breach', 'waf', 'edr']
  };

  for (const [cat, words] of Object.entries(keywords)) {
    if (words.some(word => lowerDesc.includes(word))) {
      category = cat;
      break;
    }
  }

  // Rule-based priority detection
  let priority: string | null = null;
  const urgentWords = ['critical', 'down', 'urgent', 'emergency', 'production', ' outage'];
  const highWords = ['important', 'blocking', 'cannot', 'failed', 'error'];

  if (urgentWords.some(word => lowerDesc.includes(word))) {
    priority = 'critical';
  } else if (highWords.some(word => lowerDesc.includes(word))) {
    priority = 'high';
  } else {
    priority = 'medium';
  }

  return { category, priority, source: 'rule-based' };
}
```

### 7.3 Rate Limiting Implementation

```typescript
// src/lib/ai/rate-limit.ts

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  analyze: { windowMs: 60 * 60 * 1000, maxRequests: 30 },      // 30/hour
  similar: { windowMs: 60 * 60 * 1000, maxRequests: 60 },      // 60/hour
  resolve: { windowMs: 60 * 60 * 1000, maxRequests: 20 }       // 20/hour
};

// In-memory store (use Redis in production at scale)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  userId: string,
  endpoint: string
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[endpoint];
  if (!config) return { allowed: true, remaining: 999, resetIn: 0 };

  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetTime - now
  };
}
```

### 7.4 Security Measures

| Threat | Protection |
|--------|------------|
| Prompt injection | Input sanitization, system prompt hardening |
| Token exhaustion | Rate limiting per user |
| Data leakage | No PII in logs, masked in responses |
| Abuse | CAPTCHA for anonymous, stricter limits |

```typescript
// src/lib/ai/sanitize.ts

export function sanitizeForAI(input: string): string {
  // Remove potential prompt injection patterns
  let sanitized = input
    .replace(/ignore\s+(previous|all|above)\s+instructions?/gi, '')
    .replace(/you\s+are\s+now\s+/gi, '')
    .replace(/system\s*:\s*/gi, '')
    .replace(/assistant\s*:\s*/gi, '');

  // Limit length
  if (sanitized.length > 2000) {
    sanitized = sanitized.slice(0, 2000);
  }

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  return sanitized;
}
```

---

## 8. Cost Estimation

### 8.1 Token Usage Projections

| Operation | Avg Input Tokens | Avg Output Tokens | Frequency/Day |
|-----------|------------------|-------------------|---------------|
| Description Analysis | 400 | 150 | 50 |
| Similar Ticket Search | 200 | 100 | 30 |
| Resolution Generation | 600 | 400 | 20 |
| **Daily Total** | **28,000** | **10,500** | - |

### 8.2 Monthly Cost Breakdown

| Component | Calculation | Cost (USD) |
|-----------|-------------|------------|
| Input tokens | 28,000 × 30 × $0.15/M | $0.126 |
| Output tokens | 10,500 × 30 × $0.60/M | $0.189 |
| **AI API Total** | - | **$0.32/month** |
| Infrastructure | Vercel serverless (included) | $0 |
| Storage | Supabase (included) | $0 |
| **Total Monthly** | - | **$0.32/month** |

### 8.3 Scaling Projections

| Usage Level | Tickets/Day | Monthly AI Cost | Notes |
|-------------|-------------|-----------------|-------|
| Low | 10-20 | $0.15 | Startup phase |
| Medium | 50-100 | $0.50 | Growing adoption |
| High | 200-500 | $2.50 | Full deployment |
| Enterprise | 1000+ | $12.00 | May need caching optimization |

### 8.4 Cost Optimization Strategies

1. **Response Caching**: Cache similar analysis for same descriptions (5 min TTL)
2. **Batch Processing**: Process multiple analyses in single API call when possible
3. **Model Selection**: Use GPT-4o-mini for analysis, reserve GPT-4 for complex resolutions
4. **Local Fallback**: Rule-based categorization for simple cases (0 cost)
5. **Token Limiting**: Truncate descriptions over 1500 chars

---

## 9. Security Considerations

### 9.1 Data Privacy

| Requirement | Implementation |
|-------------|----------------|
| PII in AI context | Strip emails, phone numbers before sending to OpenAI |
| Data retention | AI logs retained 30 days, then purged |
| User consent | "AI-powered analysis" notice in UI |
| Right to opt-out | Toggle to disable AI features |
| GDPR compliance | No training data sent, API data not retained by OpenAI |

### 9.2 Prompt Security

```typescript
// Security measures for AI prompts

const SECURITY_MEASURES = {
  // 1. Input sanitization
  inputSanitization: {
    stripControlChars: true,
    maxLength: 2000,
    blockPatterns: [
      /ignore\s+previous\s+instructions/gi,
      /system\s*:\s*/gi,
      /you\s+are\s+now/gi
    ]
  },

  // 2. Output validation
  outputValidation: {
    validateSchema: true,
    maxOutputLength: 500,
    allowedCategories: ['build', 'run', 'protect'],
    allowedPriorities: ['low', 'medium', 'high', 'critical']
  },

  // 3. Rate limiting
  rateLimiting: {
    perUser: 30,  // requests per hour
    perIP: 100,   // for anonymous
    global: 1000  // system-wide cap
  },

  // 4. Monitoring
  monitoring: {
    logPromptInjectionAttempts: true,
    alertOnAnomalies: true,
    trackTokenUsage: true
  }
};
```

### 9.3 API Security

| Layer | Protection |
|-------|------------|
| Authentication | Supabase Auth JWT validation |
| Authorization | Role-based (customer/admin) |
| Input validation | Zod schema validation |
| Rate limiting | Per-user + global limits |
| Output sanitization | XSS prevention |
| Logging | No sensitive data in logs |

### 9.4 OpenAI Data Handling

| Concern | Mitigation |
|---------|------------|
| Training data | API data not used for training (Enterprise tier) |
| Data retention | Zero data retention policy enabled |
| Encryption | TLS 1.3 for all API calls |
| Access control | API keys in env vars, rotated quarterly |

---

## 10. Implementation Timeline

### 10.1 Week 1: Foundation (Days 1-5)

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Database schema extension | Migration script |
| 1 | Rate limiting middleware | `src/lib/ai/rate-limit.ts` |
| 2 | Input sanitization | `src/lib/ai/sanitize.ts` |
| 2 | Fallback categorization | `src/lib/ai/fallback.ts` |
| 3 | POST /api/tickets/analyze | Basic endpoint |
| 3 | OpenAI client setup | `src/lib/openai.ts` |
| 4 | System prompt implementation | `src/lib/ai/prompts.ts` |
| 4 | Analysis response schema | Zod validation |
| 5 | Unit tests | Rate limit, sanitization, fallback |

### 10.2 Week 2: Core Features (Days 6-10)

| Day | Task | Deliverable |
|-----|------|-------------|
| 6 | POST /api/tickets/similar | Similarity search |
| 6 | FTS index creation | Database migration |
| 7 | useTicketAnalysis hook | React hook |
| 7 | useSimilarTickets hook | React hook |
| 8 | SmartAssistant component | Main container |
| 8 | AnalysisPanel component | UI panel |
| 9 | LoadingIndicator | Loading state |
| 9 | SimilarTickets component | Similar list |
| 10 | Integration testing | End-to-end flow |

### 10.3 Week 3: Enhancement (Days 11-15)

| Day | Task | Deliverable |
|-----|------|-------------|
| 11 | POST /api/tickets/:id/ai-resolve | Resolution endpoint |
| 11 | Resolution prompt | Enhanced prompt |
| 12 | QuickSolution component | UI component |
| 12 | Sentiment analysis integration | Enhanced analysis |
| 13 | Error boundaries | Graceful fallbacks |
| 13 | Monitoring/logging | OpenTelemetry setup |
| 14 | Accessibility audit | WCAG 2.1 AA |
| 14 | Performance optimization | Caching, debouncing |
| 15 | Security review | Pen testing prep |

### 10.4 Week 4: Polish & Launch (Days 16-20)

| Day | Task | Deliverable |
|-----|------|-------------|
| 16 | E2E tests (Playwright) | Critical paths |
| 16 | Load testing | 100 concurrent users |
| 17 | UI polish | Animations, transitions |
| 17 | Mobile responsive | Touch interactions |
| 18 | Documentation | API docs, user guide |
| 18 | Admin dashboard | Usage analytics |
| 19 | Staging deployment | Vercel preview |
| 19 | QA testing | Bug fixes |
| 20 | Production deploy | Go-live |
| 20 | Post-launch monitoring | Error tracking |

### 10.5 Milestones

| Milestone | Target Date | Criteria |
|-----------|-------------|----------|
| M1: API Ready | End of Week 1 | All endpoints functional |
| M2: UI Complete | End of Week 2 | Full user flow working |
| M3: Feature Complete | End of Week 3 | All features implemented |
| M4: Production Ready | End of Week 4 | Deployed and monitored |

---

## 11. Success Metrics

### 11.1 KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| AI Classification Accuracy | >85% | Compare AI suggestion vs actual category |
| User Acceptance Rate | >70% | Suggestions accepted without edit |
| Time Saved per Ticket | >30 seconds | Before vs after AI assist |
| Duplicate Ticket Reduction | >20% | Month-over-month comparison |
| Customer Satisfaction | >4.5/5 | Post-ticket survey |

### 11.2 Monitoring Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI ASSISTANT ANALYTICS                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Today's Usage          │  Accuracy Metrics                        │
│  ────────────────       │  ─────────────────                       │
│  API Calls: 47          │  Category: 89%                           │
│  Tokens: 12,450         │  Priority: 92%                           │
│  Cost: $0.012           │  Products: 76%                           │
│                         │                                           │
│  User Feedback          │  Performance                             │
│  ────────────────       │  ─────────────────                       │
│  Accepted: 34 (72%)     │  Avg Response: 342ms                     │
│  Edited: 9 (19%)        │  P95 Response: 890ms                     │
│  Ignored: 4 (9%)        │  Timeout Rate: 0.2%                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 12. Open Questions

| Question | Options | Recommendation |
|----------|---------|----------------|
| OpenAI model selection | GPT-4o vs GPT-4o-mini | GPT-4o-mini (cost) |
| Streaming responses | Yes/No | Yes (better UX) |
| Multi-language support | EN/ZH at launch | EN first, ZH in Week 5 |
| A/B testing | Required/Optional | Optional (small user base) |
| Feedback collection | Inline/Survey | Inline (thumbs up/down) |
| Admin override | Allow/Disallow | Allow for priority changes |

---

## Appendix A: Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Optional (with defaults)
AI_RATE_LIMIT_ANALYZE=30
AI_RATE_LIMIT_SIMILAR=60
AI_RATE_LIMIT_RESOLVE=20
AI_TOKEN_BUDGET_MONTHLY=1000000
AI_LOG_LEVEL=info
```

## Appendix B: Testing Checklist

- [ ] Unit tests for rate limiting
- [ ] Unit tests for input sanitization
- [ ] Unit tests for fallback categorization
- [ ] Integration tests for /api/tickets/analyze
- [ ] Integration tests for /api/tickets/similar
- [ ] E2E test: Full ticket creation flow with AI
- [ ] E2E test: Graceful degradation when AI unavailable
- [ ] E2E test: Rate limit handling
- [ ] Security test: Prompt injection attempts
- [ ] Security test: Input length limits
- [ ] Performance test: Response time < 2s
- [ ] Accessibility test: WCAG 2.1 AA compliance

---

*Document Version: 1.0 | Last Updated: 2026-07-05*
