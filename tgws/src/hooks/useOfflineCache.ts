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
  if (!cached) return null;
  try {
    return JSON.parse(cached) as T;
  } catch {
    // Corrupted cache entry must not crash the component subtree on render
    // (AUDIT-200). Discard it.
    localStorage.removeItem(key);
    return null;
  }
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
          // Write only when still mounted; setItem can throw on unmounted
          // nodes (AUDIT-204).
          try {
            localStorage.setItem(key, JSON.stringify(fresh));
          } catch {
            // Storage full / unavailable — cache write is best-effort.
          }
        }
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
    // fetcher identity: callers must memoize inline arrows or the effect
    // re-fetches every render (AUDIT-204).
  }, [fetcher, key]);

  return state;
}
