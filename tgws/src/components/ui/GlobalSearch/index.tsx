'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Search, X, Camera, Filter, Sparkles, ArrowRight, Loader2, Package, Building2, FileText, HelpCircle, ExternalLink } from 'lucide-react';
import { client } from '@/lib/sanity';
import { logServiceError, trackEvent } from '@/lib/errors';
import SearchFiltersPanel from './SearchFiltersPanel';
import SearchResults from './SearchResults';

interface SearchResult {
  id: string;
  type: 'product' | 'solution' | 'blog' | 'faq';
  title: string;
  description: string;
  url: string;
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

interface CapabilityGap {
  detected: boolean;
  gapDescription: string | null;
  notificationSent: boolean;
}

interface SearchResponse {
  success: boolean;
  data: {
    aiSummary: string;
    internalResults: SearchResult[];
    externalResults: ExternalResult[];
    capabilityGap: CapabilityGap;
    metadata?: {
      externalSourcesAvailable?: boolean;
    };
  };
}

interface Filters {
  contentType: string[];
  pillar: string[];
  industry: string[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse['data'] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    contentType: [],
    pillar: [],
    industry: [],
  });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [externalSourcesAvailable, setExternalSourcesAvailable] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; description: string; url: string; type: string; pillar?: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setShowFilters(true);
    }
  }, [isOpen]);

  // Fetch trending suggestions when modal opens (only when query is empty)
  useEffect(() => {
    if (!isOpen || query.trim()) return;

    const fetchSuggestions = async () => {
      try {
        const data = await client.fetch<{
          products: { _id: string; title: string; slug: { current: string }; description?: string; category?: string; _type: string }[];
          solutions: { _id: string; title: string; slug: { current: string }; description?: string; industry?: string; _type: string }[];
          blogs: { _id: string; title: string; slug: { current: string }; description?: string; excerpt?: string; _type: string }[];
        }>(
          `{
            "products": *[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...3],
            "solutions": *[_type == "solution" && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...2],
            "blogs": *[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0...2]
          }`,
        );
        const all: { id: string; title: string; description: string; url: string; type: string; pillar?: string }[] = [];
        const seen = new Set<string>();

        // Always include VMware Alternatives as top suggestion
        all.push({
          id: 'vmware-alternatives',
          title: 'VMware Alternatives',
          description: '5 proven alternatives with dual-hypervisor architecture. Zero lock-in migration.',
          url: `/${locale}/vmware-alternatives`,
          type: 'solution',
          pillar: 'run',
        });
        seen.add('vmware-alternatives');

        if (data) {
          for (const item of [...(data.products || []), ...(data.solutions || []), ...(data.blogs || [])]) {
            if (all.length >= 6) break;
            const slug = item.slug?.current;
            if (!slug || seen.has(slug)) continue;
            seen.add(slug);
            let url = '';
            let type = 'product';
            let pillar: string | undefined;
            if (item._type === 'product') {
              url = `/${locale}/products/${slug}`;
              type = 'product';
              pillar = (item as { category?: string }).category;
            } else if (item._type === 'solution') {
              url = `/${locale}/solutions/${slug}`;
              type = 'solution';
              pillar = (item as { industry?: string }).industry;
            } else {
              url = `/${locale}/blog/${slug}`;
              type = 'blog';
            }
            all.push({
              id: item._id,
              title: item.title || '',
              description: item.description || (item as { excerpt?: string }).excerpt || '',
              url,
              type,
              pillar,
            });
          }
        }

        setSuggestions(all);
      } catch {
        // Graceful fallback — suggestions are non-critical
        setSuggestions([
          {
            id: 'vmware-alternatives',
            title: 'VMware Alternatives',
            description: '5 proven alternatives with dual-hypervisor architecture. Zero lock-in.',
            url: `/${locale}/vmware-alternatives`,
            type: 'solution',
            pillar: 'run',
          },
        ]);
      }
    };

    fetchSuggestions();
  }, [isOpen, query, locale]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // 执行搜索
  const handleSearch = useCallback(async () => {
    if (!query.trim() && !imageFile) return;

    setIsSearching(true);
    setResults(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          type: imageFile ? 'image' : 'text',
          imageData: imagePreview,
          filters: Object.values(filters).some(f => f.length > 0) ? filters : undefined,
          locale,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        setExternalSourcesAvailable(data.data.metadata?.externalSourcesAvailable ?? false);
        trackEvent('search_performed', {
          query: query.trim(),
          results: data.data.internalResults.length + data.data.externalResults.length,
          gap: data.data.capabilityGap?.detected ? '1' : '0',
        });
        if (data.data.capabilityGap?.detected) {
          setShowLeadForm(true);
        }
      }
    } catch (error) {
      logServiceError({ service: 'GlobalSearch', operation: 'search', error });
    } finally {
      setIsSearching(false);
    }
  }, [query, imageFile, imagePreview, filters, locale]);

  // 处理图片上传
  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Unsupported file format. Please use JPG, PNG, WebP, or GIF.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // 处理粘贴
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file);
          e.preventDefault();
          return;
        }
      }
    }
  }, [handleImageUpload]);

  // 处理拖拽
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 清除图片
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Debounced auto-search: 输入完毕 500ms 后自动触发搜索
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, handleSearch]);

  // 提交线索
  const handleLeadSubmit = async (leadData: { name: string; email: string; phone?: string; company?: string }) => {
    try {
      const response = await fetch('/api/search/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          searchQuery: query,
          gapDescription: results?.capabilityGap?.gapDescription || '',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setLeadSubmitted(true);
        setShowLeadForm(false);
        trackEvent('lead_submitted', { query, gap: results?.capabilityGap?.gapDescription ? '1' : '0' });
      }
    } catch (error) {
      logServiceError({ service: 'GlobalSearch', operation: 'leadSubmit', error });
    }
  };

  // 切换过滤器
  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }));
  };

  // 结果点击
  const handleResultClick = (url: string) => {
    router.push(url);
    onClose();
  };

  // 获取结果类型图标
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package size={16} className="text-[#00D4FF]" />;
      case 'solution': return <Building2 size={16} className="text-[#7B61FF]" />;
      case 'blog': return <FileText size={16} className="text-[#22C55E]" />;
      case 'faq': return <HelpCircle size={16} className="text-[#F59E0B]" />;
      default: return <ExternalLink size={16} className="text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute inset-x-0 top-0 max-h-[90vh] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="border-b border-gray-200 dark:border-zinc-700 shrink-0">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Main Search Input */}
            <div
              className="relative"
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search products, solutions, articles... or paste/drop an image"
                className="w-full pl-12 pr-32 py-4 text-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg transition-colors"
                  title="Upload image"
                >
                  <Camera size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${showFilters ? 'text-[#00D4FF] bg-[#00D4FF]/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  title="Filters"
                >
                  <Filter size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || (!query.trim() && !imageFile)}
                  className="w-8 h-8 flex items-center justify-center bg-[#00D4FF] text-white rounded-lg hover:bg-[#00B8E6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <img src={imagePreview} alt="Uploaded" className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{imageFile?.name}</p>
                  <p className="text-xs text-gray-500">{imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</p>
                </div>
                <button onClick={clearImage} className="p-1 text-gray-400 hover:text-red-500 rounded">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Filters Panel */}
            {showFilters && <SearchFiltersPanel filters={filters} onToggle={toggleFilter} />}
          </div>
        </div>

        {/* Search Results */}
        <SearchResults
          results={results}
          isSearching={isSearching}
          query={query}
          externalSourcesAvailable={externalSourcesAvailable}
          leadSubmitted={leadSubmitted}
          onResultClick={handleResultClick}
          onLeadSubmit={handleLeadSubmit}
          onLeadCancel={() => setShowLeadForm(false)}
          getResultIcon={getResultIcon}
        />
      </div>
    </div>
  );
}