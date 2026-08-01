'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import TcoCalculatorClient from '@/components/ui/TcoCalculatorClient';
import type { TcoCalculatorConfig } from '@/lib/tco';

export default function TcoCalculatorSection({ locale }: { locale: string }) {
  const [config, setConfig] = useState<TcoCalculatorConfig | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/tco')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && data.data?.scenarios?.length) {
          setConfig(data.data);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="py-20 px-5 sm:px-8 bg-gradient-to-b from-white to-[#F4F4F5] dark:from-zinc-800/50 dark:to-zinc-900">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-400 text-sm">{locale === 'zh' ? 'TCO 计算器暂时不可用' : 'TCO calculator temporarily unavailable'}</p>
        </div>
      </section>
    );
  }

  if (!config) {
    return (
      <section className="py-20 px-5 sm:px-8 bg-gradient-to-b from-white to-[#F4F4F5] dark:from-zinc-800/50 dark:to-zinc-900">
        <div className="max-w-5xl mx-auto flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-[#00D4FF]" />
        </div>
      </section>
    );
  }

  return <TcoCalculatorClient config={config} locale={locale} />;
}
