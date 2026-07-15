# Ticket Trend Analysis Feature - Technical Design Document

**Version:** 1.0
**Date:** 2026-07-05
**Status:** Draft
**PRD Reference:** [S6.6] Ticket Statistics, [S17] Data Model, [S18] API Design
**Companion:** Smart Ticket Assistant Design Document

---

## 1. Feature Overview

### 1.1 What It Does

The Ticket Trend Analysis feature transforms raw ticket data into actionable business intelligence for TechGuru administrators. It provides:

| Capability | Description | User Impact |
|------------|-------------|-------------|
| **Real-time Dashboards** | Live-updating visualizations of ticket metrics | Instant operational awareness |
| **Historical Trend Analysis** | Time-series analysis of ticket patterns (daily/weekly/monthly/quarterly/yearly) | Identify seasonal patterns and long-term trends |
| **Predictive Forecasting** | AI-powered prediction of future ticket volume, category shifts, and resource needs | Proactive capacity planning |
| **Anomaly Detection** | Automatic detection of unusual spikes, drops, or pattern breaks | Early warning for emerging issues |
| **Performance Metrics** | SLA tracking, resolution time analysis, technician efficiency | Data-driven team management |
| **Customer Insights** | Customer behavior patterns, repeat customer analysis, satisfaction trends | Improved customer experience |
| **Automated Reports** | Scheduled PDF/CSV report generation and email delivery | Reduced manual reporting |
| **Smart Alerts** | Threshold-based notifications for critical metrics | Immediate response to issues |

### 1.2 Value Proposition

| Stakeholder | Benefit | Expected Impact |
|-------------|---------|-----------------|
| **Admin/Manager** | Real-time operational visibility | 50% faster decision-making |
| **Technicians** | Workload prediction and balancing | 30% better resource allocation |
| **Sales/BD** | Customer pain point identification | 25% better upsell targeting |
| **Management** | Strategic insights and SLA reporting | Data-driven decisions |
| **Customers** | Faster response due to proactive staffing | Higher satisfaction scores |

### 1.3 Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Charting** | Recharts | React-native, lightweight, SSR-compatible |
| **AI Predictions** | GPT-4o-mini | Cost-effective trend analysis and insights generation |
| **Data Processing** | Supabase SQL + Edge Functions | Server-side aggregation for performance |
| **Caching** | Next.js ISR + Redis-like in-memory cache | Reduce database load |
| **PDF Generation** | @react-pdf/renderer | Server-side PDF report generation |
| **Scheduling** | Vercel Cron Jobs | Automated report generation |

---

## 2. Data Analysis

### 2.1 Core Metrics Framework

#### 2.1.1 Volume Metrics

| Metric | Calculation | Granularity | Purpose |
|--------|-------------|-------------|---------|
| **Total Tickets** | COUNT(tickets) | Real-time | Overall workload |
| **New Tickets** | COUNT(tickets WHERE created_at >= period) | Hourly/Daily/Weekly | Intake rate |
| **Resolved Tickets** | COUNT(tickets WHERE status = 'resolved' AND resolved_at >= period) | Hourly/Daily/Weekly | Throughput |
| **Backlog** | COUNT(tickets WHERE status IN ('open', 'in_progress')) | Real-time | Pending work |
| **Net Ticket Flow** | New - Resolved per period | Daily/Weekly | Trend direction |

#### 2.1.2 Time-Based Metrics

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Average Resolution Time (ART)** | AVG(resolved_at - created_at) WHERE status = 'resolved' | Efficiency benchmark |
| **First Response Time** | AVG(first_comment_at - created_at) | Customer experience |
| **Mean Time to Assign (MTTA)** | AVG(assigned_at - created_at) WHERE assigned_to IS NOT NULL | Triage efficiency |
| **SLA Compliance Rate** | COUNT(resolved within SLA) / COUNT(total resolved) | Contract adherence |
| **Aging Tickets** | COUNT(tickets WHERE created_at < threshold AND status != 'resolved') | Risk identification |

#### 2.1.3 Distribution Metrics

| Metric | Dimensions | Purpose |
|--------|------------|---------|
| **By Status** | open, in_progress, resolved, closed | Pipeline health |
| **By Category** | build, run, protect | Product area analysis |
| **By Priority** | low, medium, high, critical | Urgency distribution |
| **By Product/Service** | product_service field | Product-specific trends |
| **By Customer** | user_id grouping | Customer behavior |
| **By Technician** | assigned_to grouping | Workload balance |

#### 2.1.4 Performance Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| **Resolution Rate** | Resolved / (Resolved + Backlog) × 100 | >85% |
| **First Contact Resolution (FCR)** | Resolved with 1 comment / Total resolved | >60% |
| **Reopen Rate** | Reopened tickets / Total resolved | <5% |
| **Escalation Rate** | Critical+High tickets / Total tickets | <15% |
| **Customer Satisfaction (CSAT)** | Average rating / 5 × 100 | >90% |

### 2.2 Derived Metrics

#### 2.2.1 Trend Indicators

```typescript
interface TrendIndicator {
  metric: string;
  current: number;
  previous: number;
  change: number;        // Percentage change
  direction: 'up' | 'down' | 'stable';
  significance: 'positive' | 'negative' | 'neutral';
}

// Example:
// {
//   metric: 'avg_resolution_time',
//   current: 4.2,        // hours
//   previous: 5.1,
//   change: -17.6,       // 17.6% improvement
//   direction: 'down',
//   significance: 'positive'
// }
```

#### 2.2.2 Efficiency Scores

```typescript
interface EfficiencyScore {
  category: string;
  score: number;           // 0-100
  components: {
    resolutionSpeed: number;   // Weight: 30%
    firstResponse: number;     // Weight: 25%
    slaCompliance: number;     // Weight: 25%
    customerSatisfaction: number; // Weight: 20%
  };
  benchmark: string;        // 'above_average' | 'average' | 'below_average'
}
```

---

## 3. Trend Detection

### 3.1 Statistical Methods

#### 3.1.1 Moving Averages

| Type | Window | Use Case |
|------|--------|----------|
| Simple Moving Average (SMA) | 7 days | Daily ticket volume smoothing |
| Exponential Moving Average (EMA) | 7 days | Weighted recent data emphasis |
| Weighted Moving Average (WMA) | 30 days | Monthly trend analysis |

```typescript
// Implementation
function calculateSMA(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }
  return result;
}

function calculateEMA(data: number[], window: number): number[] {
  const multiplier = 2 / (window + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push((data[i] - result[i - 1]) * multiplier + result[i - 1]);
  }
  return result;
}
```

#### 3.1.2 Seasonality Detection

```typescript
interface SeasonalPattern {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  peaks: number[];           // Indices of peak periods
  troughs: number[];         // Indices of low periods
  amplitude: number;         // Peak-to-trough ratio
  confidence: number;        // 0-1
}

// Detection algorithm:
// 1. Calculate daily/weekly/monthly averages
// 2. Identify recurring patterns
// 3. Measure amplitude (peak/trough ratio)
// 4. Calculate pattern confidence
```

#### 3.1.3 Anomaly Detection

| Method | Threshold | Application |
|--------|-----------|-------------|
| **Z-Score** | |z| > 2.5 | Single-day spikes |
| **IQR Method** | Outside Q1-1.5×IQR to Q3+1.5×IQR | Distribution outliers |
| **MAD (Median Absolute Deviation)** | > 3×MAD | Robust outlier detection |
| **Rolling Window** | > 2× rolling std dev | Contextual anomalies |

```typescript
interface Anomaly {
  id: string;
  timestamp: Date;
  metric: string;
  value: number;
  expectedRange: [number, number];
  severity: 'info' | 'warning' | 'critical';
  possibleCauses: string[];
  relatedTickets: string[];
}

// Example anomaly detection:
function detectAnomalies(
  data: TimeSeriesData[],
  method: 'zscore' | 'iqr' | 'mad' = 'zscore'
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const values = data.map(d => d.value);
  
  // Calculate statistics
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
  
  // Detect outliers
  data.forEach((point, index) => {
    const zScore = (point.value - mean) / stdDev;
    if (Math.abs(zScore) > 2.5) {
      anomalies.push({
        id: `anomaly-${index}`,
        timestamp: point.timestamp,
        metric: point.metric,
        value: point.value,
        expectedRange: [mean - 2 * stdDev, mean + 2 * stdDev],
        severity: Math.abs(zScore) > 3.5 ? 'critical' : 'warning',
        possibleCauses: identifyPossibleCauses(point, data),
        relatedTickets: []
      });
    }
  });
  
  return anomalies;
}
```

### 3.2 Pattern Recognition

#### 3.2.1 Category Shift Detection

```typescript
interface CategoryShift {
  category: 'build' | 'run' | 'protect';
  period: string;
  previousShare: number;   // Percentage
  currentShare: number;
  change: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  significance: 'statistical' | 'practical';
  possibleCauses: string[];
}

// Detection logic:
// 1. Calculate category distribution per period
// 2. Compare period-over-period changes
// 3. Apply chi-squared test for statistical significance
// 4. Identify potential causes (new product launch, security incident, etc.)
```

#### 3.2.2 Priority Escalation Patterns

```typescript
interface EscalationPattern {
  description: string;
  frequency: number;
  avgTimeToEscalation: number;
  commonTriggers: string[];
  affectedCategories: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Example patterns:
// - "Medium priority tickets escalated to Critical within 2 hours"
// - "Protect category tickets 3x more likely to escalate"
// - "Certain customers consistently submit high-priority tickets"
```

#### 3.2.3 Technician Workload Patterns

```typescript
interface WorkloadPattern {
  technicianId: string;
  avgTicketsPerDay: number;
  peakHours: number[];
  specialtyAreas: string[];
  resolutionTimeByCategory: Record<string, number>;
  utilizationRate: number;  // 0-100%
  burnoutRisk: 'low' | 'medium' | 'high';
}
```

---

## 4. Prediction Model

### 4.1 AI-Powered Forecasting

#### 4.1.1 GPT-4o-mini Integration

| Aspect | Implementation |
|--------|----------------|
| **Input** | Historical ticket data (last 90 days), current trends, external factors |
| **Processing** | GPT-4o-mini analyzes patterns and generates predictions |
| **Output** | Forecast values, confidence intervals, insights, recommendations |
| **Cost** | ~$0.05 per prediction batch (monthly forecast) |

#### 4.1.2 Prediction Prompts

```typescript
const FORECAST_PROMPT = `You are TechGuru's Ticket Trend Analyst. Analyze the following ticket data and provide forecasts.

## Input Data
- Time period: {period}
- Historical data: {historicalData}
- Current trends: {currentTrends}
- External factors: {externalFactors}

## Required Outputs

1. **Volume Forecast** (next 7/30/90 days)
   - Expected daily/weekly ticket counts
   - Confidence intervals (80% and 95%)
   - Seasonal adjustments

2. **Category Distribution Forecast**
   - Build/Run/Protect ratio predictions
   - Emerging category shifts
   - Product-specific trends

3. **Resource Requirements**
   - Recommended staffing levels
   - Skill mix requirements
   - Training needs identification

4. **Risk Indicators**
   - SLA compliance predictions
   - Potential bottleneck identification
   - Customer churn risk factors

5. **Actionable Recommendations**
   - Immediate actions (this week)
   - Short-term actions (this month)
   - Strategic recommendations (this quarter)

## Analysis Guidelines
- Consider historical seasonality
- Account for recent trend changes
- Factor in product launch cycles
- Consider regional business patterns (Hong Kong/SEA)
- Flag high-confidence vs speculative predictions

## Output Format
Return JSON with the following structure:
{
  "forecast": {
    "volume": { ... },
    "categories": { ... },
    "resources": { ... },
    "risks": [ ... ],
    "recommendations": [ ... ]
  },
  "confidence": {
    "overall": 0.0-1.0,
    "byMetric": { ... }
  },
  "metadata": {
    "dataPointsUsed": number,
    "modelVersion": "gpt-4o-mini",
    "generatedAt": "ISO timestamp"
  }
}`;
```

#### 4.1.3 Prediction Caching

| Prediction Type | Cache Duration | Invalidation Trigger |
|-----------------|----------------|---------------------|
| Daily forecast | 6 hours | New ticket volume spike |
| Weekly forecast | 24 hours | Manual refresh or anomaly |
| Monthly forecast | 7 days | Manual refresh |
| Resource forecast | 48 hours | Staffing change |

### 4.2 Statistical Forecasting

#### 4.2.1 Time Series Models

| Model | Use Case | Accuracy |
|-------|----------|----------|
| **ARIMA** | Short-term volume prediction | Medium-High |
| **Exponential Smoothing** | Trend + seasonality | Medium |
| **Prophet (simplified)** | Complex patterns with holidays | High |
| **Linear Regression** | Simple trend projection | Low-Medium |

```typescript
// Simplified ARIMA-like prediction
function predictVolume(
  historicalData: number[],
  forecastHorizon: number,
  seasonalityPeriod: number = 7
): { predictions: number[]; confidenceIntervals: [number[], number[]] } {
  // 1. Calculate trend
  const trend = calculateLinearTrend(historicalData);
  
  // 2. Calculate seasonal component
  const seasonal = calculateSeasonalComponent(historicalData, seasonalityPeriod);
  
  // 3. Calculate residuals
  const residuals = historicalData.map((val, i) => 
    val - trend[i] - seasonal[i % seasonalityPeriod]
  );
  
  // 4. Estimate residual variance
  const residualVariance = residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length;
  const residualStd = Math.sqrt(residualVariance);
  
  // 5. Generate predictions
  const predictions: number[] = [];
  const upper80: number[] = [];
  const lower80: number[] = [];
  const upper95: number[] = [];
  const lower95: number[] = [];
  
  for (let i = 0; i < forecastHorizon; i++) {
    const trendValue = trend[trend.length - 1] + trend.slope * (i + 1);
    const seasonalValue = seasonal[(historicalData.length + i) % seasonalityPeriod];
    const prediction = Math.max(0, trendValue + seasonalValue);
    
    predictions.push(prediction);
    
    // Confidence intervals widen with forecast horizon
    const horizonFactor = Math.sqrt(i + 1);
    upper80.push(prediction + 1.28 * residualStd * horizonFactor);
    lower80.push(Math.max(0, prediction - 1.28 * residualStd * horizonFactor));
    upper95.push(prediction + 1.96 * residualStd * horizonFactor);
    lower95.push(Math.max(0, prediction - 1.96 * residualStd * horizonFactor));
  }
  
  return {
    predictions,
    confidenceIntervals: [lower95, upper95]
  };
}
```

### 4.3 Hybrid Approach

```typescript
interface HybridForecast {
  statistical: {
    predictions: number[];
    confidence: number;
  };
  ai: {
    predictions: number[];
    confidence: number;
    insights: string[];
  };
  combined: {
    predictions: number[];
    confidence: number;
    weight: { statistical: number; ai: number };
  };
}

// Combine statistical and AI predictions
function combineForecasts(
  statistical: ForecastResult,
  ai: ForecastResult,
  historicalAccuracy: { statistical: number; ai: number }
): HybridForecast {
  // Weight by historical accuracy
  const totalAccuracy = historicalAccuracy.statistical + historicalAccuracy.ai;
  const statisticalWeight = historicalAccuracy.statistical / totalAccuracy;
  const aiWeight = historicalAccuracy.ai / totalAccuracy;
  
  const combinedPredictions = statistical.predictions.map((val, i) => 
    val * statisticalWeight + ai.predictions[i] * aiWeight
  );
  
  return {
    statistical: statistical,
    ai: ai,
    combined: {
      predictions: combinedPredictions,
      confidence: Math.max(statistical.confidence, ai.confidence),
      weight: { statistical: statisticalWeight, ai: aiWeight }
    }
  };
}
```

---

## 5. Visualization

### 5.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TICKET TREND ANALYSIS                               │
│  [Date Range: Last 30 Days ▼]  [Refresh]  [Export]  [Schedule Report]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Total Tickets│ │   Resolved   │ │  Avg Resolve │ │  SLA Comply  │       │
│  │    1,247     │ │     1,102    │ │    4.2 hrs   │ │    94.2%     │       │
│  │  ↑ 12.3%    │ │  ↑ 15.1%    │ │  ↓ 17.6%    │ │  ↑ 3.1%     │       │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                                             │
│  ┌────────────────────────────────────┐ ┌────────────────────────────────┐  │
│  │     TICKET VOLUME TREND            │ │     CATEGORY DISTRIBUTION      │  │
│  │  ┌─────────────────────────────┐  │ │  ┌──────────────────────────┐  │  │
│  │  │     📈 Line Chart           │  │ │  │    🍩 Donut Chart        │  │  │
│  │  │     (30-day trend)          │  │ │  │    Build: 35%            │  │  │
│  │  │                             │  │ │  │    Run: 45%              │  │  │
│  │  │     ╭────────╮              │  │ │  │    Protect: 20%          │  │  │
│  │  │  ╭──╯        ╰──╮          │  │ │  │                          │  │  │
│  │  │──╯              ╰────────  │  │ │  └──────────────────────────┘  │  │
│  │  └─────────────────────────────┘  │ └────────────────────────────────┘  │
│  │  [Daily] [Weekly] [Monthly]       │                                    │
│  └────────────────────────────────────┘ ┌────────────────────────────────┐  │
│                                         │     PRIORITY BREAKDOWN         │  │
│  ┌────────────────────────────────────┐ │  ┌──────────────────────────┐  │  │
│  │     RESOLUTION TIME DISTRIBUTION   │ │  │    📊 Stacked Bar        │  │  │
│  │  ┌─────────────────────────────┐  │ │  │    Critical: ██ 8%       │  │  │
│  │  │     📊 Histogram            │  │ │  │    High:     ████ 22%    │  │  │
│  │  │     <2h: 45%                │  │ │  │    Medium:   ██████ 52%  │  │  │
│  │  │     2-4h: 30%               │  │ │  │    Low:      ███ 18%     │  │  │
│  │  │     4-8h: 15%               │  │ │  └──────────────────────────┘  │  │
│  │  │     >8h: 10%                │  │ └────────────────────────────────┘  │
│  │  └─────────────────────────────┘  │                                     │
│  └────────────────────────────────────┘                                     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    AI-POWERED INSIGHTS                                 │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ 🔍 Trend Alert: Protect category tickets increased 23% this week     │  │
│  │ 📊 Forecast: Expect 15% volume increase next week                    │  │
│  │ ⚠️  Risk: 12 tickets approaching SLA breach                          │  │
│  │ 💡 Recommendation: Consider adding 1 security specialist             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌────────────────────────────────┐ ┌────────────────────────────────────┐  │
│  │  TECHNICIAN PERFORMANCE        │ │  TOP ISSUES                        │  │
│  │  ┌──────────────────────────┐ │ │  ┌──────────────────────────────┐  │  │
│  │  │ 1. John D.  - 45 tickets│ │ │  │ 1. Firewall config - 23 tix  │  │  │
│  │  │    Avg: 3.2h | CSAT: 4.8│ │ │  │ 2. VMware migration - 18 tix │  │  │
│  │  │ 2. Sarah L. - 38 tickets│ │ │  │ 3. Backup failure - 15 tix   │  │  │
│  │  │    Avg: 4.1h | CSAT: 4.6│ │ │  │ 4. Cloud sync issues - 12 tix│  │  │
│  │  │ 3. Mike W.  - 32 tickets│ │ │  │ 5. EDR alerts - 10 tix       │  │  │
│  │  │    Avg: 3.8h | CSAT: 4.7│ │ │  │                              │  │  │
│  │  └──────────────────────────┘ │ │  └──────────────────────────────┘  │  │
│  └────────────────────────────────┘ └────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    FORECAST & PREDICTIONS                             │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │              📈 Forecast Chart with Confidence Bands         │    │  │
│  │  │                                                             │    │  │
│  │  │  Historical ════════════╗                                   │    │  │
│  │  │  Forecast   ─ ─ ─ ─ ─ ─╬═══════════                        │    │  │
│  │  │  80% CI      ░░░░░░░░░░░░░░░░░░░░░░░                       │    │  │
│  │  │  95% CI      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                  │    │  │
│  │  │                                                             │    │  │
│  │  │  Today          +7 days          +30 days                    │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  │                                                                     │  │
│  │  Predicted Volume: 52 tickets (±8) next week                        │  │
│  │  Confidence Level: 87%                                               │  │
│  │  Key Factor: Protect category surge expected                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Chart Components

#### 5.2.1 Volume Trend Line Chart

```typescript
// src/components/analytics/charts/VolumeTrendChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VolumeTrendData {
  date: string;
  new: number;
  resolved: number;
  backlog: number;
}

interface VolumeTrendChartProps {
  data: VolumeTrendData[];
  timeframe: 'daily' | 'weekly' | 'monthly';
  showForecast?: boolean;
  forecastData?: VolumeTrendData[];
}

export default function VolumeTrendChart({ 
  data, 
  timeframe, 
  showForecast = false, 
  forecastData 
}: VolumeTrendChartProps) {
  const displayData = showForecast && forecastData 
    ? [...data, ...forecastData] 
    : data;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ticket Volume Trend</h3>
        <div className="flex gap-2">
          <TimeframeButton active={timeframe === 'daily'}>Daily</TimeframeButton>
          <TimeframeButton active={timeframe === 'weekly'}>Weekly</TimeframeButton>
          <TimeframeButton active={timeframe === 'monthly'}>Monthly</TimeframeButton>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
          <Legend />
          
          {/* Historical Data */}
          <Line 
            type="monotone" 
            dataKey="new" 
            stroke="#00D4FF" 
            strokeWidth={2}
            dot={{ fill: '#00D4FF', strokeWidth: 2 }}
            name="New Tickets"
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2 }}
            name="Resolved"
          />
          <Line 
            type="monotone" 
            dataKey="backlog" 
            stroke="#F59E0B" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Backlog"
          />
          
          {/* Forecast Line */}
          {showForecast && (
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#7B61FF" 
              strokeWidth={2}
              strokeDasharray="10 5"
              name="Forecast"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### 5.2.2 Category Distribution Donut Chart

```typescript
// src/components/analytics/charts/CategoryDistributionChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
  showTrends?: boolean;
}

const CATEGORY_COLORS = {
  build: '#00D4FF',
  run: '#7B61FF',
  protect: '#10B981'
};

export default function CategoryDistributionChart({ 
  data, 
  showTrends = true 
}: CategoryDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
      
      <div className="flex items-center gap-8">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || entry.color}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Tickets']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[item.name as keyof typeof CATEGORY_COLORS] || item.color }}
                />
                <span className="text-sm font-medium text-gray-700 capitalize">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{item.value}</span>
                <span className="text-sm font-medium">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
                {showTrends && item.change !== undefined && (
                  <span className={`text-xs ${item.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 5.2.3 Resolution Time Histogram

```typescript
// src/components/analytics/charts/ResolutionTimeChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResolutionBucket {
  range: string;
  count: number;
  percentage: number;
}

interface ResolutionTimeChartProps {
  data: ResolutionBucket[];
  target?: number;  // SLA target in hours
}

export default function ResolutionTimeChart({ data, target = 4 }: ResolutionTimeChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Resolution Time Distribution</h3>
        <span className="text-sm text-gray-500">Target: {target}h SLA</span>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="range" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip 
            formatter={(value: number) => [`${value} tickets (${((value / total) * 100).toFixed(1)}%)`, 'Count']}
          />
          <Bar 
            dataKey="count" 
            fill="#00D4FF"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {data.map((bucket) => (
          <div key={bucket.range} className="text-xs">
            <p className="text-gray-500">{bucket.range}</p>
            <p className="font-medium text-gray-700">{bucket.percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 5.2.4 Forecast with Confidence Bands

```typescript
// src/components/analytics/charts/ForecastChart.tsx
'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ForecastDataPoint {
  date: string;
  actual?: number;
  forecast?: number;
  lower80?: number;
  upper80?: number;
  lower95?: number;
  upper95?: number;
}

interface ForecastChartProps {
  historicalData: ForecastDataPoint[];
  forecastData: ForecastDataPoint[];
  confidenceLevel?: 80 | 95;
}

export default function ForecastChart({ 
  historicalData, 
  forecastData, 
  confidenceLevel = 95 
}: ForecastChartProps) {
  const combinedData = [...historicalData, ...forecastData];
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Volume Forecast</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-[#00D4FF]" /> Actual
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-[#7B61FF] border-dashed" /> Forecast
          </span>
          {confidenceLevel >= 80 && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 bg-[#7B61FF]/20" /> 80% CI
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-[#7B61FF]/10" /> 95% CI
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={combinedData}>
          <defs>
            <linearGradient id="forecastGradient80" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#7B61FF" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="forecastGradient95" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#7B61FF" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          
          {/* Confidence Bands */}
          <Area 
            type="monotone" 
            dataKey="upper95" 
            stroke="none" 
            fill="url(#forecastGradient95)"
            name="95% Upper"
          />
          <Area 
            type="monotone" 
            dataKey="lower95" 
            stroke="none" 
            fill="white"
            name="95% Lower"
          />
          
          <Area 
            type="monotone" 
            dataKey="upper80" 
            stroke="none" 
            fill="url(#forecastGradient80)"
            name="80% Upper"
          />
          <Area 
            type="monotone" 
            dataKey="lower80" 
            stroke="none" 
            fill="white"
            name="80% Lower"
          />
          
          {/* Forecast Line */}
          <Area 
            type="monotone" 
            dataKey="forecast" 
            stroke="#7B61FF"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="none"
            name="Forecast"
          />
          
          {/* Actual Data */}
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#00D4FF"
            strokeWidth={2}
            fill="none"
            name="Actual"
          />
          
          {/* Today Reference Line */}
          <ReferenceLine 
            x={new Date().toISOString().split('T')[0]} 
            stroke="#9CA3AF" 
            strokeDasharray="3 3"
            label="Today"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 5.3 Interactive Filters

```typescript
// src/components/analytics/filters/AnalyticsFilters.tsx
'use client';

import { useState } from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';

interface AnalyticsFiltersProps {
  onDateRangeChange: (range: DateRange) => void;
  onCategoryFilter: (categories: string[]) => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'pdf') => void;
  loading?: boolean;
}

interface DateRange {
  start: Date;
  end: Date;
  preset: '7d' | '30d' | '90d' | '1y' | 'custom';
}

export default function AnalyticsFilters({
  onDateRangeChange,
  onCategoryFilter,
  onRefresh,
  onExport,
  loading = false
}: AnalyticsFiltersProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRange['preset']>('30d');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['build', 'run', 'protect']);

  const presets = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
    { key: '1y', label: 'Last Year' },
    { key: 'custom', label: 'Custom' }
  ];

  const categories = [
    { key: 'build', label: 'Build', color: '#00D4FF' },
    { key: 'run', label: 'Run', color: '#7B61FF' },
    { key: 'protect', label: 'Protect', color: '#10B981' }
  ];

  const handlePresetChange = (preset: DateRange['preset']) => {
    setSelectedPreset(preset);
    const end = new Date();
    const start = new Date();
    
    switch (preset) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        return;
    }
    
    onDateRangeChange({ start, end, preset });
  };

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    onCategoryFilter(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Presets */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <div className="flex gap-1">
            {presets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => handlePresetChange(preset.key)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedPreset === preset.key
                    ? 'bg-[#00D4FF] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Category Filters */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategoryToggle(category.key)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  selectedCategories.includes(category.key)
                    ? 'border-transparent text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: selectedCategories.includes(category.key) ? category.color : undefined
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download size={16} />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onExport('csv')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                Export CSV
              </button>
              <button
                onClick={() => onExport('pdf')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Report Generation

### 6.1 Report Types

| Report | Frequency | Format | Audience | Content |
|--------|-----------|--------|----------|---------|
| **Daily Summary** | Daily (8 AM) | Email + PDF | Admins | Yesterday's metrics, anomalies, action items |
| **Weekly Performance** | Monday (9 AM) | PDF | Management | Week trends, technician performance, SLA compliance |
| **Monthly Executive** | 1st of month | PDF | Leadership | Strategic insights, forecasts, recommendations |
| **SLA Compliance** | Weekly | PDF | Sales/BD | Customer SLA status, breach risks |
| **Technician Report** | Weekly | PDF | Individual | Personal metrics, workload, efficiency |

### 6.2 Report Template Structure

```typescript
interface ReportTemplate {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'sla' | 'technician';
  schedule: string;  // Cron expression
  recipients: string[];
  sections: ReportSection[];
}

interface ReportSection {
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'insights' | 'forecast';
  dataSource: string;
  visualization?: 'line' | 'bar' | 'pie' | 'table';
  insightPrompt?: string;  // For AI-generated insights
}

// Example: Weekly Performance Report
const WEEKLY_REPORT_TEMPLATE: ReportTemplate = {
  id: 'weekly-performance',
  name: 'Weekly Performance Report',
  type: 'weekly',
  schedule: '0 9 * * 1',  // Every Monday at 9 AM
  recipients: ['admin@techguru-it.asia'],
  sections: [
    {
      title: 'Executive Summary',
      type: 'insights',
      dataSource: 'ticket_stats',
      insightPrompt: 'Summarize this week\'s ticket performance in 3-5 bullet points. Highlight improvements and areas needing attention.'
    },
    {
      title: 'Volume Trends',
      type: 'chart',
      dataSource: 'daily_volume',
      visualization: 'line'
    },
    {
      title: 'Category Distribution',
      type: 'chart',
      dataSource: 'category_stats',
      visualization: 'pie'
    },
    {
      title: 'Resolution Time Analysis',
      type: 'metrics',
      dataSource: 'resolution_times',
      visualization: 'bar'
    },
    {
      title: 'Technician Performance',
      type: 'table',
      dataSource: 'technician_stats'
    },
    {
      title: 'SLA Compliance',
      type: 'metrics',
      dataSource: 'sla_stats'
    },
    {
      title: 'Next Week Forecast',
      type: 'forecast',
      dataSource: 'volume_forecast',
      insightPrompt: 'Based on current trends, what should we expect next week? Include staffing recommendations.'
    },
    {
      title: 'Action Items',
      type: 'insights',
      dataSource: 'anomalies',
      insightPrompt: 'List the top 3 action items for next week based on this data.'
    }
  ]
};
```

### 6.3 PDF Generation

```typescript
// src/lib/reports/pdf-generator.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { WeeklyReport } from '@/components/reports/templates/WeeklyReport';

interface PDFReportOptions {
  template: ReportTemplate;
  data: ReportData;
  dateRange: { start: Date; end: Date };
}

export async function generatePDFReport(options: PDFReportOptions): Promise<Buffer> {
  const { template, data, dateRange } = options;
  
  // Generate AI insights for sections that need them
  const enrichedData = await enrichWithInsights(data, template.sections);
  
  // Render React component to PDF
  const buffer = await renderToBuffer(
    <WeeklyReport 
      template={template}
      data={enrichedData}
      dateRange={dateRange}
      generatedAt={new Date()}
    />
  );
  
  return buffer;
}

// src/components/reports/templates/WeeklyReport.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#00D4FF',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0A0A0F',
  },
  insightBox: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#00D4FF',
    padding: 12,
    marginBottom: 10,
  },
  insightText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.6,
  },
});

interface WeeklyReportProps {
  template: ReportTemplate;
  data: ReportData;
  dateRange: { start: Date; end: Date };
  generatedAt: Date;
}

export function WeeklyReport({ template, data, dateRange, generatedAt }: WeeklyReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Performance Report</Text>
          <Text style={styles.subtitle}>
            TechGuru Network & Data Solutions | {formatDateRange(dateRange)}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.insightBox}>
            <Text style={styles.insightText}>{data.insights.summary}</Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Tickets</Text>
            <Text style={styles.metricValue}>{data.metrics.total}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Resolved</Text>
            <Text style={styles.metricValue}>{data.metrics.resolved}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Avg Resolution Time</Text>
            <Text style={styles.metricValue}>{data.metrics.avgResolutionTime}h</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>SLA Compliance</Text>
            <Text style={styles.metricValue}>{data.metrics.slaCompliance}%</Text>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Generated Insights</Text>
          {data.insights.keyFindings.map((insight, index) => (
            <View key={index} style={styles.insightBox}>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>

        {/* Action Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          {data.insights.actionItems.map((action, index) => (
            <View key={index} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{index + 1}.</Text>
              <Text style={styles.metricValue}>{action}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
```

### 6.4 Email Delivery

```typescript
// src/lib/reports/email-sender.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReportEmailOptions {
  reportType: string;
  recipients: string[];
  pdfBuffer: Buffer;
  dateRange: { start: Date; end: Date };
  summary: string;
}

export async function sendReportEmail(options: ReportEmailOptions): Promise<void> {
  const { reportType, recipients, pdfBuffer, dateRange, summary } = options;
  
  const subject = `${reportType} Report - ${formatDateRange(dateRange)}`;
  
  await resend.emails.send({
    from: 'TechGuru Analytics <analytics@techguru-it.asia>',
    to: recipients,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Inter, sans-serif; color: #374151; line-height: 1.6; }
            .header { background: linear-gradient(135deg, #00D4FF, #7B61FF); padding: 30px; color: white; }
            .content { padding: 30px; }
            .summary { background: #F0F9FF; border-left: 4px solid #00D4FF; padding: 20px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #6B7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">${reportType} Report</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${formatDateRange(dateRange)}</p>
          </div>
          
          <div class="content">
            <div class="summary">
              <h3 style="margin-top: 0;">Executive Summary</h3>
              <p>${summary}</p>
            </div>
            
            <p>Please find the detailed report attached to this email.</p>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics" 
                 style="display: inline-block; padding: 12px 24px; background: #00D4FF; color: white; text-decoration: none; border-radius: 8px;">
                View Interactive Dashboard
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>TechGuru Network & Data Solutions</p>
            <p>This is an automated report. Do not reply to this email.</p>
          </div>
        </body>
      </html>
    `,
    attachments: [
      {
        filename: `${reportType.toLowerCase().replace(/\s+/g, '-')}-report.pdf`,
        content: pdfBuffer,
      }
    ]
  });
}
```

---

## 7. Alert System

### 7.1 Alert Types

| Alert Category | Trigger | Severity | Channel |
|----------------|---------|----------|---------|
| **SLA Breach Risk** | Ticket approaching SLA deadline | Warning | Email + Dashboard |
| **SLA Breach** | Ticket exceeded SLA | Critical | Email + Dashboard |
| **Anomaly Detected** | Unusual volume spike/drop | Info/Warning | Dashboard |
| **Category Surge** | >25% increase in category | Warning | Dashboard |
| **Technician Overload** | >X tickets assigned | Warning | Dashboard |
| **Resolution Time Spike** | ART exceeds baseline by 50% | Warning | Email + Dashboard |
| **System Error** | Analytics processing failure | Critical | Email |

### 7.2 Alert Configuration

```typescript
// src/lib/analytics/alerts/config.ts
interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: 'sla' | 'volume' | 'performance' | 'system';
  severity: 'info' | 'warning' | 'critical';
  condition: AlertCondition;
  actions: AlertAction[];
  enabled: boolean;
  cooldownMinutes: number;
}

interface AlertCondition {
  type: 'threshold' | 'anomaly' | 'trend' | 'prediction';
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'change_pct';
  value: number;
  timeWindow?: number;  // minutes
}

interface AlertAction {
  type: 'email' | 'dashboard' | 'webhook';
  config: Record<string, unknown>;
}

// Default alert rules
const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'sla-breach-risk',
    name: 'SLA Breach Risk',
    description: 'Ticket approaching SLA deadline within 1 hour',
    category: 'sla',
    severity: 'warning',
    condition: {
      type: 'threshold',
      metric: 'time_to_sla_breach',
      operator: 'lte',
      value: 60,  // minutes
      timeWindow: 15
    },
    actions: [
      { type: 'dashboard', config: { persistent: true } },
      { type: 'email', config: { recipients: ['admin@techguru-it.asia'] } }
    ],
    enabled: true,
    cooldownMinutes: 30
  },
  {
    id: 'sla-breach',
    name: 'SLA Breach',
    description: 'Ticket has exceeded SLA deadline',
    category: 'sla',
    severity: 'critical',
    condition: {
      type: 'threshold',
      metric: 'time_to_sla_breach',
      operator: 'lte',
      value: 0
    },
    actions: [
      { type: 'dashboard', config: { persistent: true } },
      { type: 'email', config: { recipients: ['admin@techguru-it.asia'] } }
    ],
    enabled: true,
    cooldownMinutes: 60
  },
  {
    id: 'volume-anomaly',
    name: 'Volume Anomaly',
    description: 'Unusual ticket volume detected',
    category: 'volume',
    severity: 'warning',
    condition: {
      type: 'anomaly',
      metric: 'hourly_tickets',
      operator: 'gt',
      value: 2.5,  // Z-score threshold
      timeWindow: 60
    },
    actions: [
      { type: 'dashboard', config: { persistent: false } }
    ],
    enabled: true,
    cooldownMinutes: 120
  },
  {
    id: 'category-surge',
    name: 'Category Surge',
    description: 'Significant increase in a specific category',
    category: 'volume',
    severity: 'warning',
    condition: {
      type: 'threshold',
      metric: 'category_change_pct',
      operator: 'gt',
      value: 25,  // 25% increase
      timeWindow: 1440  // 24 hours
    },
    actions: [
      { type: 'dashboard', config: { persistent: false } }
    ],
    enabled: true,
    cooldownMinutes: 360
  }
];
```

### 7.3 Alert Processing

```typescript
// src/lib/analytics/alerts/processor.ts
import { createClient } from '@/lib/supabase/server';

interface AlertProcessor {
  processMetricUpdates(): Promise<Alert[]>;
  checkAlertConditions(): Promise<TriggeredAlert[]>;
  sendAlertNotifications(alerts: TriggeredAlert[]): Promise<void>;
}

export class TicketAlertProcessor implements AlertProcessor {
  private supabase = createClient();
  private alertHistory = new Map<string, number>();  // alertId -> lastTriggered timestamp

  async processMetricUpdates(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // 1. Check SLA breach risks
    const slaAlerts = await this.checkSLABreaches();
    alerts.push(...slaAlerts);
    
    // 2. Check volume anomalies
    const volumeAlerts = await this.checkVolumeAnomalies();
    alerts.push(...volumeAlerts);
    
    // 3. Check category surges
    const categoryAlerts = await this.checkCategorySurges();
    alerts.push(...categoryAlerts);
    
    // 4. Check performance issues
    const performanceAlerts = await this.checkPerformanceIssues();
    alerts.push(...performanceAlerts);
    
    return alerts;
  }

  private async checkSLABreaches(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // Query tickets approaching SLA
    const { data: approachingTickets } = await this.supabase
      .from('tickets')
      .select('*')
      .in('status', ['open', 'in_progress'])
      .is('deleted_at', null);
    
    if (!approachingTickets) return alerts;
    
    for (const ticket of approachingTickets) {
      const timeToSLA = this.calculateTimeToSLA(ticket);
      
      if (timeToSLA <= 0) {
        // SLA breached
        alerts.push({
          id: `sla-breach-${ticket.id}`,
          type: 'sla_breach',
          severity: 'critical',
          title: 'SLA Breach',
          message: `Ticket ${ticket.ticket_number} has exceeded its SLA deadline`,
          ticketId: ticket.id,
          timestamp: new Date(),
          metadata: {
            ticketNumber: ticket.ticket_number,
            priority: ticket.priority,
            category: ticket.category
          }
        });
      } else if (timeToSLA <= 60) {
        // Approaching SLA
        alerts.push({
          id: `sla-risk-${ticket.id}`,
          type: 'sla_risk',
          severity: 'warning',
          title: 'SLA Breach Risk',
          message: `Ticket ${ticket.ticket_number} will breach SLA in ${Math.round(timeToSLA)} minutes`,
          ticketId: ticket.id,
          timestamp: new Date(),
          metadata: {
            ticketNumber: ticket.ticket_number,
            timeToBreach: timeToSLA,
            priority: ticket.priority
          }
        });
      }
    }
    
    return alerts;
  }

  private async checkVolumeAnomalies(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // Get hourly ticket counts for last 24 hours
    const { data: hourlyData } = await this.supabase
      .rpc('get_hourly_ticket_counts', { hours: 24 });
    
    if (!hourlyData || hourlyData.length < 12) return alerts;
    
    // Calculate Z-scores
    const counts = hourlyData.map((d: any) => d.count);
    const mean = counts.reduce((a: number, b: number) => a + b, 0) / counts.length;
    const stdDev = Math.sqrt(
      counts.reduce((sq: number, n: number) => sq + Math.pow(n - mean, 2), 0) / counts.length
    );
    
    // Check latest hour
    const latestCount = counts[counts.length - 1];
    const zScore = (latestCount - mean) / stdDev;
    
    if (Math.abs(zScore) > 2.5) {
      alerts.push({
        id: `volume-anomaly-${Date.now()}`,
        type: 'volume_anomaly',
        severity: zScore > 3 ? 'critical' : 'warning',
        title: 'Volume Anomaly Detected',
        message: `Ticket volume is ${zScore > 0 ? 'unusually high' : 'unusually low'} (${latestCount} tickets this hour vs avg ${Math.round(mean)})`,
        timestamp: new Date(),
        metadata: {
          currentCount: latestCount,
          averageCount: mean,
          zScore: zScore.toFixed(2),
          direction: zScore > 0 ? 'spike' : 'drop'
        }
      });
    }
    
    return alerts;
  }

  private async checkCategorySurges(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // Get current vs previous period counts by category
    const now = new Date();
    const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);  // Last 24 hours
    const previousStart = new Date(periodStart.getTime() - 24 * 60 * 60 * 1000);  // 24-48 hours ago
    
    const categories = ['build', 'run', 'protect'];
    
    for (const category of categories) {
      const [current, previous] = await Promise.all([
        this.supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('category', category)
          .gte('created_at', periodStart.toISOString())
          .is('deleted_at', null),
        this.supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('category', category)
          .gte('created_at', previousStart.toISOString())
          .lt('created_at', periodStart.toISOString())
          .is('deleted_at', null)
      ]);
      
      const currentCount = current.count || 0;
      const previousCount = previous.count || 0;
      
      if (previousCount > 0) {
        const changePct = ((currentCount - previousCount) / previousCount) * 100;
        
        if (changePct > 25) {
          alerts.push({
            id: `category-surge-${category}-${Date.now()}`,
            type: 'category_surge',
            severity: 'warning',
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Category Surge`,
            message: `${category} tickets increased by ${changePct.toFixed(1)}% (${currentCount} vs ${previousCount} in previous period)`,
            timestamp: new Date(),
            metadata: {
              category,
              currentCount,
              previousCount,
              changePct: changePct.toFixed(1)
            }
          });
        }
      }
    }
    
    return alerts;
  }

  private calculateTimeToSLA(ticket: any): number {
    // SLA definitions based on priority
    const slaHours: Record<string, number> = {
      critical: 4,
      high: 8,
      medium: 24,
      low: 72
    };
    
    const slaLimit = slaHours[ticket.priority] || 24;
    const createdAt = new Date(ticket.created_at);
    const deadline = new Date(createdAt.getTime() + slaLimit * 60 * 60 * 1000);
    const now = new Date();
    
    return (deadline.getTime() - now.getTime()) / (1000 * 60);  // Return minutes
  }
}
```

### 7.4 Dashboard Alert Display

```typescript
// src/components/analytics/AlertBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X, Bell, BellOff } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface AlertBannerProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export default function AlertBanner({ alerts, onAcknowledge, onDismiss }: AlertBannerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [expanded, setExpanded] = useState(true);
  
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const hasCritical = unacknowledgedAlerts.some(a => a.severity === 'critical');
  
  // Auto-expand on critical alerts
  useEffect(() => {
    if (hasCritical) {
      setExpanded(true);
    }
  }, [hasCritical]);
  
  if (unacknowledgedAlerts.length === 0) return null;
  
  const severityConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertTriangle className="text-red-500" size={20} />,
      textColor: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertCircle className="text-yellow-500" size={20} />,
      textColor: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="text-blue-500" size={20} />,
      textColor: 'text-blue-700'
    }
  };
  
  return (
    <div className="mb-6 space-y-2">
      {/* Alert Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className={hasCritical ? 'text-red-500' : 'text-yellow-500'} />
          <span className="text-sm font-medium text-gray-700">
            {unacknowledgedAlerts.length} active alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
            title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {isMuted ? <BellOff size={16} /> : <Bell size={16} />}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      
      {/* Alert List */}
      {expanded && (
        <div className="space-y-2">
          {unacknowledgedAlerts.slice(0, 5).map((alert) => {
            const config = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={`${config.bg} ${config.border} border rounded-xl p-4 flex items-start gap-3`}
              >
                <div className="mt-0.5">{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${config.textColor}`}>{alert.title}</h4>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {unacknowledgedAlerts.length > 5 && (
            <button className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2">
              View {unacknowledgedAlerts.length - 5} more alerts
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 8. API Design

### 8.1 Endpoint Structure

```
# Analytics Core
GET    /api/analytics/dashboard          # Dashboard summary data
GET    /api/analytics/trends             # Trend analysis data
GET    /api/analytics/forecast           # Forecast predictions
GET    /api/analytics/anomalies          # Detected anomalies

# Reports
GET    /api/analytics/reports            # List available reports
POST   /api/analytics/reports/generate   # Generate a report
GET    /api/analytics/reports/:id        # Get specific report
GET    /api/analytics/reports/:id/pdf    # Download report PDF

# Alerts
GET    /api/analytics/alerts             # Get active alerts
POST   /api/analytics/alerts/:id/acknowledge  # Acknowledge alert
POST   /api/analytics/alerts/:id/dismiss     # Dismiss alert
GET    /api/analytics/alerts/rules       # Get alert rules
PUT    /api/analytics/alerts/rules/:id   # Update alert rule

# Insights (AI)
POST   /api/analytics/insights/generate  # Generate AI insights
GET    /api/analytics/insights           # Get cached insights
```

### 8.2 Request/Response Formats

#### 8.2.1 Dashboard Summary

**Request:**
```typescript
GET /api/analytics/dashboard?period=30d&categories=build,run,protect
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "summary": {
      "totalTickets": 1247,
      "resolvedTickets": 1102,
      "openTickets": 145,
      "avgResolutionTime": 4.2,
      "slaCompliance": 94.2,
      "customerSatisfaction": 4.6
    },
    "trends": {
      "totalTickets": { "current": 1247, "previous": 1110, "change": 12.3, "direction": "up" },
      "resolvedTickets": { "current": 1102, "previous": 957, "change": 15.1, "direction": "up" },
      "avgResolutionTime": { "current": 4.2, "previous": 5.1, "change": -17.6, "direction": "down" },
      "slaCompliance": { "current": 94.2, "previous": 91.3, "change": 3.1, "direction": "up" }
    },
    "byCategory": {
      "build": { "count": 436, "percentage": 35.0 },
      "run": { "count": 561, "percentage": 45.0 },
      "protect": { "count": 250, "percentage": 20.0 }
    },
    "byPriority": {
      "critical": { "count": 100, "percentage": 8.0 },
      "high": { "count": 274, "percentage": 22.0 },
      "medium": { "count": 648, "percentage": 52.0 },
      "low": { "count": 225, "percentage": 18.0 }
    },
    "recentActivity": [
      {
        "id": "uuid",
        "ticketNumber": "TG-20260705-A1B2",
        "subject": "Firewall blocking Azure AD sync",
        "status": "resolved",
        "category": "protect",
        "resolvedAt": "2026-07-05T10:30:00Z"
      }
    ],
    "alerts": [
      {
        "id": "alert-123",
        "severity": "warning",
        "title": "SLA Breach Risk",
        "message": "5 tickets approaching SLA deadline",
        "timestamp": "2026-07-05T11:00:00Z"
      }
    ]
  },
  "meta": {
    "period": "30d",
    "generatedAt": "2026-07-05T12:00:00Z",
    "dataPoints": 1247
  }
}
```

#### 8.2.2 Trend Analysis

**Request:**
```typescript
GET /api/analytics/trends?metric=volume&granularity=daily&period=30d&forecast=true
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "metric": "volume",
    "granularity": "daily",
    "period": "30d",
    "historical": [
      { "date": "2026-06-06", "value": 38 },
      { "date": "2026-06-07", "value": 42 },
      // ... 30 days
    ],
    "statistics": {
      "mean": 41.6,
      "median": 40,
      "stdDev": 8.3,
      "min": 25,
      "max": 62,
      "trend": "increasing",
      "trendSlope": 0.5,
      "seasonality": {
        "detected": true,
        "period": "weekly",
        "peaks": ["monday", "tuesday"],
        "troughs": ["sunday"]
      }
    },
    "forecast": {
      "enabled": true,
      "predictions": [
        { "date": "2026-07-06", "value": 52, "lower80": 45, "upper80": 59, "lower95": 40, "upper95": 64 },
        // ... 14 days
      ],
      "confidence": 0.87,
      "keyFactors": [
        "Weekly seasonality pattern detected",
        "Overall upward trend of 0.5 tickets/day",
        "Protect category showing increased activity"
      ]
    }
  }
}
```

#### 8.2.3 Forecast

**Request:**
```typescript
POST /api/analytics/forecast
{
  "horizon": 14,           // Days to forecast
  "includeAI": true,       // Use GPT-4o-mini for enhanced insights
  "categories": ["build", "run", "protect"],
  "granularity": "daily"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "forecast": {
      "total": {
        "daily": [
          { "date": "2026-07-06", "predicted": 52, "ci80": [45, 59], "ci95": [40, 64] },
          // ... 14 days
        ],
        "weekly": [
          { "week": "2026-W28", "predicted": 364, "ci80": [320, 408], "ci95": [290, 438] }
        ]
      },
      "byCategory": {
        "build": { "daily": [...] },
        "run": { "daily": [...] },
        "protect": { "daily": [...] }
      }
    },
    "aiInsights": {
      "summary": "Expected 15% increase in ticket volume next week, primarily driven by Protect category. Recommend adding one security specialist to handle the surge.",
      "recommendations": [
        {
          "priority": "high",
          "action": "Increase security team capacity",
          "reason": "Protect tickets expected to rise 23% due to recent CVE announcements",
          "impact": "Could prevent SLA breaches for 8-10 tickets"
        },
        {
          "priority": "medium",
          "action": "Schedule VMware migration training",
          "reason": "Run category showing consistent upward trend",
          "impact": "Improved first-contact resolution rate"
        }
      ],
      "risks": [
        {
          "type": "sla_breach",
          "probability": 0.35,
          "description": "3-5 tickets may breach SLA without intervention"
        }
      ]
    },
    "confidence": 0.87,
    "generatedAt": "2026-07-05T12:00:00Z"
  }
}
```

#### 8.2.4 Generate Report

**Request:**
```typescript
POST /api/analytics/reports/generate
{
  "templateId": "weekly-performance",
  "dateRange": {
    "start": "2026-06-28",
    "end": "2026-07-05"
  },
  "recipients": ["admin@techguru-it.asia"],
  "format": "pdf"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "reportId": "report-uuid",
    "status": "generating",
    "estimatedCompletion": "2026-07-05T12:05:00Z",
    "downloadUrl": null  // Will be available when complete
  }
}
```

### 8.3 Database Queries

#### 8.3.1 Optimized Aggregation Queries

```sql
-- Dashboard summary (cached for 5 minutes)
CREATE MATERIALIZED VIEW analytics_dashboard_summary AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  category,
  priority,
  status,
  COUNT(*) as ticket_count,
  AVG(CASE 
    WHEN status = 'resolved' THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
    ELSE NULL 
  END) as avg_resolution_hours
FROM tickets
WHERE deleted_at IS NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), category, priority, status;

CREATE UNIQUE INDEX idx_dashboard_summary ON analytics_dashboard_summary (date, category, priority, status);

-- Refresh every 5 minutes
CREATE OR REPLACE FUNCTION refresh_dashboard_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_dashboard_summary;
END;
$$ LANGUAGE plpgsql;

-- SLA compliance calculation
CREATE OR REPLACE FUNCTION calculate_sla_compliance(
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
)
RETURNS TABLE(
  priority VARCHAR(20),
  total_tickets BIGINT,
  compliant_tickets BIGINT,
  compliance_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.priority,
    COUNT(*) as total_tickets,
    COUNT(CASE 
      WHEN t.resolved_at IS NOT NULL AND 
           EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600 <= 
           CASE t.priority
             WHEN 'critical' THEN 4
             WHEN 'high' THEN 8
             WHEN 'medium' THEN 24
             WHEN 'low' THEN 72
           END
      THEN 1
    END) as compliant_tickets,
    ROUND(
      COUNT(CASE 
        WHEN t.resolved_at IS NOT NULL AND 
             EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600 <= 
             CASE t.priority
               WHEN 'critical' THEN 4
               WHEN 'high' THEN 8
               WHEN 'medium' THEN 24
               WHEN 'low' THEN 72
             END
        THEN 1
      END)::DECIMAL / NULLIF(COUNT(*), 0) * 100,
      2
    ) as compliance_rate
  FROM tickets t
  WHERE t.created_at >= p_start_date
    AND t.created_at <= p_end_date
    AND t.deleted_at IS NULL
  GROUP BY t.priority;
END;
$$ LANGUAGE plpgsql;

-- Technician performance metrics
CREATE OR REPLACE FUNCTION get_technician_performance(
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
)
RETURNS TABLE(
  technician_id UUID,
  technician_name VARCHAR(100),
  tickets_assigned BIGINT,
  tickets_resolved BIGINT,
  avg_resolution_hours DECIMAL(5,2),
  avg_first_response_hours DECIMAL(5,2),
  sla_compliance_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id as technician_id,
    u.full_name as technician_name,
    COUNT(DISTINCT t.id) as tickets_assigned,
    COUNT(DISTINCT CASE WHEN t.status = 'resolved' THEN t.id END) as tickets_resolved,
    ROUND(AVG(CASE 
      WHEN t.resolved_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600
      ELSE NULL 
    END), 2) as avg_resolution_hours,
    ROUND(AVG(CASE 
      WHEN tc.id IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (tc.created_at - t.created_at)) / 3600
      ELSE NULL 
    END), 2) as avg_first_response_hours,
    ROUND(
      COUNT(DISTINCT CASE 
        WHEN t.resolved_at IS NOT NULL AND 
             EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600 <= 
             CASE t.priority
               WHEN 'critical' THEN 4
               WHEN 'high' THEN 8
               WHEN 'medium' THEN 24
               WHEN 'low' THEN 72
             END
        THEN t.id
      END)::DECIMAL / NULLIF(COUNT(DISTINCT CASE WHEN t.status = 'resolved' THEN t.id END), 0) * 100,
      2
    ) as sla_compliance_rate
  FROM users u
  JOIN tickets t ON t.assigned_to = u.id
  LEFT JOIN ticket_comments tc ON tc.ticket_id = t.id AND tc.user_id = t.assigned_to
  WHERE t.created_at >= p_start_date
    AND t.created_at <= p_end_date
    AND t.deleted_at IS NULL
    AND u.role IN ('admin', 'super_admin')
  GROUP BY u.id, u.full_name
  ORDER BY tickets_resolved DESC;
END;
$$ LANGUAGE plpgsql;
```

### 8.4 Caching Strategy

| Data Type | Cache Duration | Cache Key Pattern | Invalidation |
|-----------|----------------|-------------------|--------------|
| Dashboard summary | 5 minutes | `analytics:dashboard:{period}` | New ticket created |
| Trend data | 15 minutes | `analytics:trends:{metric}:{period}` | Every 15 min |
| Forecast | 6 hours | `analytics:forecast:{horizon}` | Manual refresh |
| Report | Until regenerated | `analytics:reports:{id}` | New report generated |
| Alert rules | 1 hour | `analytics:alert-rules` | Rule updated |

```typescript
// src/lib/analytics/cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const CACHE_TTL = {
  dashboard: 5 * 60,        // 5 minutes
  trends: 15 * 60,          // 15 minutes
  forecast: 6 * 60 * 60,    // 6 hours
  reports: 24 * 60 * 60,    // 24 hours
  alertRules: 60 * 60       // 1 hour
};

export async function getCachedData<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedData<T>(key: string, data: T, ttl: number): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(data));
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

---

## 9. Dashboard Integration

### 9.1 Admin Panel Navigation

```typescript
// src/app/[locale]/admin/layout.tsx additions
const adminNavigation = [
  // Existing
  { key: 'tickets', icon: Ticket, label: 'Tickets', href: '/admin/tickets' },
  { key: 'users', icon: Users, label: 'Users', href: '/admin/users' },
  
  // New Analytics Section
  { 
    key: 'analytics', 
    icon: BarChart3, 
    label: 'Analytics',
    children: [
      { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/admin/analytics' },
      { key: 'trends', icon: TrendingUp, label: 'Trends', href: '/admin/analytics/trends' },
      { key: 'forecast', icon: Brain, label: 'Forecast', href: '/admin/analytics/forecast' },
      { key: 'reports', icon: FileText, label: 'Reports', href: '/admin/analytics/reports' },
      { key: 'alerts', icon: Bell, label: 'Alerts', href: '/admin/analytics/alerts' },
    ]
  },
  
  // Existing
  { key: 'settings', icon: Settings, label: 'Settings', href: '/admin/settings' },
];
```

### 9.2 Page Structure

```
src/app/[locale]/admin/
├── layout.tsx                    # Admin layout with sidebar
├── tickets/
│   └── page.tsx                  # Ticket management (existing)
├── users/
│   └── page.tsx                  # User management (existing)
└── analytics/
    ├── layout.tsx                # Analytics sub-layout
    ├── page.tsx                  # Analytics dashboard (home)
    ├── trends/
    │   └── page.tsx              # Trend analysis page
    ├── forecast/
    │   └── page.tsx              # Forecast page
    ├── reports/
    │   ├── page.tsx              # Reports list
    │   └── [id]/
    │       └── page.tsx          # Individual report view
    └── alerts/
        └── page.tsx              # Alerts management
```

### 9.3 Analytics Dashboard Page

```typescript
// src/app/[locale]/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import AnalyticsFilters from '@/components/analytics/filters/AnalyticsFilters';
import MetricCards from '@/components/analytics/MetricCards';
import VolumeTrendChart from '@/components/analytics/charts/VolumeTrendChart';
import CategoryDistributionChart from '@/components/analytics/charts/CategoryDistributionChart';
import ResolutionTimeChart from '@/components/analytics/charts/ResolutionTimeChart';
import AIInsights from '@/components/analytics/AIInsights';
import AlertBanner from '@/components/analytics/AlertBanner';
import TechnicianPerformance from '@/components/analytics/TechnicianPerformance';

export default function AnalyticsDashboardPage() {
  const t = useTranslations('analytics');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    preset: '30d' as const
  });
  const [categories, setCategories] = useState(['build', 'run', 'protect']);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, categories]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
        categories: categories.join(',')
      });
      
      const response = await fetch(`/api/analytics/dashboard?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    // Implementation for export
  };

  if (loading && !data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ticket Trend Analysis</h1>
          <p className="text-gray-500 mt-1">Monitor ticket metrics, identify trends, and get AI-powered insights.</p>
        </div>

        {/* Filters */}
        <AnalyticsFilters
          onDateRangeChange={setDateRange}
          onCategoryFilter={setCategories}
          onRefresh={fetchDashboardData}
          onExport={handleExport}
          loading={loading}
        />

        {/* Alert Banner */}
        {data?.alerts && data.alerts.length > 0 && (
          <AlertBanner 
            alerts={data.alerts} 
            onAcknowledge={handleAcknowledgeAlert}
            onDismiss={handleDismissAlert}
          />
        )}

        {/* Metric Cards */}
        {data?.summary && (
          <MetricCards
            total={data.summary.totalTickets}
            resolved={data.summary.resolvedTickets}
            avgResolutionTime={data.summary.avgResolutionTime}
            slaCompliance={data.summary.slaCompliance}
            trends={data.trends}
          />
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {data && (
            <>
              <VolumeTrendChart
                data={data.volumeTrend}
                timeframe="daily"
              />
              
              <CategoryDistributionChart
                data={[
                  { name: 'build', value: data.byCategory.build.count, color: '#00D4FF' },
                  { name: 'run', value: data.byCategory.run.count, color: '#7B61FF' },
                  { name: 'protect', value: data.byCategory.protect.count, color: '#10B981' }
                ]}
                showTrends={true}
              />
              
              <ResolutionTimeChart
                data={data.resolutionTimeDistribution}
                target={4}
              />
              
              <TechnicianPerformance
                data={data.technicianPerformance}
              />
            </>
          )}
        </div>

        {/* AI Insights */}
        {data?.aiInsights && (
          <div className="mt-6">
            <AIInsights insights={data.aiInsights} />
          </div>
        )}
      </div>
    </div>
  );
}
```

### 9.4 Responsive Design

```typescript
// src/components/analytics/ResponsiveGrid.tsx
'use client';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export default function ResponsiveGrid({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6 
}: ResponsiveGridProps) {
  const gridClasses = `
    grid
    gap-${gap}
    grid-cols-${columns.sm || 1}
    md:grid-cols-${columns.md || columns.sm || 1}
    lg:grid-cols-${columns.lg || columns.md || columns.sm || 1}
    xl:grid-cols-${columns.xl || columns.lg || columns.md || columns.sm || 1}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}
```

---

## 10. Actionable Insights

### 10.1 Insight Categories

| Category | Insight Type | Action | Example |
|----------|--------------|--------|---------|
| **Capacity Planning** | Forecast-based | Staff adjustment | "Expected 20% volume increase next week - recommend adding 1 technician" |
| **SLA Management** | Risk-based | Prioritization | "5 tickets at risk of SLA breach - prioritize high-priority items" |
| **Process Improvement** | Trend-based | Workflow changes | "Average resolution time increased 15% - review escalation process" |
| **Product Issues** | Pattern-based | Product team notification | "23% surge in firewall tickets - potential product issue" |
| **Training Needs** | Performance-based | Team training | "Technician X has 40% longer resolution time for Protect tickets" |
| **Customer Health** | Behavior-based | Proactive outreach | "Customer Y submitted 5 tickets this week - schedule check-in" |

### 10.2 AI Insight Generation

```typescript
// src/lib/analytics/insights-generator.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface InsightGenerator {
  generateInsights(data: AnalyticsData): Promise<GeneratedInsights>;
  generateRecommendations(data: AnalyticsData): Promise<Recommendation[]>;
  identifyRisks(data: AnalyticsData): Promise<RiskAssessment>;
}

export class AIInsightGenerator implements InsightGenerator {
  async generateInsights(data: AnalyticsData): Promise<GeneratedInsights> {
    const prompt = this.buildInsightPrompt(data);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: INSIGHT_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const insights = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: insights.summary,
      keyFindings: insights.findings,
      trends: insights.trends,
      anomalies: insights.anomalies,
      recommendations: insights.recommendations,
      generatedAt: new Date(),
      confidence: insights.confidence || 0.8
    };
  }

  async generateRecommendations(data: AnalyticsData): Promise<Recommendation[]> {
    const prompt = this.buildRecommendationPrompt(data);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: RECOMMENDATION_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return result.recommendations.map((rec: any) => ({
      id: crypto.randomUUID(),
      priority: rec.priority,
      category: rec.category,
      title: rec.title,
      description: rec.description,
      expectedImpact: rec.impact,
      implementationEffort: rec.effort,
      timeframe: rec.timeframe,
      metrics: rec.metrics
    }));
  }

  async identifyRisks(data: AnalyticsData): Promise<RiskAssessment> {
    const prompt = this.buildRiskPrompt(data);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: RISK_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 600
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  private buildInsightPrompt(data: AnalyticsData): string {
    return `Analyze the following ticket data and provide insights:

## Current Period (${data.dateRange.start} to ${data.dateRange.end})

### Volume Metrics
- Total tickets: ${data.summary.totalTickets}
- Resolved: ${data.summary.resolvedTickets}
- Backlog: ${data.summary.openTickets}
- Change from previous period: ${data.trends.totalTickets.change}%

### Performance Metrics
- Average resolution time: ${data.summary.avgResolutionTime} hours (was ${data.trends.avgResolutionTime.previous} hours)
- SLA compliance: ${data.summary.slaCompliance}% (was ${data.trends.slaCompliance.previous}%)

### Category Distribution
- Build: ${data.byCategory.build.percentage}%
- Run: ${data.byCategory.run.percentage}%
- Protect: ${data.byCategory.protect.percentage}%

### Priority Distribution
- Critical: ${data.byPriority.critical.percentage}%
- High: ${data.byPriority.high.percentage}%
- Medium: ${data.byPriority.medium.percentage}%
- Low: ${data.byPriority.low.percentage}%

### Top Issues
${data.topIssues.map((issue, i) => `${i + 1}. ${issue.title} (${issue.count} tickets)`).join('\n')}

### Anomalies Detected
${data.anomalies.map(a => `- ${a.title}: ${a.description}`).join('\n')}

Provide:
1. A 2-3 sentence executive summary
2. 3-5 key findings
3. Notable trends
4. Anomalies that need attention
5. 2-3 actionable recommendations`;
  }
}
```

### 10.3 Insight Delivery

```typescript
// src/components/analytics/AIInsights.tsx
'use client';

import { useState } from 'react';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

interface AIInsightsProps {
  insights: GeneratedInsights;
  onRefresh: () => Promise<void>;
}

export default function AIInsights({ insights, onRefresh }: AIInsightsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI-Powered Insights</h3>
            <p className="text-sm text-gray-500">Generated {formatTimeAgo(insights.generatedAt)}</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="text-gray-700">{insights.summary}</p>
      </div>

      {/* Key Findings */}
      <div className="mb-4">
        <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Lightbulb size={16} className="text-yellow-500" />
          Key Findings
        </h4>
        <ul className="space-y-2">
          {insights.keyFindings.map((finding, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-cyan-500 mt-0.5">•</span>
              {finding}
            </li>
          ))}
        </ul>
      </div>

      {/* Trends */}
      {insights.trends.length > 0 && (
        <div className="mb-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <TrendingUp size={16} className="text-green-500" />
            Trends
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.trends.map((trend, index) => (
              <div key={index} className="bg-white rounded-lg p-3 text-sm">
                <span className="text-gray-700">{trend}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {insights.anomalies.length > 0 && (
        <div className="mb-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <AlertTriangle size={16} className="text-orange-500" />
            Needs Attention
          </h4>
          <ul className="space-y-2">
            {insights.anomalies.map((anomaly, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 rounded-lg p-3">
                <span className="mt-0.5">⚠</span>
                {anomaly}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Lightbulb size={16} className="text-blue-500" />
          Recommendations
        </h4>
        <div className="space-y-2">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Badge */}
      <div className="mt-4 flex items-center justify-end">
        <span className="text-xs text-gray-500">
          Confidence: {(insights.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
```

---

## 11. Security Considerations

### 11.1 Data Access Control

| Role | Dashboard Access | Export Access | Alert Management |
|------|------------------|---------------|------------------|
| **Super Admin** | Full | PDF + CSV | Full |
| **Admin** | Full | PDF + CSV | Acknowledge only |
| **Technician** | Own metrics only | None | View only |
| **Customer** | None | None | None |

### 11.2 API Security

```typescript
// Middleware for analytics endpoints
export async function analyticsAuthMiddleware(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userRole } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limiting
  const rateLimitKey = `analytics:${user.id}`;
  const requests = await incrementRateLimit(rateLimitKey, 60);  // 60 requests per minute
  
  if (requests > 60) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  return null;  // Continue to handler
}
```

### 11.3 Data Privacy

| Concern | Implementation |
|---------|----------------|
| Customer PII in analytics | Aggregate only, no individual customer data exposed |
| Technician performance | Individual metrics only visible to that technician and admins |
| Export security | Watermarked PDFs, logged downloads |
| Forecast data | Not stored longer than 90 days |

---

## 12. Implementation Timeline

### 12.1 Phase 1: Foundation (Week 1-2)

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Database schema extension | Migration scripts |
| 3-4 | Core API endpoints | `/api/analytics/dashboard`, `/api/analytics/trends` |
| 5-6 | Materialized views + caching | Performance optimization |
| 7-8 | Basic dashboard UI | Metric cards + charts |
| 9-10 | Testing + bug fixes | Unit + integration tests |

### 12.2 Phase 2: Intelligence (Week 3-4)

| Day | Task | Deliverable |
|-----|------|-------------|
| 11-12 | Forecast API + GPT-4o-mini integration | `/api/analytics/forecast` |
| 13-14 | Anomaly detection engine | Automated alerts |
| 15-16 | AI insights generator | Natural language insights |
| 17-18 | Alert system | Alert rules + notifications |
| 19-20 | Testing + optimization | Performance tuning |

### 12.3 Phase 3: Reporting (Week 5)

| Day | Task | Deliverable |
|-----|------|-------------|
| 21-22 | Report templates | PDF generation |
| 23-24 | Email delivery | Automated reports |
| 25 | Export functionality | CSV + PDF exports |
| 26 | Report scheduling | Cron job setup |
| 27 | Testing + polish | Final QA |

### 12.4 Phase 4: Polish (Week 6)

| Day | Task | Deliverable |
|-----|------|-------------|
| 28-29 | UI/UX refinement | Animations, responsive fixes |
| 30 | Accessibility audit | WCAG 2.1 AA compliance |
| 31 | Security review | Pen testing prep |
| 32 | Documentation | API docs, user guide |
| 33 | Staging deployment | Vercel preview |
| 34 | Production deploy | Go-live |
| 35 | Post-launch monitoring | Error tracking |

### 12.5 Milestones

| Milestone | Target | Criteria |
|-----------|--------|----------|
| M1: Dashboard Live | End of Week 2 | Basic metrics visible |
| M2: AI Insights | End of Week 4 | Forecasts + anomalies working |
| M3: Reports | End of Week 5 | Automated reports sending |
| M4: Production | End of Week 6 | Full feature set deployed |

---

## 13. Success Metrics

### 13.1 KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Dashboard Load Time** | < 2 seconds | Performance monitoring |
| **Forecast Accuracy** | > 80% | Prediction vs actual comparison |
| **Anomaly Detection Rate** | > 90% | True positives / total anomalies |
| **Report Generation Time** | < 30 seconds | End-to-end timing |
| **AI Insight Relevance** | > 85% | User feedback (thumbs up/down) |
| **User Adoption** | > 80% of admins | Daily active users |
| **Decision Impact** | Qualitative | Admin feedback on usefulness |

### 13.2 Monitoring

```typescript
// src/lib/analytics/monitoring.ts
export const analyticsMetrics = {
  // Performance
  dashboardLoadTime: histogram('analytics_dashboard_load_time_ms'),
  apiResponseTime: histogram('analytics_api_response_time_ms'),
  forecastGenerationTime: histogram('analytics_forecast_generation_time_ms'),
  
  // Usage
  dashboardViews: counter('analytics_dashboard_views_total'),
  reportDownloads: counter('analytics_report_downloads_total'),
  alertAcknowledgments: counter('analytics_alert_acknowledgments_total'),
  
  // Quality
  forecastAccuracy: gauge('analytics_forecast_accuracy'),
  anomalyDetectionRate: gauge('analytics_anomaly_detection_rate'),
  insightRelevance: gauge('analytics_insight_relevance_score')
};
```

---

## Appendix A: Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Analytics
ANALYTICS_CACHE_TTL=300          # 5 minutes
ANALYTICS_FORECAST_CACHE_TTL=21600  # 6 hours
ANALYTICS_REPORT_RETENTION_DAYS=90

# Alerts
ALERT_SLA_THRESHOLD_WARNING=60   # minutes before breach
ALERT_VOLUME_ANOMALY_THRESHOLD=2.5  # z-score
ALERT_CATEGORY_SURGE_THRESHOLD=25   # percentage

# Reports
RESEND_API_KEY=re_...
REPORT_EMAIL_FROM=analytics@techguru-it.asia
REPORT_STORAGE_BUCKET=reports

# Monitoring
ANALYTICS_LOG_LEVEL=info
ANALYTICS_ENABLE_METRICS=true
```

---

## Appendix B: Database Migration

```sql
-- Migration: Add analytics tables and views

-- 1. Analytics cache table (for non-SQL caching)
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_cache_key ON analytics_cache (cache_key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache (expires_at);

-- 2. Alert rules table
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  condition_config JSONB NOT NULL,
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  cooldown_minutes INTEGER DEFAULT 60,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Alert history table
CREATE TABLE alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES alert_rules(id),
  ticket_id UUID REFERENCES tickets(id),
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_history_rule ON alert_history (rule_id);
CREATE INDEX idx_alert_history_created ON alert_history (created_at);
CREATE INDEX idx_alert_history_unacknowledged ON alert_history (acknowledged) WHERE acknowledged = FALSE;

-- 4. Report history table
CREATE TABLE report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL,
  date_range_start TIMESTAMP NOT NULL,
  date_range_end TIMESTAMP NOT NULL,
  format VARCHAR(10) NOT NULL,
  file_url TEXT,
  status VARCHAR(20) DEFAULT 'generating',
  requested_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 5. Materialized view for dashboard summary
CREATE MATERIALIZED VIEW analytics_dashboard_summary AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  category,
  priority,
  status,
  COUNT(*) as ticket_count,
  AVG(CASE 
    WHEN status = 'resolved' AND resolved_at IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
    ELSE NULL 
  END) as avg_resolution_hours
FROM tickets
WHERE deleted_at IS NULL
  AND created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at), category, priority, status;

CREATE UNIQUE INDEX idx_dashboard_summary ON analytics_dashboard_summary (date, category, priority, status);

-- 6. Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_dashboard_summary;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to calculate SLA compliance
CREATE OR REPLACE FUNCTION calculate_sla_compliance(
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP
)
RETURNS TABLE(
  priority VARCHAR(20),
  total_tickets BIGINT,
  compliant_tickets BIGINT,
  compliance_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.priority,
    COUNT(*) as total_tickets,
    COUNT(CASE 
      WHEN t.resolved_at IS NOT NULL AND 
           EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600 <= 
           CASE t.priority
             WHEN 'critical' THEN 4
             WHEN 'high' THEN 8
             WHEN 'medium' THEN 24
             WHEN 'low' THEN 72
           END
      THEN 1
    END) as compliant_tickets,
    ROUND(
      COUNT(CASE 
        WHEN t.resolved_at IS NOT NULL AND 
             EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600 <= 
             CASE t.priority
               WHEN 'critical' THEN 4
               WHEN 'high' THEN 8
               WHEN 'medium' THEN 24
               WHEN 'low' THEN 72
             END
        THEN 1
      END)::DECIMAL / NULLIF(COUNT(*), 0) * 100,
      2
    ) as compliance_rate
  FROM tickets t
  WHERE t.created_at >= p_start_date
    AND t.created_at <= p_end_date
    AND t.deleted_at IS NULL
  GROUP BY t.priority;
END;
$$ LANGUAGE plpgsql;

-- 8. Enable RLS on new tables
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- 9. RLS policies
CREATE POLICY "Admins can manage alert rules" ON alert_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view alert history" ON alert_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage report history" ON report_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Service role can manage analytics cache" ON analytics_cache
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Appendix C: Testing Checklist

### Unit Tests
- [ ] Metric calculation functions
- [ ] Moving average calculations
- [ ] Anomaly detection algorithms
- [ ] SLA compliance calculations
- [ ] Cache invalidation logic

### Integration Tests
- [ ] Dashboard API endpoint
- [ ] Trends API endpoint
- [ ] Forecast API endpoint
- [ ] Alert processing
- [ ] Report generation

### E2E Tests
- [ ] Dashboard page load and display
- [ ] Filter interactions
- [ ] Chart rendering
- [ ] Alert acknowledgment
- [ ] Report download
- [ ] Export functionality

### Performance Tests
- [ ] Dashboard load time < 2s
- [ ] API response time < 500ms
- [ ] Forecast generation < 5s
- [ ] Report generation < 30s
- [ ] Concurrent user handling (50+ users)

### Security Tests
- [ ] Role-based access control
- [ ] API authentication
- [ ] Input validation
- [ ] Rate limiting
- [ ] Data privacy compliance

### Accessibility Tests
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Responsive design

---

*Document Version: 1.0 | Last Updated: 2026-07-05*
*Author: MiMoCode Agent*
*Status: Draft - Pending Review*
