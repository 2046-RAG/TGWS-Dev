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

const MODES: ThemeMode[] = ['auto', 'light', 'dark'];

// Returns true only after hydration completes; SSR renders false so the
// placeholder markup matches the server, then the real control mounts.
const emptySubscribe = () => () => {};

export default function ThemeToggle() {
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

  const cycleTheme = () => {
    const currentIndex = MODES.indexOf(mode);
    const nextIndex = (currentIndex + 1) % MODES.length;
    applyAndStore(MODES[nextIndex]);
  };

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
    return <div className="w-9 h-9" />;
  }

  const Icon = mode === 'auto' ? Monitor : mode === 'light' ? Sun : Moon;
  const title = mode === 'auto' ? 'Auto (System)' : mode === 'light' ? 'Light Mode' : 'Dark Mode';

  return (
    <button
      onClick={cycleTheme}
      className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
      title={title}
      aria-label={`Theme: ${mode}`}
    >
      <Icon size={16} className="text-gray-600 dark:text-gray-300" />
    </button>
  );
}
