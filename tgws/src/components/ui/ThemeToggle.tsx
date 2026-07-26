'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [mounted, setMounted] = useState(false);

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
    const initial = getStoredMode();
    setMode(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

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