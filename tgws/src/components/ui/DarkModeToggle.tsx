'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return null;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    const initial = stored || getSystemTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  if (!mounted) {
    return <div className="w-11 h-11" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Dark mode' : 'Light mode'}
    >
      {theme === 'dark' ? (
        <Moon size={16} className="text-gray-200" />
      ) : (
        <Sun size={16} className="text-gray-700" />
      )}
    </button>
  );
}
