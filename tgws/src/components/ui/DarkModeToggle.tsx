'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR hydration guard: safe, no cascade
    setMounted(true);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const cycleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  if (!mounted) {
    return <div className="w-11 h-11" />;
  }

  return (
    <button
      onClick={cycleTheme}
      className="w-11 h-11 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Theme: ${theme}. Click to cycle.`}
      title={`Theme: ${theme}`}
    >
      {theme === 'dark' ? (
        <Moon size={16} className="text-gray-700 dark:text-gray-200" />
      ) : theme === 'light' ? (
        <Sun size={16} className="text-gray-700 dark:text-gray-200" />
      ) : (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">A</span>
      )}
    </button>
  );
}
