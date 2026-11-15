import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import { logServiceError } from '@/lib/errors';
import type { SearchRequest } from '@/lib/search/types';
import { searchInternal } from '@/lib/search/internal';
import { searchGoogleCSE, searchTavily, deduplicateResults, filterExternalResults, isExternalSourcesConfigured } from '@/lib/search/external';
import { generateAiSummary } from '@/lib/search/ai';
import { detectCapabilityGap } from '@/lib/search/capability';
import { rateLimit } from '@/lib/api-guard';

// 主搜索函数
export async function POST(request: NextRequest) {
  try {
    // Search fans out to paid external APIs — tighter window than contact.
    const blocked = rateLimit(request, { name: 'search', limit: 20, windowMs: 60_000 });
    if (blocked) return blocked;

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

    // T-068: searchLog was never a registered Sanity schema, so writes went
    // nowhere. 005 created public.search_logs with an anonymous INSERT policy;
    // log there instead. Logging must never fail the user's search response.
    try {
      const supabase = await createSupabaseClient();
      // Attribute the row when the visitor is signed in; anonymous searches
      // stay NULL (005 allows anonymous INSERT, admins can read all rows).
      const { data: authData } = await supabase.auth.getUser();
      const { error: logWriteError } = await supabase.from('search_logs').insert({
        user_id: authData?.user?.id ?? null,
        query: searchQuery || 'image search',
        query_type: type === 'image' ? 'image' : 'text',
        filters: filters || null,
        results_count: internal.length + external.length,
        internal_count: internal.length,
        external_count: external.length,
        capability_gap_detected: capabilityGap.detected,
        gap_description: capabilityGap.gapDescription || null,
      });
      if (logWriteError) {
        logServiceError({ service: 'Supabase', operation: 'logSearch', error: logWriteError });
      }
    } catch (logError) {
      logServiceError({ service: 'Supabase', operation: 'logSearch', error: logError });
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
