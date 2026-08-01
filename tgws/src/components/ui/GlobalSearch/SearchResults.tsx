'use client';

import { ArrowRight, ExternalLink, Search, Zap } from 'lucide-react';
import AiSummaryCard from './AiSummaryCard';
import LeadCaptureForm from './LeadCaptureForm';

export interface SearchResultItem {
  id: string;
  type: 'product' | 'solution' | 'blog' | 'faq';
  title: string;
  description: string;
  url: string;
  source: 'internal';
  relevanceScore: number;
}

export interface ExternalResultItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: 'google' | 'tavily';
  relevanceScore: number;
}

export interface SearchResultsData {
  aiSummary: string;
  internalResults: SearchResultItem[];
  externalResults: ExternalResultItem[];
  capabilityGap: {
    detected: boolean;
    gapDescription: string | null;
    notificationSent: boolean;
  };
  metadata?: {
    externalSourcesAvailable?: boolean;
  };
}

interface SearchResultsProps {
  results: SearchResultsData | null;
  isSearching: boolean;
  query: string;
  externalSourcesAvailable: boolean;
  leadSubmitted: boolean;
  onResultClick: (url: string) => void;
  onLeadSubmit: (leadData: { name: string; email: string; phone?: string; company?: string }) => Promise<void>;
  onLeadCancel: () => void;
  getResultIcon: (type: string) => React.ReactNode;
}

export default function SearchResults({
  results,
  isSearching,
  query,
  externalSourcesAvailable,
  leadSubmitted,
  onResultClick,
  onLeadSubmit,
  onLeadCancel,
  getResultIcon,
}: SearchResultsProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Zap size={24} className="animate-spin text-[#00D4FF]" />
            <span className="ml-3 text-gray-500">Searching...</span>
          </div>
        )}

        {/* Results */}
        {!isSearching && results && query.trim().length >= 2 && (
          <>
            {/* External AI Search Degradation Indicator */}
            {!externalSourcesAvailable && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                <Zap size={12} className="text-gray-400 shrink-0" />
                <span>AI-enhanced web search is currently unavailable. Showing internal results only.</span>
              </div>
            )}

            {/* AI Summary — 解析 Gemini 结构化输出 */}
            {results.aiSummary && <AiSummaryCard aiSummary={results.aiSummary} />}

            {/* Capability Gap Alert — 放在摘要和结果之间，更显眼 */}
            {results.capabilityGap?.detected && !leadSubmitted && (
              <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-1.5">
                  We&apos;d like to help
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                  {results.capabilityGap.gapDescription}
                </p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mb-3">
                  Leave your contact info and our team will reach out within 48 hours.
                </p>
                <LeadCaptureForm onSubmit={onLeadSubmit} onCancel={onLeadCancel} />
              </div>
            )}

            {/* Internal Results */}
            {results.internalResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                  TechGuru ({results.internalResults.length} results)
                </h3>
                <div className="space-y-2">
                  {results.internalResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => onResultClick(result.url)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left group border border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#00D4FF] transition-colors">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {result.description}
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-[#00D4FF] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* External Results */}
            {results.externalResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7B61FF]" />
                  From the Web ({results.externalResults.length} results)
                </h3>
                <div className="space-y-2">
                  {results.externalResults.map((result) => (
                    <a
                      key={result.id}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left group border border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                        <ExternalLink size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#00D4FF] transition-colors">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {result.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{result.url}</p>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-[#00D4FF] transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Lead Submitted */}
            {leadSubmitted && (
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Thank you! Our team will contact you within 48 hours.
                </p>
              </div>
            )}

            {/* Empty State */}
            {results.internalResults.length === 0 && results.externalResults.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No results found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Try different keywords or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
