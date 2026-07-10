'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Share2, Clock, HelpCircle, Star, Copy, Check, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity.image';
import { useState } from 'react';

interface PortableTextBlock {
  _type: string;
  style?: string;
  children?: { _type: string; text: string; marks?: string[] }[];
  language?: string;
  code?: string;
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
  coverImage: string;
  tags: string[];
}

// 代码块组件
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-400 text-sm">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 bg-gray-900 text-gray-100 overflow-x-auto text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Callout组件
function CalloutBox({ type, children }: { type: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', icon: Info, label: 'Key Takeaway' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', icon: AlertTriangle, label: 'Warning' },
    tip: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', icon: Lightbulb, label: 'Pro Tip' },
  };

  const s = styles[type];
  const Icon = s.icon;

  return (
    <div className={`my-6 p-4 rounded-xl border-l-4 ${s.bg} ${s.border}`}>
      <div className={`flex items-center gap-2 ${s.text} font-medium mb-2`}>
        <Icon size={18} />
        {s.label}
      </div>
      <div className={`${s.text.replace('700', '800')}`}>{children}</div>
    </div>
  );
}

// PortableText渲染器
function PortableText({ content }: { content: PortableTextBlock[] }) {
  if (!content || !Array.isArray(content)) return null;

  return (
    <div className="article-content">
      {content.map((block, i) => {
        // 代码块
        if (block._type === 'code') {
          return <CodeBlock key={i} code={block.code || ''} language={block.language} />;
        }

        // 文本块
        if (block._type === 'block') {
          const text = block.children?.map((c) => c.text).join('') || '';

          // 检查是否是callout（通过特殊标记）
          if (text.startsWith('[INFO]')) {
            return <CalloutBox key={i} type="info">{text.replace('[INFO]', '').trim()}</CalloutBox>;
          }
          if (text.startsWith('[WARNING]')) {
            return <CalloutBox key={i} type="warning">{text.replace('[WARNING]', '').trim()}</CalloutBox>;
          }
          if (text.startsWith('[TIP]')) {
            return <CalloutBox key={i} type="tip">{text.replace('[TIP]', '').trim()}</CalloutBox>;
          }

          // 标题
          if (block.style === 'h2') {
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <h2 key={i} id={id} className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-200">
                <a href={`#${id}`} className="hover:text-[#00D4FF] transition-colors">
                  {text}
                </a>
              </h2>
            );
          }
          if (block.style === 'h3') {
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <h3 key={i} id={id} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
                <a href={`#${id}`} className="hover:text-[#00D4FF] transition-colors">
                  {text}
                </a>
              </h3>
            );
          }

          // 引用
          if (block.style === 'blockquote') {
            return (
              <blockquote key={i} className="my-6 pl-4 border-l-4 border-[#00D4FF] text-gray-600 italic">
                {text}
              </blockquote>
            );
          }

          // 普通段落
          return <p key={i} className="text-gray-700 leading-relaxed mb-4">{text}</p>;
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

  // 估算阅读时间
  const content = locale === 'zh' ? (post.contentZh || post.content) : post.content;
  const wordCount = content?.reduce((acc, block) => {
    if (block._type === 'block') {
      return acc + (block.children?.map(c => c.text).join(' ') || '').split(/\s+/).length;
    }
    return acc;
  }, 0) || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <section className="py-12 sm:py-20 px-5 sm:px-8 max-w-4xl mx-auto">
      <article className="scroll-reveal">
        {/* 返回链接 */}
        <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 py-2 px-1 text-gray-600 hover:text-[#00D4FF] min-h-[44px] mb-6 transition-colors">
          <ArrowLeft size={16} />
          {t('backToBlog')}
        </Link>

        {/* 封面图 */}
        {post.coverImage && (
          <div className="relative mb-8 rounded-2xl overflow-hidden">
            <Image
              src={typeof post.coverImage === 'string' && post.coverImage.startsWith('http')
                ? post.coverImage
                : urlFor(post.coverImage).width(1200).height(600).url()}
              alt={post.title}
              width={1200}
              height={600}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="w-full h-64 sm:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        {/* 文章头部 */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#00D4FF]/10 text-[#00D4FF]">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={12} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="text-xs text-gray-500">· {readTime} min read</span>
            {post.featured && (
              <span className="flex items-center gap-1 text-xs text-yellow-600">
                <Star size={12} className="fill-yellow-500" />
                Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {locale === 'zh' ? (post.titleZh || post.title) : post.title}
          </h1>

          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {locale === 'zh' ? (post.excerptZh || post.excerpt) : post.excerpt}
          </p>

          <div className="flex items-center justify-between py-4 border-y border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
                <span className="text-[#00D4FF] font-medium text-sm">{post.author?.charAt(0) || 'T'}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{post.author}</p>
                <p className="text-xs text-gray-500">TechGuru Team</p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-lg text-sm text-gray-600 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-colors"
            >
              <Share2 size={14} />
              {t('share')}
            </button>
          </div>
        </header>

        {/* 文章内容 */}
        <div className="max-w-none">
          <PortableText content={content} />
        </div>

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#00D4FF]/5 to-[#7B61FF]/5 border border-gray-200 rounded-2xl p-8 text-center mt-12">
          <HelpCircle className="mx-auto mb-4 text-[#00D4FF]" size={40} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cta')}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('ctaDesc')}</p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00D4FF] text-white font-medium hover:bg-[#00B8DB] transition-colors"
          >
            {t('ctaBtn')}
          </Link>
        </div>
      </article>
    </section>
  );
}