'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Search, X, Camera, Filter, Sparkles, Package, Building2, FileText, HelpCircle, ExternalLink, ArrowRight, Loader2, TrendingUp, Zap } from 'lucide-react';
import { client } from '@/lib/sanity';

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

const contentTypeOptions = [
  { value: 'product', label: 'Products', icon: Package },
  { value: 'solution', label: 'Solutions', icon: Building2 },
  { value: 'blog', label: 'Blog', icon: FileText },
  { value: 'faq', label: 'FAQ', icon: HelpCircle },
];

const pillarOptions = [
  { value: 'build', label: 'Build', color: '#00D4FF' },
  { value: 'run', label: 'Run', color: '#7B61FF' },
  { value: 'protect', label: 'Protect', color: '#22C55E' },
];

const industryOptions = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government' },
];

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse['data'] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    contentType: [],
    pillar: [],
    industry: [],
  });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
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

  // Debounced auto-search: 输入完毕 500ms 后自动触发搜索
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

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
        if (data.data.capabilityGap?.detected) {
          setShowLeadForm(true);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [query, imageFile, imagePreview, filters, locale]);

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
      }
    } catch (error) {
      console.error('Lead submit error:', error);
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
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={onClose}>
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
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Content Type</p>
                  <div className="flex flex-wrap gap-2">
                    {contentTypeOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleFilter('contentType', opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                          filters.contentType.includes(opt.value)
                            ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30'
                            : 'bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-600'
                        }`}
                      >
                        <opt.icon size={14} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Product Pillar</p>
                  <div className="flex flex-wrap gap-2">
                    {pillarOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleFilter('pillar', opt.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          filters.pillar.includes(opt.value)
                            ? 'text-white'
                            : 'bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-600'
                        }`}
                        style={filters.pillar.includes(opt.value) ? { backgroundColor: opt.color } : {}}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Industry</p>
                  <div className="flex flex-wrap gap-2">
                    {industryOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleFilter('industry', opt.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          filters.industry.includes(opt.value)
                            ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30'
                            : 'bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#00D4FF]" />
                <span className="ml-3 text-gray-500">Searching...</span>
              </div>
            )}

            {/* Suggestions — shown when no query and no results */}
            {!isSearching && !results && !query.trim() && suggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#7B61FF]" />
                  Trending &amp; Recommended
                </h3>
                <div className="space-y-2">
                  {suggestions.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick(item.url)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left group border border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === 'product' ? 'bg-[#00D4FF]/10' :
                        item.type === 'solution' ? 'bg-[#7B61FF]/10' :
                        'bg-[#22C55E]/10'
                      }`}>
                        {idx === 0 ? (
                          <Zap size={16} className="text-[#F59E0B]" />
                        ) : (
                          getResultIcon(item.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#00D4FF] transition-colors">
                            {item.title}
                          </p>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#F59E0B]/10 text-[#F59E0B] rounded">
                              Popular
                            </span>
                          )}
                          {item.pillar && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                              item.pillar === 'build' ? 'bg-[#00D4FF]/10 text-[#00D4FF]' :
                              item.pillar === 'run' ? 'bg-[#7B61FF]/10 text-[#7B61FF]' :
                              'bg-[#22C55E]/10 text-[#22C55E]'
                            }`}>
                              {item.pillar.charAt(0).toUpperCase() + item.pillar.slice(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-[#00D4FF] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
                  Type a search query or upload an image to find more results
                </p>
              </div>
            )}

            {/* Results */}
            {!isSearching && results && (
              <>
                {/* AI Summary — 结构化渲染 */}
                {results.aiSummary && (
                  <div className="mb-6 rounded-xl border border-[#00D4FF]/20 overflow-hidden">
                    {results.aiSummary.split('\n\n').map((section, sIdx) => {
                      const isInternal = section.startsWith('TechGuru has');
                      const isInsight = section.startsWith('Key insight');
                      const isSources = section.startsWith('See also');

                      return (
                        <div
                          key={sIdx}
                          className={`p-4 ${
                            isInternal ? 'bg-[#00D4FF]/5' :
                            isInsight ? 'bg-[#F59E0B]/5' :
                            'bg-[#7B61FF]/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Sparkles size={16} className={`mt-0.5 shrink-0 ${
                              isInternal ? 'text-[#00D4FF]' :
                              isInsight ? 'text-[#F59E0B]' :
                              'text-[#7B61FF]'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                                isInternal ? 'text-[#00D4FF]' :
                                isInsight ? 'text-[#F59E0B]' :
                                'text-[#7B61FF]'
                              }`}>
                                {isInternal ? 'TechGuru Resources' :
                                 isInsight ? 'Key Insight' :
                                 'External Sources'}
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{section}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

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
                    <LeadForm onSubmit={handleLeadSubmit} onCancel={() => setShowLeadForm(false)} />
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
                      {results.internalResults.map(result => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result.url)}
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
                      {results.externalResults.map(result => (
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
                {!isSearching && results && results.internalResults.length === 0 && results.externalResults.length === 0 && (
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
      </div>
    </div>
  );
}

// Lead Form Component
function LeadForm({ onSubmit, onCancel }: { onSubmit: (data: { name: string; email: string; phone?: string; company?: string }) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onSubmit({ name, email, phone, company });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name *"
        required
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address *"
        required
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="px-3 py-2 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none"
        />
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company (optional)"
          className="px-3 py-2 text-sm border border-gray-200 dark:border-zinc-600 rounded-lg focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#00D4FF] text-white text-sm font-medium rounded-lg hover:bg-[#00B8E6] transition-colors"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}