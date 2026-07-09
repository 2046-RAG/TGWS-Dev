'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Building2,
  ShoppingCart,
  Truck,
  GraduationCap,
  Landmark,
  ArrowRight,
} from 'lucide-react';

interface Solution {
  _id: string;
  title: string;
  slug: string;
  industry: string;
  description: string;
  descriptionZh: string;
  challenges?: string[];
  recommendedProducts?: string[];
  image?: string;
}

const industryConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  healthcare: { icon: Heart, color: '#00D4FF', label: 'Healthcare' },
  finance: { icon: Building2, color: '#7B61FF', label: 'Finance' },
  retail: { icon: ShoppingCart, color: '#22C55E', label: 'Retail' },
  logistics: { icon: Truck, color: '#F59E0B', label: 'Logistics' },
  education: { icon: GraduationCap, color: '#EC4899', label: 'Education' },
  government: { icon: Landmark, color: '#6366F1', label: 'Government' },
};

export default function SolutionsList({ solutions }: { solutions: Solution[] }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const industries = useMemo(() => {
    const seen = new Set<string>();
    return solutions
      .filter((s) => s.industry && !seen.has(s.industry) && seen.add(s.industry))
      .map((s) => ({
        key: s.industry,
        ...industryConfig[s.industry],
      }));
  }, [solutions]);

  const initialIndex = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      const idx = industries.findIndex((ind) => ind.key === tab);
      if (idx !== -1) return idx;
    }
    return 0;
  }, [searchParams, industries]);

  const [active, setActive] = useState(initialIndex);

  const activeIndustry = industries[active];
  const filteredSolutions = solutions.filter((s) => s.industry === activeIndustry?.key);

  const getLocalizedText = (solution: Solution) =>
    locale === 'zh' ? (solution.descriptionZh || solution.description) : solution.description;

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="section-title text-gray-900">Industry Solutions</h1>
        <p className="section-subtitle mx-auto">
          Tailored IT solutions for your industry. From infrastructure to security, we deliver results.
        </p>
      </div>

      {/* Industry Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {industries.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <button
              key={ind.key}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
                active === i
                  ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 shadow-md ring-1 ring-[#00D4FF]/20'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <Icon size={18} style={{ color: ind.color }} />
              <span className="text-sm font-medium text-gray-700">{ind.label}</span>
            </button>
          );
        })}
      </div>

      {/* Solutions Grid */}
      <div
        key={active}
        className="animate-fade-up"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSolutions.map((solution) => (
            <div
              key={solution._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#00D4FF]/30 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${activeIndustry.color}15` }}
                >
                  {activeIndustry.icon && (
                    <activeIndustry.icon size={20} style={{ color: activeIndustry.color }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg font-bold text-gray-900 mb-1 line-clamp-2"
                    style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}
                  >
                    {solution.title}
                  </h3>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3" style={{ lineHeight: '1.6' }}>
                {getLocalizedText(solution)}
              </p>

              {solution.recommendedProducts && solution.recommendedProducts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Products
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {solution.recommendedProducts.slice(0, 3).map((product) => (
                      <span
                        key={product}
                        className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                      >
                        {product}
                      </span>
                    ))}
                    {solution.recommendedProducts.length > 3 && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                        +{solution.recommendedProducts.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {solution.challenges && solution.challenges.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1.5">
                    {solution.challenges.slice(0, 2).map((challenge) => (
                      <span
                        key={challenge}
                        className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600"
                      >
                        {challenge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredSolutions.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p>No solutions available for this industry yet.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00D4FF] text-white font-medium rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 text-sm"
          >
            Discuss Your Needs
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
