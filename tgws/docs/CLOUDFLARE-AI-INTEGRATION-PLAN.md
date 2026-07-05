# TGWS Cloudflare Workers AI 集成方案

## 项目概述

**目标**：为TechGuru B2B IT服务网站集成AI能力，使用Cloudflare Workers AI作为免费AI服务。

**用户场景**：英文为主的IT经理/CTO（香港/东南亚）

**技术栈**：
- 前端：Next.js 16 + React 19
- 后端：Supabase + Sanity
- AI：Cloudflare Workers AI（免费）
- 部署：Vercel

---

## 一、架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    TGWS Website                                  │
├─────────────────────────────────────────────────────────────────┤
│  前端组件层                                                      │
│  ├── AIChatWidget (对话界面)                                     │
│  ├── AISearchBar (智能搜索)                                      │
│  └── TicketAssistant (工单助手)                                  │
├─────────────────────────────────────────────────────────────────┤
│  API路由层                                                       │
│  ├── /api/ai/chat (对话API)                                      │
│  ├── /api/ai/search (搜索API)                                    │
│  └── /api/ai/analyze-ticket (工单分析)                           │
├─────────────────────────────────────────────────────────────────┤
│  AI服务层                                                        │
│  ├── Cloudflare Workers AI (主模型)                              │
│  ├── 流式响应处理                                                │
│  └── 缓存层 (内存缓存)                                           │
├─────────────────────────────────────────────────────────────────┤
│  数据层                                                          │
│  ├── Supabase (用户、对话历史、工单)                              │
│  ├── Sanity (产品、博客、案例)                                    │
│  └── Redis (可选，外部缓存)                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户输入问题
    ↓
前端发送到 /api/ai/chat
    ↓
检查缓存 → 命中则直接返回
    ↓
未命中 → 调用Cloudflare Workers AI
    ↓
流式返回答案到前端
    ↓
保存到缓存 + 记录到Supabase
    ↓
用户看到答案
```

---

## 二、Cloudflare Workers AI 配置

### 2.1 注册和获取凭证

1. 访问 https://dash.cloudflare.com 注册账号
2. 在 "Workers & Pages" → "AI" 中获取 Account ID
3. 创建 API Token（权限：Workers AI Read）

### 2.2 支持的免费模型

| 模型 | 用途 | 免费额度 |
|------|------|----------|
| @cf/meta/llama-3.1-8b-instruct | 通用对话 | 每天10,000次 |
| @cf/mistralai/mistral-7b-instruct-v0.2 | 通用对话 | 每天10,000次 |
| @cf/baai/bge-base-en-v1.5 | 文本嵌入 | 每天10,000次 |

### 2.3 环境变量配置

```env
# .env.local
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
```

---

## 三、AI服务层实现

### 3.1 基础AI客户端

```typescript
// src/lib/ai/cloudflare-client.ts

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_MODEL = process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  success: boolean;
  answer?: string;
  error?: string;
  tokensUsed?: number;
}

export async function callCloudflareAI(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<AIResponse> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          max_tokens: options?.maxTokens || 1024,
          temperature: options?.temperature || 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      answer: data.result.response,
      tokensUsed: data.result.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error('Cloudflare AI error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### 3.2 流式响应处理

```typescript
// src/lib/ai/cloudflare-stream.ts

export async function callCloudflareAIStream(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    }
  );

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
}
```

### 3.3 缓存层

```typescript
// src/lib/ai/cache.ts

interface CacheEntry {
  answer: string;
  timestamp: number;
  tokensUsed: number;
}

class AICache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 100;
  private ttl: number = 3600000; // 1小时

  get(key: string): string | null {
    const entry = this.cache.get(key.toLowerCase().trim());
    
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key.toLowerCase().trim());
      return null;
    }
    
    return entry.answer;
  }

  set(key: string, answer: string, tokensUsed: number): void {
    // 如果缓存满了，删除最旧的
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key.toLowerCase().trim(), {
      answer,
      timestamp: Date.now(),
      tokensUsed,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const aiCache = new AICache();
```

---

## 四、API路由设计

### 4.1 对话API（流式）

```typescript
// src/app/api/ai/chat/route.ts

import { NextResponse } from 'next/server';
import { callCloudflareAIStream } from '@/lib/ai/cloudflare-stream';
import { aiCache } from '@/lib/ai/cache';

const SYSTEM_PROMPT = `You are TechGuru's AI assistant, specializing in IT infrastructure solutions. 
You help with:
- Network infrastructure (Build)
- Cloud and management services (Run)  
- Cybersecurity solutions (Protect)

Be professional, concise, and helpful. If you don't know something, say so.`;

export async function POST(request: Request) {
  try {
    const { question, conversationId } = await request.json();

    // 检查缓存
    const cachedAnswer = aiCache.get(question);
    if (cachedAnswer) {
      return new Response(cachedAnswer, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 流式调用AI
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullAnswer = '';
        
        await callCloudflareAIStream(
          [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: question },
          ],
          (chunk) => {
            fullAnswer += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        );

        // 保存到缓存
        aiCache.set(question, fullAnswer, 0);

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

### 4.2 工单分析API

```typescript
// src/app/api/ai/analyze-ticket/route.ts

import { NextResponse } from 'next/server';
import { callCloudflareAI } from '@/lib/ai/cloudflare-client';
import { aiCache } from '@/lib/ai/cache';

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    // 检查缓存
    const cacheKey = `ticket:${description}`;
    const cached = aiCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // 调用AI分析
    const result = await callCloudflareAI([
      {
        role: 'system',
        content: `Analyze this support ticket and return JSON with:
        - category: "build" | "run" | "protect"
        - priority: "low" | "medium" | "high" | "critical"
        - suggestedProducts: array of relevant products
        - replyDraft: professional reply template`,
      },
      { role: 'user', content: description },
    ]);

    if (result.success && result.answer) {
      // 尝试解析JSON
      try {
        const analysis = JSON.parse(result.answer);
        aiCache.set(cacheKey, result.answer, result.tokensUsed || 0);
        return NextResponse.json(analysis);
      } catch {
        // 如果不是JSON，返回原始答案
        return NextResponse.json({ rawAnswer: result.answer });
      }
    }

    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze ticket' },
      { status: 500 }
    );
  }
}
```

### 4.3 搜索API

```typescript
// src/app/api/ai/search/route.ts

import { NextResponse } from 'next/server';
import { callCloudflareAI } from '@/lib/ai/cloudflare-client';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    // 调用AI生成搜索建议
    const result = await callCloudflareAI([
      {
        role: 'system',
        content: `You are a search assistant for TechGuru IT services.
        Given a user query, suggest:
        1. 3-5 relevant search terms
        2. Which product category it relates to (build/run/protect)
        3. A brief explanation of what the user might be looking for`,
      },
      { role: 'user', content: query },
    ]);

    if (result.success && result.answer) {
      return NextResponse.json({ suggestions: result.answer });
    }

    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate search suggestions' },
      { status: 500 }
    );
  }
}
```

---

## 五、前端组件设计

### 5.1 AI对话组件

```typescript
// src/components/ai/AIChatWidget.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 流式获取回答
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantMessage;
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-[#00D4FF] text-white">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-semibold">TechGuru AI Assistant</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[#00D4FF] text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.role === 'assistant' && (
                <Bot size={16} className="inline mr-2 text-[#00D4FF]" />
              )}
              {msg.content || (isLoading && i === messages.length - 1 ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our IT solutions..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00D4FF]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00B8DB] disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 5.2 智能搜索组件

```typescript
// src/components/ai/AISearchBar.tsx

'use client';

import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

export default function AISearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (data.suggestions) {
        // 解析AI返回的建议
        const lines = data.suggestions.split('\n').filter((l: string) => l.trim());
        setSuggestions(lines.slice(0, 5));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for IT solutions, products, or ask a question..."
          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-4 p-4 bg-[#00D4FF]/5 rounded-xl border border-[#00D4FF]/20">
          <p className="text-sm font-medium text-gray-700 mb-2">AI Suggestions:</p>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-600">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## 六、工单助手集成

### 6.1 TicketForm AI增强

```typescript
// 在现有TicketForm中添加AI分析按钮

'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function TicketFormWithAI() {
  const [formData, setFormData] = useState({
    category: '',
    priority: '',
    subject: '',
    description: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeWithAI = async () => {
    if (!formData.description.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description }),
      });

      const analysis = await response.json();
      
      if (analysis.category) {
        setFormData(prev => ({ ...prev, category: analysis.category }));
      }
      if (analysis.priority) {
        setFormData(prev => ({ ...prev, priority: analysis.priority }));
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      {/* 描述输入框 */}
      <div className="relative">
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your issue..."
          className="w-full p-3 border border-gray-200 rounded-lg"
          rows={4}
        />
        <button
          onClick={analyzeWithAI}
          disabled={isAnalyzing || !formData.description.trim()}
          className="absolute bottom-2 right-2 p-2 text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg disabled:opacity-50"
          title="Analyze with AI"
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        </button>
      </div>

      {/* AI分析结果会自动填充到category和priority字段 */}
    </div>
  );
}
```

---

## 七、部署配置

### 7.1 Vercel环境变量

```env
# .env.local
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
```

### 7.2 CSP配置更新

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 添加Cloudflare API域名
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://api.cloudflare.com https://*.supabase.co https://*.sanity.io; ..."
          },
        ],
      },
    ];
  },
};
```

---

## 八、成本估算

### 免费额度使用

| 资源 | 免费额度 | 预估使用 | 是否够用 |
|------|----------|----------|----------|
| AI推理请求 | 10,000次/天 | 100次/天 | ✅ 充足 |
| Workers请求 | 100,000次/天 | 1,000次/天 | ✅ 充足 |
| 带宽 | 无限制 | 1GB/月 | ✅ 充足 |

### 成本对比

| 方案 | 月度成本 | 说明 |
|------|----------|------|
| Cloudflare Workers AI | $0 | 完全免费 |
| DeepSeek API | $0.22 | 超出免费额度后 |
| OpenAI GPT-4o-mini | $0.82 | 付费 |

**结论**：Cloudflare Workers AI是最佳免费方案

---

## 九、测试策略

### 9.1 单元测试

```typescript
// src/lib/ai/__tests__/cloudflare-client.test.ts

import { callCloudflareAI } from '../cloudflare-client';

describe('Cloudflare AI Client', () => {
  it('should return success response', async () => {
    const result = await callCloudflareAI([
      { role: 'user', content: 'Hello' }
    ]);
    expect(result.success).toBe(true);
    expect(result.answer).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // 模拟API错误
    const result = await callCloudflareAI([]);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 9.2 集成测试

```typescript
// 测试完整的对话流程
it('should handle complete chat flow', async () => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What services do you offer?' }),
  });

  expect(response.ok).toBe(true);
  expect(response.headers.get('content-type')).toContain('text/event-stream');
});
```

---

## 十、实施路线图

### 第一阶段：基础集成（1周）
- [ ] 注册Cloudflare账号，获取API凭证
- [ ] 实现AI客户端和缓存层
- [ ] 创建对话API（流式响应）
- [ ] 实现基础聊天组件

### 第二阶段：功能扩展（1周）
- [ ] 添加工单分析API
- [ ] 实现智能搜索API
- [ ] 集成到现有工单表单
- [ ] 优化用户体验（加载状态、错误处理）

### 第三阶段：优化完善（3天）
- [ ] 性能优化（缓存策略）
- [ ] 错误处理完善
- [ ] 测试覆盖
- [ ] 部署和文档

---

## 十一、总结

### 核心价值
1. **完全免费** — Cloudflare Workers AI提供每天10,000次免费请求
2. **用户体验好** — 流式响应 + 缓存 + 加载提示
3. **集成简单** — 直接在Next.js API路由中调用
4. **稳定可靠** — Cloudflare边缘网络，高可用性

### 技术亮点
1. **流式响应** — 用户感觉更快
2. **内存缓存** — 重复问题瞬间返回
3. **优雅降级** — AI不可用时返回错误提示
4. **可扩展架构** — 后续可轻松添加更多AI功能

### 下一步行动
1. 注册Cloudflare账号，获取API凭证
2. 开始第一阶段实施
3. 测试和优化

---

*方案版本：v1.0*
*创建时间：2026-07-05*
*项目：TGWS (TechGuru Network & Data Solutions)*
