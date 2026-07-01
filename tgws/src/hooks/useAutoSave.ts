'use client';

import { useEffect, useCallback, useRef } from 'react';

export function useAutoSave(
  key: string,
  data: Record<string, unknown>,
  intervalMs = 30000
) {
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(dataRef.current).length > 0) {
        localStorage.setItem(key, JSON.stringify(dataRef.current));
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [key, intervalMs]);

  const load = useCallback((): Record<string, unknown> | null => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }, [key]);

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }, [key]);

  return { load, clear };
}