// External search: Google CSE + Tavily, deduplication and quality filtering.

import { logServiceError } from '@/lib/errors';
import type { ExternalResult, SearchResult } from './types';

// Google CSE搜索
async function searchGoogleCSE(query: string): Promise<ExternalResult[]> {
  const results: ExternalResult[] = [];

  try {
    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;

    if (!apiKey || !cseId) {
      logServiceError({ service: 'GoogleCSE', operation: 'search', error: 'not configured' });
      return results;
    }

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=10`,
    );

    if (!response.ok) {
      logServiceError({ service: 'GoogleCSE', operation: 'search', error: response.statusText });
      return results;
    }

    const data = await response.json();

    for (const item of data.items || []) {
      results.push({
        id: item.link,
        title: item.title,
        description: item.snippet || '',
        url: item.link,
        source: 'google',
        relevanceScore: 0.5,
      });
    }
  } catch (error) {
    logServiceError({ service: 'GoogleCSE', operation: 'search', error });
  }

  return results;
}

// Tavily搜索 — query 注入 TechGuru 业务上下文
async function searchTavily(query: string): Promise<{ results: ExternalResult[]; answer: string }> {
  const results: ExternalResult[] = [];
  let answer = '';

  try {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      logServiceError({ service: 'Tavily', operation: 'search', error: 'not configured' });
      return { results, answer };
    }

    // 注入 TechGuru 上下文 — 只描述公司定位，不把搜索词列为业务。
    // 清理引号/换行/控制字符，防止 prompt injection (AUDIT-048)。
    const safeQuery = String(query).replace(/["\\\n\r\t]/g, ' ').slice(0, 300);
    const enrichedQuery = `For TechGuru Network & Data Solutions (enterprise IT solutions company in the Philippines specializing in virtualization, HCI, cloud infrastructure, cybersecurity, and networking): explain what "${safeQuery}" means in enterprise IT context, its use cases, and how it relates to infrastructure solutions.`;

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: enrichedQuery,
        search_depth: 'advanced',
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      logServiceError({ service: 'Tavily', operation: 'search', error: response.statusText });
      return { results, answer };
    }

    const data = await response.json();

    // 提取AI摘要
    answer = data.answer || '';

    // 提取搜索结果
    for (const item of data.results || []) {
      results.push({
        id: item.url,
        title: item.title,
        description: item.content?.substring(0, 200) || '',
        url: item.url,
        source: 'tavily',
        relevanceScore: item.score || 0.5,
      });
    }
  } catch (error) {
    logServiceError({ service: 'Tavily', operation: 'search', error });
  }

  return { results, answer };
}

// 去重函数
export function deduplicateResults(
  internal: SearchResult[],
  external: ExternalResult[],
): { internal: SearchResult[]; external: ExternalResult[] } {
  // 收集站内结果的URL
  const internalUrls = new Set(internal.map(r => r.url));

  // 过滤站外结果，移除与站内重复的
  const uniqueExternal = external.filter(r => !internalUrls.has(r.url));

  return { internal, external: uniqueExternal };
}

// 低质量/广告域名黑名单
const BLOCKED_DOMAINS = new Set([
  'ema.ai', 'solytics-partners.com', 'tungstenautomation.com',
  'linkedin.com', 'twitter.com', 'facebook.com', 'youtube.com',
  'techguru-it.asia', 'techguru.net', 'techguru.co.in',
  'pinterest.com', 'reddit.com', 'medium.com', 'quora.com',
  'synetcom.asia', 'virtana.com', 'paessler.com', 'scalecomputing.com', 'datacore.com',
]);

// 过滤低质量外部结果
export function filterExternalResults(results: ExternalResult[]): ExternalResult[] {
  return results.filter(r => {
    // 剥离 www. 前缀，避免 www.medium.com 绕过黑名单 (AUDIT-048 follow-up)
    const domain = r.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    // 过滤黑名单
    if (BLOCKED_DOMAINS.has(domain)) return false;
    // 过滤标题含广告特征的
    const spamPatterns = ['sponsored', 'ad ', 'advertisement', 'buy now', 'click here', 'limited offer'];
    if (spamPatterns.some(p => r.title.toLowerCase().includes(p))) return false;
    return true;
  });
}

export function isExternalSourcesConfigured(): boolean {
  return !!(process.env.GOOGLE_CSE_API_KEY && process.env.TAVILY_API_KEY);
}

export { searchGoogleCSE, searchTavily };
