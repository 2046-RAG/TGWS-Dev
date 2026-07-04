'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Clock, HelpCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity.image';

interface PortableTextBlock {
  _type: string;
  style?: string;
  children?: { _type: string; text: string }[];
}

interface Post {
  _id: string;
  title: string;
  titleZh: string;
  slug: { current: string };
  category: string;
  excerpt: string;
  excerptZh: string;
  content: PortableTextBlock[];
  contentZh: PortableTextBlock[];
  author: string;
  publishedAt: string;
  featured: boolean;
  mainImage: string;
  tags: string[];
}

function PortableText({ content }: { content: PortableTextBlock[] }) {
  if (!content || !Array.isArray(content)) return null;
  return (
    <div className="prose prose-lg max-w-none">
      {content.map((block, i) => {
        if (block._type === 'block') {
          const text = block.children?.map((c) => c.text).join('') || '';
          if (block.style === 'h2') {
            return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{text}</h2>;
          }
          if (block.style === 'h3') {
            return <h3 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{text}</h3>;
          }
          return <p key={i} className="text-gray-600 leading-relaxed mb-4">{text}</p>;
        }
        return null;
      })}
    </div>
  );
}

export default function BlogDetail({ post, locale }: { post: Post; locale: string }) {
  const t = useTranslations('blog.detail');

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(locale === 'zh' ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, url: window.location.href });
    }
  };

  return (
    <section className="py-20 px-5 sm:px-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={16} />
          {t('backToBlog')}
        </Link>

        {post.mainImage && (
          <Image
            src={typeof post.mainImage === 'string' && post.mainImage.startsWith('http')
              ? post.mainImage
              : urlFor(post.mainImage).width(1200).height(600).url()}
            alt={post.title}
            width={1200}
            height={600}
            className="w-full h-64 sm:h-96 object-cover rounded-2xl mb-8"
          />
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-[#00D4FF]/10 text-[#00D4FF]">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={12} />
              {formatDate(post.publishedAt)}
            </span>
            {post.featured && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {locale === 'zh' ? (post.titleZh || post.title) : post.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {locale === 'zh' ? (post.excerptZh || post.excerpt) : post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>By {post.author}</span>
            <button onClick={handleShare} className="inline-flex items-center gap-2 hover:text-[#00D4FF] transition-colors">
              <Share2 size={14} />
              {t('share')}
            </button>
          </div>
        </div>

        <PortableText content={locale === 'zh' ? (post.contentZh || post.content) : post.content} />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{tag}</span>
            ))}
          </div>
        )}

        <div className="bg-[#00D4FF]/5 border border-gray-200 rounded-2xl p-8 text-center mt-12">
          <HelpCircle className="mx-auto mb-4 text-[#00D4FF]" size={40} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cta')}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('ctaDesc')}</p>
          <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00D4FF] text-white font-medium hover:bg-[#00B8DB] transition-colors">
            {t('ctaBtn')}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}