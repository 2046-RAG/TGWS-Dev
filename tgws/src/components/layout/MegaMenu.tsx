'use client';

import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';

interface MegaMenuProps {
  items: MegaMenuItem[];
}

interface MegaMenuItem {
  key: string;
  label: string;
  href: string;
  children?: { label: string; href: string; desc?: string }[];
}

export default function MegaMenu({ items }: MegaMenuProps) {
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
    <div className="hidden md:flex items-center gap-8">
      {items.map((item) => (
        <div
          key={item.key}
          className="relative"
          onMouseEnter={() => item.children && handleEnter(item.key)}
          onMouseLeave={handleLeave}
        >
          <Link
            href={item.href}
            className="text-[16px] text-black hover:opacity-60 transition-opacity duration-200"
          >
            {item.label}
          </Link>

          {item.children && activeKey === item.key && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
              onMouseEnter={() => handleEnter(item.key)}
              onMouseLeave={handleLeave}
            >
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 min-w-[320px] max-w-[480px]">
                <div className="grid gap-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="text-sm font-medium text-gray-900 group-hover:text-[#00D4FF] transition-colors">
                        {child.label}
                      </div>
                      {child.desc && (
                        <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">
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
      ))}
    </div>
  );
}
