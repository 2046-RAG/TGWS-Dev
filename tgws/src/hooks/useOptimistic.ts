'use client';

import { useState, useCallback } from 'react';

export function useOptimistic<T>(
  initial: T,
  updateFn: (current: T, optimistic: Partial<T>) => T
) {
  const [state, setState] = useState(initial);
  const [isPending, setIsPending] = useState(false);

  const optimisticUpdate = useCallback(
    async (optimistic: Partial<T>, asyncFn: () => Promise<T>) => {
      setState((prev) => updateFn(prev, optimistic));
      setIsPending(true);

      try {
        const result = await asyncFn();
        setState(result);
      } catch {
        setState((prev) => prev);
      } finally {
        setIsPending(false);
      }
    },
    [updateFn]
  );

  return { state, isPending, optimisticUpdate, setState };
}