// Internal (Sanity GROQ) search across products, solutions, blog posts and FAQs.

import { client } from '@/lib/sanity';
import { logServiceError } from '@/lib/errors';
import type { SearchFilters, SearchResult } from './types';

// 中文关键词映射
const chineseToEnglish: Record<string, string[]> = {
  '超融合': ['hyper-converged', 'hci', 'converged'],
  '云计算': ['cloud', 'computing'],
  '网络安全': ['security', 'network', 'cybersecurity'],
  '防火墙': ['firewall', 'ngfw'],
  '虚拟化': ['virtualization', 'vmware', 'hypervisor'],
  '存储': ['storage', 'san', 'nas'],
  '备份': ['backup', 'disaster recovery'],
  'ai': ['ai', 'artificial intelligence', 'machine learning'],
  '人工智能': ['ai', 'artificial intelligence', 'machine learning'],
};

// 提取英文搜索词
function extractEnglishTerms(query: string): string[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 1);
  const englishTerms = [...queryTerms];

  for (const [chinese, english] of Object.entries(chineseToEnglish)) {
    if (queryLower.includes(chinese)) {
      englishTerms.push(...english);
    }
  }

  return englishTerms;
}

// 计算相关性评分
function calculateRelevance(query: string, title?: string, description?: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();

  if (title?.toLowerCase().includes(queryLower)) score += 0.6;
  if (description?.toLowerCase().includes(queryLower)) score += 0.3;

  const queryWords = queryLower.split(' ');
  for (const word of queryWords) {
    if (word.length > 2) {
      if (title?.toLowerCase().includes(word)) score += 0.1;
      if (description?.toLowerCase().includes(word)) score += 0.05;
    }
  }

  return Math.min(score, 1);
}

function pushMatch(
  results: SearchResult[],
  candidate: Omit<SearchResult, 'source' | 'relevanceScore'> & { relevanceScore: number },
) {
  results.push({ ...candidate, source: 'internal' });
}

// 站内搜索 - Sanity GROQ
export async function searchInternal(
  query: string,
  filters?: SearchFilters,
  locale: string = 'en',
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const englishTerms = extractEnglishTerms(query);

  try {
    // 搜索产品
    if (!filters?.contentType || filters.contentType.includes('product')) {
      const products = await client.fetch(
        `*[_type == "product"] {
          _id, title, titleZh, slug, category, description, descriptionZh, "pillar": category
        }`,
      );

      for (const product of products || []) {
        const title = locale === 'zh' ? (product.titleZh || product.title) : product.title;
        const desc = locale === 'zh' ? (product.descriptionZh || product.description) : product.description;
        const slug = product.slug?.current?.toLowerCase().replace(/-/g, ' ') || '';

        const matches = englishTerms.some(term =>
          title?.toLowerCase().includes(term) ||
          desc?.toLowerCase().includes(term) ||
          slug.includes(term),
        );

        if (matches) {
          if (filters?.pillar && filters.pillar.length > 0) {
            if (!filters.pillar.includes(product.pillar)) continue;
          }
          pushMatch(results, {
            id: product._id, type: 'product', title: title || product.title,
            description: desc?.substring(0, 200) || '', url: `/${locale}/products/${product.slug?.current}`,
            category: product.category, pillar: product.pillar,
            relevanceScore: calculateRelevance(query, title, desc),
          });
        }
      }
    }

    // 搜索方案
    if (!filters?.contentType || filters.contentType.includes('solution')) {
      const solutions = await client.fetch(
        `*[_type == "solution"] { _id, title, titleZh, slug, industry, description, descriptionZh }`,
      );
      for (const solution of solutions || []) {
        const title = locale === 'zh' ? (solution.titleZh || solution.title) : solution.title;
        const desc = locale === 'zh' ? (solution.descriptionZh || solution.description) : solution.description;
        const matches = englishTerms.some(term => title?.toLowerCase().includes(term) || desc?.toLowerCase().includes(term));
        if (matches) {
          if (filters?.industry && filters.industry.length > 0) {
            if (!filters.industry.includes(solution.industry)) continue;
          }
          pushMatch(results, {
            id: solution._id, type: 'solution', title: title || solution.title,
            description: desc?.substring(0, 200) || '', url: `/${locale}/solutions?tab=${solution.industry}`,
            industry: solution.industry,
            relevanceScore: calculateRelevance(query, title, desc),
          });
        }
      }
    }

    // 搜索博客
    if (!filters?.contentType || filters.contentType.includes('blog')) {
      const posts = await client.fetch(
        `*[_type == "post"] { _id, title, titleZh, slug, excerpt, excerptZh, category, tags }`,
      );
      for (const post of posts || []) {
        const title = locale === 'zh' ? (post.titleZh || post.title) : post.title;
        const desc = locale === 'zh' ? (post.excerptZh || post.excerpt) : post.excerpt;
        const tags = (post.tags || []).join(' ').toLowerCase();
        const matches = englishTerms.some(term =>
          title?.toLowerCase().includes(term) || desc?.toLowerCase().includes(term) || tags.includes(term),
        );
        if (matches) {
          pushMatch(results, {
            id: post._id, type: 'blog', title: title || post.title,
            description: desc?.substring(0, 200) || '', url: `/${locale}/blog/${post.slug?.current}`,
            relevanceScore: calculateRelevance(query, title, desc),
          });
        }
      }
    }

    // 搜索FAQ
    if (!filters?.contentType || filters.contentType.includes('faq')) {
      const faqs = await client.fetch(
        `*[_type == "faq"] { _id, question, questionZh, answer, answerZh, category }`,
      );
      for (const faq of faqs || []) {
        const question = locale === 'zh' ? (faq.questionZh || faq.question) : faq.question;
        const answer = locale === 'zh' ? (faq.answerZh || faq.answer) : faq.answer;
        const matches = englishTerms.some(term =>
          question?.toLowerCase().includes(term) || answer?.toLowerCase().includes(term),
        );
        if (matches) {
          pushMatch(results, {
            id: faq._id, type: 'faq', title: question || faq.question,
            description: answer?.substring(0, 200) || '', url: `/${locale}/help`,
            relevanceScore: calculateRelevance(query, question, answer),
          });
        }
      }
    }
  } catch (error) {
    logServiceError({ service: 'Search', operation: 'internalSearch', error });
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
