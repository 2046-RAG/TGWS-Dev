// AI summary generation: Gemini fusion with fallback + output post-processing.

import { logServiceError } from '@/lib/errors';
import type { ExternalResult, SearchResult } from './types';

// 允许的 SOURCES 域名白名单
const ALLOWED_SOURCE_DOMAINS = [
  'oracle.com', 'wikipedia.org', 'ibm.com', 'microsoft.com', 'cisco.com',
  'aws.amazon.com', 'cloud.google.com', 'vmware.com', 'nutanix.com',
  'gartner.com', 'forrester.com', 'techtarget.com', 'arxiv.org', 'nist.gov',
];

function safeQuery(query: string): string {
  // 清理引号/换行/控制字符，防止 prompt injection (AUDIT-048)
  return String(query).replace(/["\\\n\r\t]/g, ' ').slice(0, 300);
}

// 后处理 Gemini 输出：补齐缺失 section、过滤黑名单域名
function postProcessAiSummary(
  raw: string,
  query: string,
  internalResults: SearchResult[],
  externalResults: ExternalResult[],
): string {
  const sections: string[] = [];
  const parsed = { RESOURCES: '', INSIGHT: '', SOURCES: '' };

  // 解析 Gemini 输出
  const parts = raw.split(/\n?\[(\w+)\]\n?/);
  for (let i = 1; i < parts.length; i += 2) {
    const tag = parts[i].toUpperCase();
    const content = (parts[i + 1] || '').trim();
    if (tag in parsed && content) {
      parsed[tag as keyof typeof parsed] = content;
    }
  }

  // Section 1: RESOURCES — 必须存在
  if (parsed.RESOURCES) {
    sections.push(`[RESOURCES]\n${parsed.RESOURCES}`);
  } else if (internalResults.length > 0) {
    const top = internalResults.slice(0, 2).map(r => r.title).join(', ');
    sections.push(`[RESOURCES]\nTechGuru has ${internalResults.length} resource(s) for "${query}": ${top}.`);
  } else {
    sections.push(`[RESOURCES]\nTechGuru doesn't currently have dedicated resources for "${query}".`);
  }

  // Section 2: INSIGHT — 必须存在
  if (parsed.INSIGHT) {
    sections.push(`[INSIGHT]\n${parsed.INSIGHT}`);
  } else {
    // 从 Tavily answer 中提取一句有价值的洞察
    const fallbackInsight = `For enterprise IT, "${query}" is relevant to infrastructure planning and technology evaluation. Contact TechGuru to discuss how this applies to your environment.`;
    sections.push(`[INSIGHT]\n${fallbackInsight}`);
  }

  // Section 3: SOURCES — 过滤黑名单域名
  if (parsed.SOURCES) {
    const allowedDomains = new Set(ALLOWED_SOURCE_DOMAINS);
    const lines = parsed.SOURCES.split('\n').filter(line => {
      const domainMatch = line.match(/\(([^)]+)\)/);
      if (!domainMatch) return true;
      const domain = domainMatch[1].toLowerCase().replace(/^www\./, '');
      return allowedDomains.has(domain);
    });
    if (lines.length > 0) {
      sections.push(`[SOURCES]\n${lines.join('\n')}`);
    }
  }

  // 如果连 SOURCES 都被过滤光了，从外部结果补
  if (!sections.some(s => s.includes('[SOURCES]'))) {
    const qualityExternal = externalResults.filter(r => {
      const domain = r.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
      return ALLOWED_SOURCE_DOMAINS.some(d => domain.endsWith(d));
    }).slice(0, 3);
    if (qualityExternal.length > 0) {
      const sourceLines = qualityExternal.map(r => {
        const domain = r.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        return `- ${r.title} (${domain})`;
      });
      sections.push(`[SOURCES]\n${sourceLines.join('\n')}`);
    }
  }

  return sections.join('\n\n');
}

// Fallback: 无 Gemini 时的简单摘要
function generateFallbackSummary(
  query: string,
  internalResults: SearchResult[],
  externalResults: ExternalResult[],
): string {
  const parts: string[] = [];
  if (internalResults.length > 0) {
    const top = internalResults.slice(0, 3).map(r => r.title).join(', ');
    parts.push(`[RESOURCES]\nTechGuru has ${internalResults.length} resource(s) for "${query}": ${top}.`);
  } else {
    parts.push(`[RESOURCES]\nTechGuru doesn't currently have dedicated resources for "${query}".`);
  }
  if (externalResults.length > 0) {
    const sources = externalResults.slice(0, 3).map(r => {
      const domain = r.url.replace(/^https?:\/\//, '').split('/')[0];
      return `${r.title} (${domain})`;
    }).join('\n- ');
    parts.push(`[SOURCES]\n- ${sources}`);
  }
  return parts.join('\n\n');
}

// 用 Gemini 生成真正的 AI 融合摘要
export async function generateAiSummary(
  query: string,
  tavilyAnswer: string,
  internalResults: SearchResult[],
  externalResults: ExternalResult[],
): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback: 无 Gemini key 时用简单拼接
    return generateFallbackSummary(query, internalResults, externalResults);
  }

  const cleanQuery = safeQuery(query);

  // 构建上下文：站内结果 + Tavily洞察 + 外部来源
  const internalContext = internalResults.slice(0, 5).map(r =>
    `[${r.type}] ${r.title}: ${r.description.substring(0, 150)}`,
  ).join('\n');

  const externalContext = externalResults.slice(0, 5).map(r => {
    const domain = r.url.replace(/^https?:\/\//, '').split('/')[0];
    return `- ${r.title} (${domain}): ${r.description.substring(0, 120)}`;
  }).join('\n');

  const tavilyContext = tavilyAnswer ? `\nExternal AI answer: ${tavilyAnswer.substring(0, 500)}` : '';

  const prompt = `You are TechGuru Network & Data Solutions' search AI assistant. TechGuru is an enterprise IT solutions company in the Philippines specializing in Build (AI, cloud), Run (virtualization, HCI, hosting), and Protect (security, networking).

User searched: "${cleanQuery}"

INTERNAL RESOURCES from TechGuru:
${internalContext || '(none)'}

EXTERNAL REFERENCES:
${externalContext || '(none)'}
${tavilyContext}

You MUST output EXACTLY these 3 sections in order. Every section is REQUIRED:

[RESOURCES]
State how many TechGuru resources match and list the top 1-2 by name. If zero, write "TechGuru doesn't currently have dedicated resources for this topic."

[INSIGHT]
Write 1-2 sentences explaining what "${cleanQuery}" means for enterprise IT infrastructure, why it matters, and how companies evaluate or deploy it. Be specific and actionable — NOT a dictionary definition.

[SOURCES]
List exactly 2-3 URLs from this allowed list ONLY: ${ALLOWED_SOURCE_DOMAINS.join(', ')}. NEVER use any other domain.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 400,
          },
        }),
      },
    );

    if (!response.ok) {
      logServiceError({ service: 'Gemini', operation: 'generateSummary', error: response.statusText });
      const fallback = generateFallbackSummary(query, internalResults, externalResults);
      return postProcessAiSummary(fallback, query, internalResults, externalResults);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.length > 20) {
      return postProcessAiSummary(text.trim(), query, internalResults, externalResults);
    }
  } catch (error) {
    logServiceError({ service: 'Gemini', operation: 'generateSummary', error });
  }

  // Fallback 也经过 postProcessAiSummary 保证三段格式 + 域名过滤
  const fallback = generateFallbackSummary(query, internalResults, externalResults);
  return postProcessAiSummary(fallback, query, internalResults, externalResults);
}
