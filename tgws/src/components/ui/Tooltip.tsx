'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  side?: 'top' | 'bottom';
}

export default function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>(side);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!visible || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    if (side === 'top' && rect.top < 48) {
      setPosition('bottom');
    } else if (side === 'bottom' && rect.bottom > window.innerHeight - 48) {
      setPosition('top');
    } else {
      setPosition(side);
    }
  }, [visible, side]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children ?? (
        <button
          type="button"
          className="text-gray-400 hover:text-[#00D4FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 rounded"
          tabIndex={0}
          aria-label="More information"
        >
          <HelpCircle size={16} />
        </button>
      )}
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute z-50 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg whitespace-normal max-w-[240px] pointer-events-none transition-opacity duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${
          position === 'top'
            ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
            : 'top-full left-1/2 -translate-x-1/2 mt-2'
        }`}
      >
        {content}
        <span
          className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 ${
            position === 'top'
              ? 'top-full -mt-1'
              : 'bottom-full -mb-1'
          }`}
        />
      </span>
    </span>
  );
}
