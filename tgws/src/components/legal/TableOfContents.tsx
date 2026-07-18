'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Printer, List } from 'lucide-react';

export interface TocSection {
  /** DOM id of the heading element this entry links to. */
  id: string;
  /** Display text shown in the TOC (typically the heading text, no number prefix). */
  title: string;
}

interface TableOfContentsProps {
  sections: TocSection[];
  /** Localized "On this page" label. */
  tocLabel: string;
  /** Localized "Print this page" button label. */
  printLabel: string;
}

/**
 * Table of contents for legal pages (Privacy / Terms).
 *
 * Renders two synchronized views inside one component:
 *  - Desktop sticky sidebar (visible `lg:block`, hidden on smaller screens)
 *  - Mobile collapsible panel (visible below `lg`, hidden on desktop)
 *
 * The active section is highlighted via IntersectionObserver. Reduces motion
 * is respected by skipping the observer entirely (no highlight) — the TOC
 * still functions as anchor links.
 *
 * Print button calls `window.print()`. The whole component is hidden in
 * print output via `print:hidden` on the parent <aside> in the page.
 */
export default function TableOfContents({
  sections,
  tocLabel,
  printLabel,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') return;

    // Respect prefers-reduced-motion: skip scroll-spy entirely.
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting entry to set as active.
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id);
        }
      },
      {
        // Trigger when section heading crosses ~20% from the top of viewport.
        rootMargin: '0px 0px -80% 0px',
        threshold: [0, 1],
      }
    );

    const observed: HTMLElement[] = [];
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    });

    return () => {
      observed.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [sections]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleMobileAnchorClick = () => setMobileOpen(false);

  return (
    <>
      {/* Desktop sticky sidebar — visible lg+ */}
      <nav
        aria-label={tocLabel}
        className="hidden lg:block sticky top-24 print:hidden"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          {tocLabel}
        </h2>
        <ul className="space-y-0.5 text-sm border-l border-gray-200 dark:border-gray-700">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`block pl-3 py-1.5 transition-colors ${
                  activeId === s.id
                    ? 'text-[#00D4FF] border-l-2 border-[#00D4FF] -ml-px font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#00D4FF]'
                }`}
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handlePrint}
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#00D4FF] hover:underline min-h-[44px]"
        >
          <Printer size={14} aria-hidden="true" />
          {printLabel}
        </button>
      </nav>

      {/* Mobile / tablet collapsible — hidden lg+ */}
      <nav
        aria-label={tocLabel}
        className="lg:hidden print:hidden"
      >
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 min-h-[44px]"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <List size={16} aria-hidden="true" />
            {tocLabel}
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`transition-transform duration-200 ${
              mobileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {mobileOpen && (
          <ul className="space-y-0.5 text-sm py-3">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={handleMobileAnchorClick}
                  className={`block py-1.5 min-h-[44px] ${
                    activeId === s.id
                      ? 'text-[#00D4FF] font-medium'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {s.title}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 py-1.5 text-[#00D4FF] min-h-[44px]"
              >
                <Printer size={14} aria-hidden="true" />
                {printLabel}
              </button>
            </li>
          </ul>
        )}
      </nav>
    </>
  );
}
