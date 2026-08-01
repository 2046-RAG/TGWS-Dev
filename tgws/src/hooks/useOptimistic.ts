'use client';

import { useState, useCallback, useRef } from 'react';

export function useOptimistic<T>(
  initial: T,
  updateFn: (current: T, optimistic: Partial<T>) => T
) {
  const [state, setState] = useState(initial);
  const [isPending, setIsPending] = useState(false);
  // Snapshot of the last committed (non-optimistic) state so rollback on
  // failure restores the true previous value (AUDIT-199: setState(prev => prev)
  // was a no-op that kept the optimistic value).
  const committedRef = useRef<T>(initial);

  const optimisticUpdate = useCallback(
    async (optimistic: Partial<T>, asyncFn: () => Promise<T>) => {
      const snapshot = committedRef.current;
      setState((prev) => updateFn(prev, optimistic));
      setIsPending(true);

      try {
        const result = await asyncFn();
        committedRef.current = result;
        setState(result);
      } catch {
        setState(snapshot);
      } finally {
        setIsPending(false);
      }
    },
    [updateFn]
  );

  const setStateCommitted = useCallback((next: T) => {
    committedRef.current = next;
    setState(next);
  }, []);

  return { state, isPending, optimisticUpdate, setState: setStateCommitted };
}
