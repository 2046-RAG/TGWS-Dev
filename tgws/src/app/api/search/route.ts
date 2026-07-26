import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

interface SearchFilters {
  contentType?: string[];
  pillar?: string[];
  industry?: string[];
}

interface SearchRequest {
  query: string;
  type?: 'text' | 'image';
  imageData?: string;
  filters?: SearchFilters;
  locale?: string;
}

interface SearchResult {
  id: string;
  type: 'product' | 'solution' | 'blog' | 'faq';
  title: string;
  titleZh?: string;
  description: string;
  descriptionZh?: string;
  url: string;
  category?: string;
  pillar?: string;
  industry?: string;
  source: 'internal';
  relevanceScore: number;
}

interface ExternalResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: 'google' | 'tavily';
  relevanceScore: number;
}

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

// 站内搜索 - Sanity GROQ
async function searchInternal(
  query: string,
  filters?: SearchFilters,
  locale: string = 'en'
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const englishTerms = extractEnglishTerms(query);

  try {
    // 搜索产品
    if (!filters?.contentType || filters.contentType.includes('product')) {
      const products = await client.fetch(
        `*[_type == "product"] {
          _id, title, titleZh, slug, category, description, descriptionZh, "pillar": category
        }`
      );

      for (const product of products || []) {
        const title = locale === 'zh' ? (product.titleZh || product.title) : product.title;
        const desc = locale === 'zh' ? (product.descriptionZh || product.description) : product.description;
        const slug = product.slug?.current?.toLowerCase().replace(/-/g, ' ') || '';
        
        const matches = englishTerms.some(term => 
          title?.toLowerCase().includes(term) ||
          desc?.toLowerCase().includes(term) ||
          slug.includes(term)
        );
        
        if (matches) {
          if (filters?.pillar && filters.pillar.length > 0) {
            if (!filters.pillar.includes(product.pillar)) continue;
          }
          results.push({
            id: product._id, type: 'product', title: title || product.title,
            description: desc?.substring(0, 200) || '', url: `/en/products/${product.slug?.current}`,
            category: product.category, pillar: product.pillar, source: 'internal',
            relevanceScore: calculateRelevance(query, title, desc),
          });
        }
      }
    }

    // 搜索方案
    if (!filters?.contentType || filters.contentType.includes('solution')) {
      const solutions = await client.fetch(
        `*[_type == "solution"] { _id, title, slug, industry, description, descriptionZh }`
      );
      for (const solution of solutions || []) {
        const title = locale === 'zh' ? (solution.title || solution.title) : solution.title;
        const desc = locale === 'zh' ? (solution.descriptionZh || solution.description) : solution.description;
        const matches = englishTerms.some(term => title?.toLowerCase().includes(term) || desc?.toLowerCase().includes(term));
        if (matches) {
          if (filters?.industry && filters.industry.length > 0) {
            if (!filters.industry.includes(solution.industry)) continue;
          }
          results.push({
            id: solution._id, type: 'solution', title: title || solution.title,
            description: desc?.substring(0, 200) || '', url: `/en/solutions?tab=${solution.industry}`,
            industry: solution.industry, source: 'internal',
            relevanceScore: calculateRelevance(query, title, desc),
          });
        }
      }
    }

    // 搜索博客
    if (!filters?.contentType || filters.contentType.includes('blog')) {
      const posts = await client.fetch(
        `*[_type == "post"] { _id, title, titleZh, slug, excerpt, excerptZh, category, tags }`
      );
      for (const post of posts || []) {
        const title = locale === 'zh' ? (post.titleZh || post.title) : post.title;
        const desc = locale === 'zh' ? (post.excerptZh || post.excerpt) : post.excerpt;
        const tags = (post.tags || []).join(' ').toLowerCase();
        const matches = englishTerms.some(term => 
          title?.toLowerCase().includes(term) || desc?.toLowerCase().includes(term) || tags.includes(term)
        );
        if (matches) {
          results.push({
            id: post._id, type: 'blog', title: title || post.title,
            description: desc?.substring(0, 200) || '', url: `/en/blog/${post.slug?.current}`,
            source: 'internal', relevanceScore: calculateRelevance(query, title, desc),
          });
        }
      }
    }

    // 搜索FAQ
    if (!filters?.contentType || filters.contentType.includes('faq')) {
      const faqs = await client.fetch(
        `*[_type == "faq"] { _id, question, questionZh, answer, answerZh, category }`
      );
      for (const faq of faqs || []) {
        const question = locale === 'zh' ? (faq.questionZh || faq.question) : faq.question;
        const answer = locale === 'zh' ? (faq.answerZh || faq.answer) : faq.answer;
        const matches = englishTerms.some(term => 
          question?.toLowerCase().includes(term) || answer?.toLowerCase().includes(term)
        );
        if (matches) {
          results.push({
            id: faq._id, type: 'faq', title: question || faq.question,
            description: answer?.substring(0, 200) || '', url: '/en/help',
            source: 'internal', relevanceScore: calculateRelevance(query, question, answer),
          });
        }
      }
    }
  } catch (error) {
    console.error('Internal search error:', error);
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Google CSE搜索
async function searchGoogleCSE(query: string): Promise<ExternalResult[]> {
  const results: ExternalResult[] = [];
  
  try {
    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    
    if (!apiKey || !cseId) {
      console.log('Google CSE not configured, skipping');
      return results;
    }

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=10`
    );
    
    if (!response.ok) {
      console.error('Google CSE error:', response.statusText);
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
    console.error('Google CSE error:', error);
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
      console.log('Tavily not configured, skipping');
      return { results, answer };
    }

    // 注入 TechGuru 上下文，确保 Tavily 从企业IT角度回答
    const enrichedQuery = `TechGuru Network & Data Solutions (enterprise IT solutions company in the Philippines, covering Build/Run/Protect pillars — virtualization, HCI, cloud, security, networking): ${query}`;

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
      console.error('Tavily error:', response.statusText);
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
    console.error('Tavily error:', error);
  }

  return { results, answer };
}

// 去重函数
function deduplicateResults(
  internal: SearchResult[], 
  external: ExternalResult[]
): { internal: SearchResult[]; external: ExternalResult[] } {
  // 收集站内结果的URL
  const internalUrls = new Set(internal.map(r => r.url));
  
  // 过滤站外结果，移除与站内重复的
  const uniqueExternal = external.filter(r => !internalUrls.has(r.url));
  
  return { internal, external: uniqueExternal };
}

// 生成AI摘要 — 融合站内+外部，结构化且可读
function generateAiSummary(
  query: string,
  tavilyAnswer: string,
  internalResults: SearchResult[],
  externalResults: ExternalResult[]
): string {
  const sections: string[] = [];

  // Section 1: 站内匹配概览 — 按类型分组统计
  if (internalResults.length > 0) {
    const byType = {
      product: internalResults.filter(r => r.type === 'product'),
      solution: internalResults.filter(r => r.type === 'solution'),
      blog: internalResults.filter(r => r.type === 'blog'),
      faq: internalResults.filter(r => r.type === 'faq'),
    };

    const summaryParts: string[] = [];
    if (byType.product.length > 0) {
      summaryParts.push(`${byType.product.length} product(s) including ${byType.product[0].title}`);
    }
    if (byType.solution.length > 0) {
      summaryParts.push(`${byType.solution.length} solution(s) including ${byType.solution[0].title}`);
    }
    if (byType.blog.length > 0) {
      summaryParts.push(`${byType.blog.length} article(s) covering ${query}`);
    }
    if (byType.faq.length > 0) {
      summaryParts.push(`${byType.faq.length} FAQ(s)`);
    }

    sections.push(`TechGuru has ${internalResults.length} resources for "${query}": ${summaryParts.join(', ')}.`);
  }

  // Section 2: 从 Tavily 提炼关键技术洞察（不是透传，而是提取）
  if (tavilyAnswer && tavilyAnswer.length > 30) {
    const sentences = tavilyAnswer
      .split(/[.。!！?？]/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.length < 250);

    // 只保留含技术关键词的句子，过滤营销/通用废话
    const techKeywords = ['architecture', 'platform', 'solution', 'deploy', 'implement', 'security',
      'virtualization', 'cloud', 'network', 'infrastructure', 'performance', 'migration',
      'backup', 'recovery', 'monitor', 'automat', 'integrat', 'scalab', 'redundan'];
    const techSentences = sentences.filter(s => {
      const lower = s.toLowerCase();
      return techKeywords.some(kw => lower.includes(kw));
    });

    if (techSentences.length > 0) {
      sections.push(`Key insight: ${techSentences[0]}.`);
    }
  }

  // Section 3: 外部来源摘要（过滤噪音域名和 hashtag）
  if (externalResults.length > 0) {
    // 过滤掉 LinkedIn、Twitter 等社交媒体来源
    const qualitySources = externalResults.filter(r => {
      const domain = r.url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
      return !domain.includes('linkedin') && !domain.includes('twitter') &&
             !domain.includes('facebook') && !domain.includes('youtube');
    });

    if (qualitySources.length > 0) {
      const top = qualitySources.slice(0, 3);
      const sourceList = top.map(r => {
        const domain = r.url.replace(/^https?:\/\//, '').split('/')[0];
        return `${r.title} (${domain})`;
      }).join(' · ');
      sections.push(`See also: ${sourceList}`);
    }
  }

  if (sections.length === 0) {
    return `No results found for "${query}". Try different keywords or browse our Products and Solutions.`;
  }

  return sections.join('\n\n');
}

// 检测能力缺口 — 智能检测：站内结果少于阈值时触发
async function detectCapabilityGap(
  query: string,
  internalResults: SearchResult[]
): Promise<{ detected: boolean; gapDescription: string | null }> {
  // 当站内结果少于3条时，认为可能存在能力缺口
  if (internalResults.length <= 2) {
    // 排除通用搜索词（这些词搜不到是正常的）
    const genericTerms = ['about', 'contact', 'login', 'home', 'help', 'faq', 'search',
      '關於', '聯絡', '登入', '首頁', '說明', '搜尋'];
    const queryLower = query.toLowerCase().trim();
    if (genericTerms.some(t => queryLower === t || queryLower.includes(t))) {
      return { detected: false, gapDescription: null };
    }

    return {
      detected: true,
      gapDescription: internalResults.length === 0
        ? `No existing resources found for "${query}". This may represent a gap in TechGuru's current offerings.`
        : `Only ${internalResults.length} result(s) found for "${query}". TechGuru may have limited coverage in this area.`,
    };
  }

  return { detected: false, gapDescription: null };
}

// 主搜索函数
export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, type = 'text', imageData, filters, locale = 'en' } = body;

    if (!query && !imageData) {
      return NextResponse.json(
        { success: false, error: 'Query or image is required' },
        { status: 400 }
      );
    }

    let searchQuery = query;
    if (type === 'image' && imageData) {
      searchQuery = query || 'image search';
    }

    // 并行执行所有搜索
    const [internalResults, cseResults, tavilyData] = await Promise.all([
      searchInternal(searchQuery, filters, locale),
      searchGoogleCSE(searchQuery),
      searchTavily(searchQuery),
    ]);

    // 检测能力缺口
    const capabilityGap = await detectCapabilityGap(searchQuery, internalResults);

    // 去重：移除站外结果中与站内重复的
    const { internal, external } = deduplicateResults(internalResults, [...cseResults, ...tavilyData.results]);

    // 生成AI摘要（融合多源数据）
    const aiSummary = generateAiSummary(searchQuery, tavilyData.answer, internal, external);

    // 构建响应
    const response = {
      success: true,
      data: {
        aiSummary,
        internalResults: internal,
        externalResults: external,
        capabilityGap,
        metadata: {
          query: searchQuery,
          type,
          filters,
          locale,
          timestamp: new Date().toISOString(),
        },
      },
    };

    // 记录搜索日志
    try {
      await client.create({
        _type: 'searchLog',
        query: searchQuery,
        queryType: type,
        filters: filters || {},
        resultsCount: internal.length + external.length,
        internalCount: internal.length,
        externalCount: external.length,
        capabilityGapDetected: capabilityGap.detected,
        gapDescription: capabilityGap.gapDescription,
      });
    } catch (logError) {
      console.error('Failed to log search:', logError);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}