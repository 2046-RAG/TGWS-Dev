'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Calendar, ArrowRight, Star, Clock, User } from 'lucide-react';
import Image from 'next/image';
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

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 ${
              activeCategory === cat
                ? 'bg-[#00D4FF] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Featured Post - Magazine Hero Layout */}
      {featuredPost && (
        <div className="mb-16 scroll-reveal">
          <Link href={`/${locale}/blog/${featuredPost.slug?.current}`}>
            <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:shadow-xl transition-all cursor-pointer">
              <div className="grid md:grid-cols-5 gap-0">
                {/* Image Section - 3 columns */}
                <div className="md:col-span-3 relative h-64 md:h-[400px]">
                  {featuredPost.mainImage ? (
                    <Image
                      src={typeof featuredPost.mainImage === 'string' && featuredPost.mainImage.startsWith('http')
                        ? featuredPost.mainImage
                        : urlFor(featuredPost.mainImage).width(800).height(500).url()}
                      alt={featuredPost.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7B61FF]/20 flex items-center justify-center">
                      <span className="text-8xl font-bold text-gray-200">
                        {featuredPost.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-[#00D4FF] text-white shadow-lg">
                      {t(`categories.${featuredPost.category}`)}
                    </span>
                  </div>
                  {/* Featured Badge */}
                  {featuredPost.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-lg">
                        <Star size={12} className="fill-current" />
                        {t('featured') || 'Featured'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section - 2 columns */}
                <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(featuredPost.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatReadingTime(featuredPost.excerpt)}
                    </div>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-3 group-hover:text-[#00D4FF] transition-colors duration-200">
                    {locale === 'zh' ? (featuredPost.titleZh || featuredPost.title) : featuredPost.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 line-clamp-4 leading-relaxed" style={{ lineHeight: '1.7' }}>
                    {locale === 'zh' ? (featuredPost.excerptZh || featuredPost.excerpt) : featuredPost.excerpt}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
                      <User size={18} className="text-[#00D4FF]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{featuredPost.author}</div>
                      <div className="text-xs text-gray-500">{t('author') || 'Author'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#00D4FF] font-semibold group-hover:gap-4 transition-all">
                    {t('readMore')}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </div>
      )}

      {/* Remaining Posts - Editorial Grid */}
      {remainingPosts.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {remainingPosts.map((post, index) => (
            <div
              key={post._id}
              className="scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/${locale}/blog/${post.slug?.current}`}>
                <article className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-48">
                    {post.mainImage ? (
                      <Image
                        src={typeof post.mainImage === 'string' && post.mainImage.startsWith('http')
                          ? post.mainImage
                          : urlFor(post.mainImage).width(400).height(200).url()}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#00D4FF]/10 to-[#7B61FF]/10 flex items-center justify-center">
                        <span className="text-5xl font-bold text-gray-200">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                        {t(`categories.${post.category}`)}
                      </span>
                    </div>
                    {/* Featured Star */}
                    {post.featured && (
                      <div className="absolute top-3 right-3">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatReadingTime(post.excerpt)}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#00D4FF] transition-colors duration-200">
                      {locale === 'zh' ? (post.titleZh || post.title) : post.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                      {locale === 'zh' ? (post.excerptZh || post.excerpt) : post.excerpt}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
                        <User size={12} className="text-[#00D4FF]" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{post.author}</span>
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