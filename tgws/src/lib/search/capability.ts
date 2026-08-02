// Capability-gap detection: flags queries with few or no internal results.

import type { SearchResult } from './types';

// 检测能力缺口 — 智能检测：站内结果少于阈值时触发
export async function detectCapabilityGap(
  query: string,
  internalResults: SearchResult[],
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
