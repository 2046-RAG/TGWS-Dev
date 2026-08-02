import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { logServiceError } from '@/lib/errors';
import type { SearchRequest } from '@/lib/search/types';
import { searchInternal } from '@/lib/search/internal';
import { searchGoogleCSE, searchTavily, deduplicateResults, filterExternalResults, isExternalSourcesConfigured } from '@/lib/search/external';
import { generateAiSummary } from '@/lib/search/ai';
import { detectCapabilityGap } from '@/lib/search/capability';

// 主搜索函数
export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, type = 'text', imageData, filters, locale = 'en' } = body;

    if (!query && !imageData) {
      return NextResponse.json(
        { success: false, error: 'Query or image is required' },
        { status: 400 },
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
    const { internal, external: rawExternal } = deduplicateResults(internalResults, [...cseResults, ...tavilyData.results]);

    // 过滤低质量/广告外部结果
    const external = filterExternalResults(rawExternal);

    // 用 Gemini 生成真正的 AI 融合摘要
    const aiSummary = await generateAiSummary(searchQuery, tavilyData.answer, internal, external);

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
          externalSourcesAvailable: isExternalSourcesConfigured(),
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
      logServiceError({ service: 'Sanity', operation: 'logSearch', error: logError });
    }

    return NextResponse.json(response);
  } catch (error) {
    logServiceError({ service: 'Search', operation: 'handler', error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
