'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Headphones, BookOpen, CreditCard, Shield, MessageCircle } from 'lucide-react';
import FAQAccordion from '@/components/ui/FAQAccordion';
import { FAQJsonLd } from '@/components/ui/JsonLd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';

const categories = ['all', 'product', 'technical', 'account', 'billing'] as const;
type Category = (typeof categories)[number];

const categoryIcons: Record<Category, React.ReactNode> = {
  all: <BookOpen size={18} />,
  product: <Headphones size={18} />,
  technical: <Shield size={18} />,
  account: <MessageCircle size={18} />,
  billing: <CreditCard size={18} />,
};

export default function HelpPage() {
  const t = useTranslations('help');
  const params = useParams();
  const locale = params.locale as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const faqItems = useMemo(() => {
    const items: { category: Category; question: string; answer: string }[] = [];

    const productCount = Number(t('faqCounts.product'));
    for (let i = 0; i < productCount; i++) {
      items.push({
        category: 'product',
        question: t(`faq.product.${i}.q`),
        answer: t(`faq.product.${i}.a`),
      });
    }

    const technicalCount = Number(t('faqCounts.technical'));
    for (let i = 0; i < technicalCount; i++) {
      items.push({
        category: 'technical',
        question: t(`faq.technical.${i}.q`),
        answer: t(`faq.technical.${i}.a`),
      });
    }

    const accountCount = Number(t('faqCounts.account'));
    for (let i = 0; i < accountCount; i++) {
      items.push({
        category: 'account',
        question: t(`faq.account.${i}.q`),
        answer: t(`faq.account.${i}.a`),
      });
    }

    const billingCount = Number(t('faqCounts.billing'));
    for (let i = 0; i < billingCount; i++) {
      items.push({
        category: 'billing',
        question: t(`faq.billing.${i}.q`),
        answer: t(`faq.billing.${i}.a`),
      });
    }

    return items;
  }, [t]);

  const filteredFaqs = useMemo(() => {
    let items = faqItems;

    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return items;
  }, [faqItems, activeCategory, searchQuery]);

  const categoryLabels: Record<Category, string> = {
    all: t('categories.all'),
    product: t('categories.product'),
    technical: t('categories.technical'),
    account: t('categories.account'),
    billing: t('categories.billing'),
  };

  return (
    <>
      <FAQJsonLd items={faqItems.map(item => ({ question: item.question, answer: item.answer }))} />
      <Breadcrumb items={[{ label: 'Help' }]} />
      <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto max-w-2xl">{t('subtitle')}</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent focus:outline-none transition-colors shadow-sm text-[15px]"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
              activeCategory === cat
                ? 'bg-[#00D4FF] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#00D4FF]/30 hover:text-[#00D4FF]'
            }`}
          >
            {categoryIcons[cat]}
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto">
        {filteredFaqs.length > 0 ? (
          <FAQAccordion items={filteredFaqs} />
        ) : (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <Search size={40} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('noResults')}</h2>
            <p className="text-sm text-gray-500">{t('noResultsHint')}</p>
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="max-w-3xl mx-auto mt-16">
        <div className="bg-gradient-to-br from-[#00D4FF]/5 to-[#7B61FF]/5 border border-gray-200 rounded-2xl p-8 sm:p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('ctaTitle')}</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto">{t('ctaDesc')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${locale}/contact`}
              className="px-6 py-3 bg-[#00D4FF] text-white font-medium rounded-full hover:bg-[#00B8DB] transition-colors text-sm min-h-[44px] inline-flex items-center"
            >
              {t('ctaContact')}
            </Link>
            <Link
              href={`/${locale}/support`}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors text-sm min-h-[44px] inline-flex items-center"
            >
              {t('ctaTicket')}
            </Link>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
