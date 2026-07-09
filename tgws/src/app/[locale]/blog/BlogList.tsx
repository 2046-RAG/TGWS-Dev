'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Calendar, ArrowRight, Star, Clock, User, Tag } from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity.image';

const categories = ['all', 'news', 'technical', 'case-study', 'industry'];

const categoryColors: Record<string, string> = {
  news: '#00D4FF',
  technical: '#7B61FF',
  'case-study': '#22C55E',
  industry: '#F59E0B',
};

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
  coverImage: string;
  tags: string[];
}

export default function BlogList({ posts }: { posts: Post[] }) {
  const t = useTranslations('blog');
  const params = useParams();
  const locale = params.locale as string;
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all' ? posts : posts.filter((p) => p.category === activeCategory);
  const featuredPost = filtered.find(p => p.featured) || filtered[0];
  const remainingPosts = filtered.filter(p => p._id !== featuredPost?._id);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} ${t('readingTime') || 'min read'}`;
  };

  return (
    <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="section-title text-gray-900">{t('title')}</h1>
        <p className="section-subtitle mx-auto">{t('subtitle')}</p>
      </div>

      {/* Category Tabs - Editorial Style */}
      <div className="flex flex-wrap justify-center gap-2 mb-14">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
              activeCategory === cat
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Featured Post - Full Width Editorial Hero */}
      {featuredPost && (
        <div className="mb-16 scroll-reveal">
          <Link href={`/${locale}/blog/${featuredPost.slug?.current}`}>
            <article className="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[420px] md:min-h-[480px] flex items-end">
              {/* Background Image */}
              <div className="absolute inset-0">
                {featuredPost.coverImage ? (
                  <Image
                    src={typeof featuredPost.coverImage === 'string' && featuredPost.coverImage.startsWith('http')
                      ? featuredPost.coverImage
                      : urlFor(featuredPost.coverImage).width(1200).height(600).url()}
                    alt={featuredPost.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 p-8 md:p-12 w-full">
                {/* Top Badges */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: categoryColors[featuredPost.category] || '#00D4FF' }}
                  >
                    {t(`categories.${featuredPost.category}`)}
                  </span>
                  {featuredPost.featured && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                      <Star size={12} className="fill-current" />
                      {t('featured') || 'Featured'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 max-w-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  {locale === 'zh' ? (featuredPost.titleZh || featuredPost.title) : featuredPost.title}
                </h2>

                {/* Excerpt */}
                <p className="text-white/70 mb-6 max-w-2xl line-clamp-2 leading-relaxed">
                  {locale === 'zh' ? (featuredPost.excerptZh || featuredPost.excerpt) : featuredPost.excerpt}
                </p>

                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{formatDate(featuredPost.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{formatReadingTime(featuredPost.excerpt)}</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </div>
      )}

      {/* Remaining Posts - Two-Column Editorial List */}
      {remainingPosts.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {remainingPosts.map((post, index) => (
            <div
              key={post._id}
              className="scroll-reveal"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <Link href={`/${locale}/blog/${post.slug?.current}`}>
                <article className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full">
                  {/* Image with category color accent */}
                  <div className="relative h-44">
                    {post.coverImage ? (
                      <Image
                        src={typeof post.coverImage === 'string' && post.coverImage.startsWith('http')
                          ? post.coverImage
                          : urlFor(post.coverImage).width(600).height(300).url()}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loading="lazy"
                        decoding="async"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-6xl font-bold text-gray-200">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Category color bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: categoryColors[post.category] || '#00D4FF' }}
                    />
                    {/* Date badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700">
                      {formatDate(post.publishedAt)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Category + Reading Time */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ color: categoryColors[post.category] || '#00D4FF', backgroundColor: `${categoryColors[post.category] || '#00D4FF'}15` }}
                      >
                        {t(`categories.${post.category}`)}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} />
                        {formatReadingTime(post.excerpt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#00D4FF] transition-colors duration-200">
                      {locale === 'zh' ? (post.titleZh || post.title) : post.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
                      {locale === 'zh' ? (post.excerptZh || post.excerpt) : post.excerpt}
                    </p>

                    {/* Author + Tags */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={12} className="text-gray-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{post.author}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Tag size={11} />
                          <span>{post.tags[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">{t('noResults') || 'No posts found for this category.'}</p>
        </div>
      )}
    </section>
  );
}
