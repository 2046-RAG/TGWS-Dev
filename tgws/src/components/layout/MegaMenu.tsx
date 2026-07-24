'use client';

import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';

interface MegaMenuProps {
  items: MegaMenuItem[];
  activePath?: string;
}

interface MegaMenuItem {
  key: string;
  label: string;
  href: string;
  children?: { label: string; href: string; desc?: string }[];
}

export default function MegaMenu({ items, activePath }: MegaMenuProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = useCallback((key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveKey(key);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveKey(null), 150);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-6">
      {items.map((item) => {
        const isActive = activePath === item.href || activePath?.startsWith(item.href + '/');
        return (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() => item.children && handleEnter(item.key)}
            onMouseLeave={handleLeave}
            onFocus={() => item.children && handleEnter(item.key)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) handleLeave(); }}
            onKeyDown={(e) => { if (e.key === 'Escape') handleLeave(); }}
          >
            <Link
              href={item.href}
              className={`nav-link relative text-[14px] font-medium tracking-[-0.01em] py-1 transition-colors duration-200 ${
                isActive
                  ? 'text-[#00D4FF]'
                  : 'text-black/70 dark:text-white/70 hover:text-[#00D4FF]'
              }`}
            >
              {item.label}
              {/* Active/hover underline */}
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-[#00D4FF] transition-all duration-200 ease-out ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
                style={isActive ? {} : { width: undefined }}
              />
            </Link>

            {item.children && activeKey === item.key && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
                onMouseEnter={() => handleEnter(item.key)}
                onMouseLeave={handleLeave}
              >
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl p-6 min-w-[320px] max-w-[480px]">
                  <div className="grid gap-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-3 rounded-xl hover:bg-[#00D4FF]/5 dark:hover:bg-[#00D4FF]/10 transition-colors duration-150 group"
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#00D4FF] transition-colors duration-150">
                          {child.label}
                        </div>
                        {child.desc && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                            {child.desc}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
