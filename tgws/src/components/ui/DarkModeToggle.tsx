'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'auto' | 'light' | 'dark';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem('theme');
  if (stored === 'auto' || stored === 'light' || stored === 'dark') return stored;
  return 'auto';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'auto' ? getSystemTheme() : mode;
}

function applyTheme(mode: ThemeMode) {
  const theme = resolveTheme(mode);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

const MODES: { key: ThemeMode; icon: typeof Sun; label: string; title: string }[] = [
  { key: 'auto', icon: Monitor, label: 'Auto', title: 'Follow system preference' },
  { key: 'light', icon: Sun, label: 'Light', title: 'Light mode' },
  { key: 'dark', icon: Moon, label: 'Dark', title: 'Dark mode' },
];

// Returns true only after hydration completes; SSR renders false so the
// placeholder markup matches the server, then the real control mounts.
const emptySubscribe = () => () => {};

export default function DarkModeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  // Lazy init reads localStorage only on first client render; SSR yields 'auto'
  // without touching localStorage, so server/client markup stays consistent.
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());

  const applyAndStore = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme', newMode);
    applyTheme(newMode);
  }, []);

  useEffect(() => {
    applyTheme(mode);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (getStoredMode() === 'auto') applyTheme('auto');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  if (!mounted) {
    return <div className="flex gap-1" />;
  }

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Theme selector">
      {MODES.map(({ key, icon: Icon, title }) => (
        <button
          key={key}
          onClick={() => applyAndStore(key)}
          role="radio"
          aria-checked={mode === key}
          aria-label={`Theme: ${key}`}
          title={title}
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
            mode === key
              ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
