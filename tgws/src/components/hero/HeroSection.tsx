'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Copy, Check } from 'lucide-react';

/**
 * Hero Section 组件
 *
 * 功能：
 * 1. 全屏视频背景，鼠标左右移动控制视频播放进度（scrubbing）
 * 2. 打字机效果显示品牌标语
 * 3. 模糊介绍标签（品牌身份锚点）
 * 4. CTA按钮组 + 邮箱复制功能
 *
 * 视频跟随原理：
 * - 监听 mousemove 事件，计算鼠标水平位移
 * - 根据位移量计算视频时间偏移（SENSITIVITY 控制灵敏度）
 * - 使用 fastSeek() 优先（Chrome支持），降级为 currentTime
 * - 通过 seekingRef 防止 seek 堆积，确保每次只有一个 seek 执行
 */

// 邮箱地址
const EMAIL = 'info@techguru-it.asia';

// 视频源（Cloudfront CDN）
const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4';

// 鼠标移动灵敏度（0.5 = 鼠标移动全屏宽度时，视频播放一半时长）
const SENSITIVITY = 0.5;

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
  const [copied, setCopied] = useState(false);        // 邮箱是否已复制
  const [showButtons, setShowButtons] = useState(false); // CTA按钮是否显示
  const videoRef = useRef<HTMLVideoElement>(null);      // 视频元素引用
  const prevXRef = useRef(0);                          // 上一次鼠标X坐标
  const targetTimeRef = useRef(0);                     // 目标视频时间点
  const seekingRef = useRef(false);                    // 是否正在seek中（防止堆积）

  // 打字机效果
  const fullText = t('tagline');
  const { displayed, done } = useTypewriter(fullText);

  // CTA按钮延迟显示（400ms后淡入）
  useEffect(() => {
    const timer = setTimeout(() => setShowButtons(true), 400);
    return () => clearTimeout(timer);
  }, []);

  /**
   * 视频跟随鼠标效果
   *
   * 核心逻辑：
   * 1. 计算鼠标水平位移 delta
   * 2. 将位移转换为视频时间偏移：delta / 屏幕宽度 * 灵敏度 * 视频总时长
   * 3. 累加到目标时间点，限制在 [0, 视频时长] 范围内
   * 4. 如果当前没有seek在执行，则执行seek
   *
   * 优化点：
   * - 使用 fastSeek() 优先（Chrome），跳过精确帧定位，直接跳到最近关键帧
   * - 通过 seekingRef 确保同一时刻只有一个seek在执行
   * - 使用 requestAnimationFrame 在下一帧执行seek，避免阻塞当前帧
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 执行seek操作
    const doSeek = () => {
      if (!video || seekingRef.current) {
        // 如果正在seek中，等待下一帧重试
        requestAnimationFrame(doSeek);
        return;
      }
      seekingRef.current = true;
      // 优先使用 fastSeek（更快但精度略低），降级为 currentTime
      if (video.fastSeek) {
        video.fastSeek(targetTimeRef.current);
      } else {
        video.currentTime = targetTimeRef.current;
      }
    };

    // seek完成回调，重置seeking标记
    const handleSeeked = () => {
      seekingRef.current = false;
    };

    // 鼠标移动处理
    const handleMouseMove = (e: MouseEvent) => {
      // 计算鼠标水平位移
      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      if (!video.duration) return;

      // 将位移转换为视频时间偏移
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      // 累加到目标时间，限制在有效范围内
      targetTimeRef.current = Math.max(0, Math.min(targetTimeRef.current + timeOffset, video.duration));

      // 如果当前没有seek在执行，触发seek
      if (!seekingRef.current) {
        requestAnimationFrame(doSeek);
      }
    };

    // 绑定事件监听
    video.addEventListener('seeked', handleSeeked);
    window.addEventListener('mousemove', handleMouseMove);

    // 清理事件监听
    return () => {
      video.removeEventListener('seeked', handleSeeked);
      window.removeEventListener('mousemove', handleMouseMove);
    };
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

  // CTA按钮配置
  const ctaLinks = [
    { href: `/${locale}/solutions`, label: t('cta.solutions') },
    { href: `/${locale}/case-studies`, label: t('cta.cases') },
    { href: `/${locale}/contact`, label: t('cta.demo') },
    { href: `/${locale}/products`, label: t('cta.vmware') },
  ];

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden">
      {/* 视频背景 - position:absolute 限制在section内，滚动时不会覆盖下方内容 */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '70% center' }}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
      />

      {/* 内容层 - z-10 确保在视频上方 */}
      <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-8 md:px-10 pb-6 md:pb-0">
        <div className="max-w-xl">
          {/* 模糊介绍标签 - filter:blur(4px) 制造品牌身份锚点效果 */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6"
            style={{ fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: 1.3, fontWeight: 400, color: 'rgba(255,255,255,0.8)', filter: 'blur(4px)' }}
          >
            <p>{t('heroLabel.line1')}</p>
            <p>{t('heroLabel.line2')}</p>
          </div>

          {/* 打字机效果区域 - minHeight:54px 防止文字出现时布局抖动 */}
          <h1
            className="mb-5 sm:mb-6"
            style={{ fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: 1.35, fontWeight: 400, color: '#fff', minHeight: '54px' }}
          >
            {displayed}
            {/* 光标动画 - 打字完成后隐藏 */}
            {!done && (
              <span
                className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px]"
                style={{ animation: 'blink 1s step-end infinite' }}
              />
            )}
          </h1>

          {/* CTA按钮组 - 400ms后淡入+上移动画 */}
          <div
            className={`flex flex-wrap gap-y-1 ${showButtons ? 'opacity-100' : 'opacity-0'}`}
            style={{ transform: showButtons ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}
          >
            {/* 白色pill按钮 - hover反转为黑底白字 */}
            {ctaLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[12px] sm:text-[15px] px-3 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            {/* 邮箱复制按钮 - 透明底+黑色边框 */}
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 sm:gap-3 text-black bg-transparent border border-black rounded-full text-[11px] sm:text-[15px] px-3 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200"
            >
              <span>📧 {EMAIL}</span>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* 滚动提示箭头 - 手机端显示，提示用户下方有内容 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 md:hidden">
        <div style={{ animation: 'bounce 1.5s infinite' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </div>
      </div>

      {/* 视频跟随提示 - 桌面端显示3秒后淡出 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block" style={{ animation: 'fadeOut 1s 3s forwards' }}>
        <p className="text-xs text-white/50 tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)' }}>
          ← Move mouse to control video →
        </p>
      </div>
    </section>
  );
}
