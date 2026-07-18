'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

interface AutoSaveOptions {
  intervalMs?: number;
  restoreOnMount?: boolean;
  version?: number;
}

interface AutoSaveData extends Record<string, unknown> {
  __version?: number;
  __timestamp?: number;
}

export function useAutoSave(
  key: string,
  data: Record<string, unknown>,
  options: AutoSaveOptions | number = {}
) {
  const opts: AutoSaveOptions =
    typeof options === 'number' ? { intervalMs: options } : options;
  const { intervalMs = 30000, restoreOnMount = true, version = 1 } = opts;

  const dataRef = useRef(data);
  const restoredDraftRef = useRef<Record<string, unknown> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [restoredDraft, setRestoredDraft] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Sync restoredDraftRef to state
  useEffect(() => {
    if (restoredDraftRef.current) {
      setRestoredDraft(restoredDraftRef.current);
      restoredDraftRef.current = null;
    }
  }, []);

  // Restore draft on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !restoreOnMount) return;

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: AutoSaveData = JSON.parse(saved);
        // Only restore if version matches and data is not empty
        if (
          parsed.__version === version &&
          Object.keys(parsed).some((k) => !k.startsWith('__'))
        ) {
          const draftData = { ...parsed };
          delete draftData.__version;
          delete draftData.__timestamp;
          // Use ref to avoid setState in effect
          restoredDraftRef.current = draftData;
        } else if (parsed.__version !== version) {
          // Version mismatch, discard old draft
          localStorage.removeItem(key);
        }
      } catch {
        // Invalid data, discard
        localStorage.removeItem(key);
      }
    }
  }, [key, restoreOnMount, version]);

  // Auto-save at interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(dataRef.current).length > 0) {
        const saveData: AutoSaveData = {
          ...dataRef.current,
          __version: version,
          __timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(saveData));
        setLastSaved(new Date());
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [key, intervalMs, version]);

  // Flush on beforeunload: the interval might miss the most recent keystrokes
  // (e.g. user types within the last 30s window then closes the tab), so we
  // synchronously persist dataRef.current when the page is about to close.
  // Synchronous because beforeunload does not wait for async work.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBeforeUnload = () => {
      if (Object.keys(dataRef.current).length > 0) {
        const saveData: AutoSaveData = {
          ...dataRef.current,
          __version: version,
          __timestamp: Date.now(),
        };
        try {
          localStorage.setItem(key, JSON.stringify(saveData));
        } catch {
          // Quota / private-mode failures are non-fatal at unload time.
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [key, version]);

  const load = useCallback((): Record<string, unknown> | null => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    try {
      const parsed: AutoSaveData = JSON.parse(saved);
      const draftData = { ...parsed };
      delete draftData.__version;
      delete draftData.__timestamp;
      return draftData;
    } catch {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }, [key]);

  const acceptDraft = useCallback(() => {
    setRestoredDraft(null);
  }, []);

  const discardDraft = useCallback(() => {
    clear();
    setRestoredDraft(null);
  }, [clear]);

  return { load, clear, lastSaved, restoredDraft, acceptDraft, discardDraft };
}
