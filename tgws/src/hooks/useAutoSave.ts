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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [restoredDraft, setRestoredDraft] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Restore draft on mount. SetState in a mount-only effect is safe here —
  // it runs once on the client after hydration (AUDIT-198: the previous
  // ref+sync-effect split never transferred the draft to state).
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
          // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount-time draft restore from localStorage
          setRestoredDraft(draftData);
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
