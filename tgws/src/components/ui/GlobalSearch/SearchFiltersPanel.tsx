'use client';

import { Package, Building2, FileText, HelpCircle } from 'lucide-react';

export interface SearchFilters {
  contentType: string[];
  pillar: string[];
  industry: string[];
}

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  color?: string;
}

const contentTypeOptions: FilterOption[] = [
  { value: 'product', label: 'Products', icon: Package },
  { value: 'solution', label: 'Solutions', icon: Building2 },
  { value: 'blog', label: 'Blog', icon: FileText },
  { value: 'faq', label: 'FAQ', icon: HelpCircle },
];

const pillarOptions: FilterOption[] = [
  { value: 'build', label: 'Build', color: '#00D4FF' },
  { value: 'run', label: 'Run', color: '#7B61FF' },
  { value: 'protect', label: 'Protect', color: '#22C55E' },
];

const industryOptions: FilterOption[] = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government' },
];

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onToggle: (category: keyof SearchFilters, value: string) => void;
}

export default function SearchFiltersPanel({ filters, onToggle }: SearchFiltersPanelProps) {
  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl space-y-4">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Content Type</p>
        <div className="flex flex-wrap gap-2">
          {contentTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onToggle('contentType', opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                filters.contentType.includes(opt.value)
                  ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30'
                  : 'bg-white dark:bg-zinc-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-600'
              }`}
            >
              {opt.icon && <opt.icon size={14} />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Product Pillar</p>
        <div className="flex flex-wrap gap-2">
          {pillarOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onToggle('pillar', opt.value)}
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
          {industryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onToggle('industry', opt.value)}
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
  );
}
