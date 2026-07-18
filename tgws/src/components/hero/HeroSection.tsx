'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Copy, Check, Mail, Code2, Sparkles, ArrowRight, Monitor } from 'lucide-react';

// ═══════════════════════════════════════════════
// Hero Section — Video Background + Mouse Scrubbing
// ═══════════════════════════════════════════════

const EMAIL = 'Inquiries@techguru-it.asia';
const VIDEO_SRC = '/videos/mixkit-hologram-19630.mp4';

const SENSITIVITY = 0.5;
const TYPING_SPEED = 38;
const START_DELAY = 600;

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef(0);
  const prevYRef = useRef(0);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fullText = t('tagline');
  const { displayed, done } = useTypewriter(fullText);
  const typewriterText = prefersReducedMotion ? fullText : displayed;
  const typewriterDone = prefersReducedMotion ? true : done;

  useEffect(() => {
    const timer = setTimeout(() => setShowButtons(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Video mouse scrubbing
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleSeeked = () => {
      seekingRef.current = false;
    };

    const doSeek = () => {
      const video = videoRef.current;
      if (!video || seekingRef.current) {
        requestAnimationFrame(doSeek);
        return;
      }
      seekingRef.current = true;
      if (video.fastSeek) {
        video.fastSeek(targetTimeRef.current);
      } else {
        video.currentTime = targetTimeRef.current;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video) return;
      const deltaX = e.clientX - prevXRef.current;
      const deltaY = e.clientY - prevYRef.current;
      prevXRef.current = e.clientX;
      prevYRef.current = e.clientY;
      if (!video.duration) return;
      const delta = deltaX + deltaY;
      const timeOffset = (delta / (window.innerWidth + window.innerHeight)) * SENSITIVITY * video.duration;
      targetTimeRef.current = Math.max(0, Math.min(targetTimeRef.current + timeOffset, video.duration));
      if (!seekingRef.current) {
        requestAnimationFrame(doSeek);
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('seeked', handleSeeked);
    }
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      const v = videoRef.current;
      if (v) v.removeEventListener('seeked', handleSeeked);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = EMAIL;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const ctaLinks = [
    { href: `/${locale}/products`, label: t('cta.solutions'), primary: true },
    { href: `/${locale}/contact`, label: t('cta.demo'), primary: false },
    { href: `/${locale}/vmware-alternative`, label: t('cta.vmware'), primary: false },
  ];

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden flex flex-col">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '70% center' }}
        src={VIDEO_SRC}
        poster="/images/hero-poster.svg"
        aria-label="TechGuru brand video showing infrastructure and AI technology"
        muted
        playsInline
        preload="auto"
      />

      {/* Gradient overlay — left dark, right transparent */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-black/20 md:hidden z-[1]" />

      {/* Content — flex-1, vertically centered */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 sm:px-8 md:px-10">
        <div className="max-w-xl">
          {/* Brand subtitle — no blur, opacity hierarchy */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6"
            style={{ fontSize: 'clamp(16px, 3.5vw, 22px)', lineHeight: 1.3, fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}
          >
            <p>{t('heroLabel.line1')}</p>
            <p>{t('heroLabel.line2')}</p>
          </div>

          {/* Typewriter title */}
          <h1
            className="mb-5 sm:mb-6"
            style={{ fontSize: 'clamp(22px, 5vw, 34px)', lineHeight: 1.3, fontWeight: 800, color: '#fff', minHeight: '54px' }}
          >
            {typewriterText}
            {!typewriterDone && (
              <span
                className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px]"
                style={{ animation: 'blink 1s step-end infinite' }}
              />
            )}
          </h1>

          {/* CTA buttons */}
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

      {/* Scroll hint */}
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

      {/* Three Storylines — flow layout, no clip */}
      <div className="relative z-10 pb-6 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href={`/${locale}/products`}
              className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center shrink-0">
                  <Code2 size={18} className="text-[#00D4FF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">{t('storyline1Title')}</h3>
                  <p className="text-white/50 text-xs">{t('storyline1Sub')}</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                {t('storyline1Desc')}
              </p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-white/50" />
              </div>
            </Link>

            <Link
              href={`/${locale}/products`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7B61FF]/20 to-[#00D4FF]/10 backdrop-blur-md border border-[#7B61FF]/30 p-4 sm:p-5 hover:from-[#7B61FF]/30 hover:to-[#00D4FF]/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#7B61FF]/20 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-[#7B61FF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">{t('storyline2Title')}</h3>
                  <p className="text-white/50 text-xs">{t('storyline2Sub')}</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                {t('storyline2Desc')}
              </p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-white/50" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#7B61FF]/10 rounded-full blur-2xl" />
            </Link>

            <Link
              href={`/${locale}/vmware-alternative`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 hover:border-white/25 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Monitor size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">{t('storyline3Title')}</h3>
                  <p className="text-white/50 text-xs">{t('storyline3Sub')}</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                {t('storyline3Desc')}
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
