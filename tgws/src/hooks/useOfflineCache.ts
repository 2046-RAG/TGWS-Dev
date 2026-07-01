'use client';

import { useState, useEffect } from 'react';

interface OfflineCacheState<T> {
  data: T | null;
  isStale: boolean;
  loading: boolean;
}

function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(key);
  return cached ? JSON.parse(cached) : null;
}

export function useOfflineCache<T>(key: string, fetcher: () => Promise<T>) {
  const [state, setState] = useState<OfflineCacheState<T>>(() => {
    const cached = getCachedData<T>(key);
    return {
      data: cached,
      isStale: cached !== null,
      loading: true,
    };
  });

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((fresh) => {
        if (!cancelled) {
          setState({ data: fresh, isStale: false, loading: false });
        }
        localStorage.setItem(key, JSON.stringify(fresh));
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({
            data: prev.data,
            isStale: prev.data !== null,
            loading: false,
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, key]);

  return state;
}