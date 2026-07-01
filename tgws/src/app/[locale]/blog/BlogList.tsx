'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Star } from 'lucide-react';
import { urlFor } from '@/lib/sanity.image';

const categories = ['all', 'news', 'technical', 'case-study', 'industry'];

interface Post {
  _id: string;
  title: string;
  titleZh: string;
  slug: { current: string };
  category: string;
  excerpt: string;
  excerptZh: string;
  author: string;
  publishedAt: string;
  featured: boolean;
  mainImage: string;
  tags: string[];
}

export default function BlogList({ posts }: { posts: Post[] }) {
  const t = useTranslations('blog');
  const params = useParams();
  const locale = params.locale as string;
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all' ? posts : posts.filter((p) => p.category === activeCategory);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((post) => (
          <Link key={post._id} href={`/${locale}/blog/${post.slug?.current}`}>
            <motion.article
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow"
            >
              {post.mainImage ? (
                <img
                  src={typeof post.mainImage === 'string' && post.mainImage.startsWith('http') 
                    ? post.mainImage 
                    : urlFor(post.mainImage).width(600).height(300).url()}
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-gradient-to-br from-[#00D4FF]/10 to-[#7B61FF]/10 flex items-center justify-center">
                  <span className="text-5xl font-bold text-gray-200">
                    {post.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-[#00D4FF]/10 text-[#00D4FF]">
                    {t(`categories.${post.category}`)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={12} />
                    {formatDate(post.publishedAt)}
                  </span>
                  {post.featured && (
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {locale === 'zh' ? (post.titleZh || post.title) : post.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {locale === 'zh' ? (post.excerptZh || post.excerpt) : post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{post.author}</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#00D4FF] group-hover:gap-2.5 transition-all">
                    {t('readMore')}
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </motion.article>
          </Link>
        ))}
      </motion.div>
    </section>
  );
}