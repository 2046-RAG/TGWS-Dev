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

const MODE_CYCLE: ThemeMode[] = ['auto', 'light', 'dark'];

const MODE_CONFIG: Record<ThemeMode, { icon: typeof Sun; label: string; title: string }> = {
  auto: { icon: Monitor, label: 'Theme: auto (follows system)', title: 'Auto mode' },
  light: { icon: Sun, label: 'Theme: light', title: 'Light mode' },
  dark: { icon: Moon, label: 'Theme: dark', title: 'Dark mode' },
};

export default function DarkModeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [mounted, setMounted] = useState(false);

  const applyAndStore = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme', newMode);
    applyTheme(newMode);
  }, []);

  useEffect(() => {
    const initial = getStoredMode();
    setMode(initial);
    applyTheme(initial);
    setMounted(true);

    // Listen for system preference changes when in auto mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const currentMode = getStoredMode();
      if (currentMode === 'auto') {
        applyTheme('auto');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cycleTheme = () => {
    const currentIndex = MODE_CYCLE.indexOf(mode);
    const nextMode = MODE_CYCLE[(currentIndex + 1) % MODE_CYCLE.length];
    applyAndStore(nextMode);
  };

  if (!mounted) {
    return <div className="w-11 h-11" />;
  }

  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  return (
    <button
      onClick={cycleTheme}
      className="w-11 h-11 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={config.label}
      title={config.title}
    >
      <Icon size={16} className={mode === 'dark' ? 'text-gray-200' : 'text-gray-700'} />
    </button>
  );
}
