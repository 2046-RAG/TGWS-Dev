'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Copy, Check, Mail, Code2, Sparkles, ArrowRight, Monitor } from 'lucide-react';
import ParticleNetwork from './ParticleNetwork';

/**
 * Hero Section
 *
 * Features:
 * 1. Three.js particle network background with mouse-following interaction
 * 2. Typewriter effect for brand tagline
 * 3. Brand subtitle with opacity hierarchy
 * 4. CTA button group + email copy
 * 5. Three storyline cards (Build.Run.Protect / AI Journey / VMware)
 */

// 邮箱地址
const EMAIL = 'Inquiries@techguru-it.asia';

// 打字机速度（毫秒/字符）
const TYPING_SPEED = 38;

// 打字机启动延迟（毫秒）
const START_DELAY = 600;

/**
 * 打字机效果 Hook
 * @param text - 要显示的文本
 * @param speed - 每个字符的显示间隔（毫秒）
 * @param delay - 开始打字前的延迟（毫秒）
 * @returns { displayed: 已显示的文本, done: 是否打完 }
 */
function useTypewriter(text: string, speed = TYPING_SPEED, delay = START_DELAY) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const timeoutId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(intervalId);
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, delay]);

  return { displayed, done };
}

export default function HeroSection() {
  const t = useTranslations('hero');
  const params = useParams();
  const locale = params.locale as string;
  const [copied, setCopied] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // 打字机效果
  const fullText = t('tagline');
  const { displayed, done } = useTypewriter(fullText);

  // CTA按钮延迟显示
  useEffect(() => {
    const timer = setTimeout(() => setShowButtons(true), 400);
    return () => clearTimeout(timer);
  }, []);

  /**
   * 复制邮箱到剪贴板
   * 优先使用 Clipboard API，降级使用 execCommand（兼容旧浏览器）
   */
  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API 失败时的降级方案
      const textarea = document.createElement('textarea');
      textarea.value = EMAIL;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // CTA按钮配置 — 3个：主行动/次行动/联系方式
  const ctaLinks = [
    { href: `/${locale}/products`, label: t('cta.solutions'), primary: true },
    { href: `/${locale}/contact`, label: t('cta.demo'), primary: false },
    { href: `/${locale}/vmware-alternative`, label: t('cta.vmware'), primary: false },
  ];

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden flex flex-col bg-[#0a0a0f]">
      {/* Three.js 粒子网络背景 — Suspense包裹防止SSR崩溃 */}
      <Suspense fallback={null}>
        <ParticleNetwork />
      </Suspense>

      {/* 深色渐变遮罩 — 左深右浅，增强文字对比度 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent z-[1]" />
      {/* 移动端额外遮罩 */}
      <div className="absolute inset-0 bg-black/20 md:hidden z-[1]" />

      {/* 内容区 — flex-1占据剩余空间，垂直居中 */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 sm:px-8 md:px-10">
        <div className="max-w-xl">
          {/* 品牌副标题 — 半透明白色，不再模糊 */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6"
            style={{ fontSize: 'clamp(16px, 3.5vw, 22px)', lineHeight: 1.3, fontWeight: 400, color: 'rgba(255,255,255,0.65)' }}
          >
            <p>{t('heroLabel.line1')}</p>
            <p>{t('heroLabel.line2')}</p>
          </div>

          {/* 打字机主标题 */}
          <h1
            className="mb-5 sm:mb-6"
            style={{ fontSize: 'clamp(22px, 5vw, 34px)', lineHeight: 1.3, fontWeight: 800, color: '#fff', minHeight: '54px' }}
          >
            {displayed}
            {!done && (
              <span
                className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px]"
                style={{ animation: 'blink 1s step-end infinite' }}
              />
            )}
          </h1>

          {/* CTA按钮组 */}
          <div
            className={`flex flex-wrap gap-3 ${showButtons ? 'opacity-100' : 'opacity-0'}`}
            style={{ transform: showButtons ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}
          >
            {ctaLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center justify-center rounded-full text-[14px] sm:text-[15px] px-5 sm:px-6 py-3 min-h-[44px] whitespace-nowrap transition-colors duration-200 ${
                  link.primary
                    ? 'bg-[#00D4FF] text-white hover:bg-[#00B8DB]'
                    : 'bg-white/10 text-white border border-white/25 hover:bg-white/20'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* 邮箱复制按钮 */}
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 sm:gap-3 text-white/80 bg-transparent border border-white/20 rounded-full text-[13px] sm:text-[14px] px-4 sm:px-5 py-3 min-h-[44px] whitespace-nowrap hover:bg-white/10 hover:text-white transition-colors duration-200"
            >
              <Mail size={14} className="shrink-0" /> <span>{EMAIL}</span>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* 滚动提示 */}
      <div className="relative z-10 flex justify-center pb-4">
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/15 hover:border-white/40 transition-all duration-300"
          aria-label="Scroll down"
        >
          <span className="absolute inset-0 rounded-full border border-white/15 animate-ping" style={{ animationDuration: '2s' }} />
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-white/90 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </button>
      </div>

      {/* ═══ Three Storylines — 底部卡片，流式布局不被裁切 ═══ */}
      <div className="relative z-10 pb-6 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Build.Run.Protect. */}
            <Link
              href={`/${locale}/products`}
              className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center shrink-0">
                  <Code2 size={18} className="text-[#00D4FF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">Build. Run. Protect.</h3>
                  <p className="text-white/50 text-xs">Core Infrastructure</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                End-to-end IT lifecycle. From AI workloads to mission-critical security.
              </p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-white/50" />
              </div>
            </Link>

            {/* AI Journey */}
            <Link
              href={`/${locale}/products`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7B61FF]/20 to-[#00D4FF]/10 backdrop-blur-md border border-[#7B61FF]/30 p-4 sm:p-5 hover:from-[#7B61FF]/30 hover:to-[#00D4FF]/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#7B61FF]/20 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-[#7B61FF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">AI Journey</h3>
                  <p className="text-white/50 text-xs">Intelligent Transformation</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                AI Adoption, AIGC, Coding Assistants, Legacy AI, AI Agents.
              </p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-white/50" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#7B61FF]/10 rounded-full blur-2xl" />
            </Link>

            {/* VMware Alternatives */}
            <Link
              href={`/${locale}/vmware-alternative`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 hover:border-white/25 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Monitor size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">VMware Alternatives</h3>
                  <p className="text-white/50 text-xs">Migration & Freedom</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                5 proven alternatives. Dual-hypervisor architecture. Zero lock-in.
              </p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-white/50" />
              </div>
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}
