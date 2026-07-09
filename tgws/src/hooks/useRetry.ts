'use client';

import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface UseRetryResult<T> {
  execute: (...args: unknown[]) => Promise<T>;
  retry: () => Promise<T>;
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
  reset: () => void;
}

export function useRetry<T>(
  fn: (...args: unknown[]) => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryResult<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [lastArgs, setLastArgs] = useState<unknown[]>([]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const calculateDelay = (retryAttempt: number): number => {
    const exponentialDelay = baseDelay * Math.pow(2, retryAttempt);
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, maxDelay);
  };

  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      setLastArgs(args);
      setIsRetrying(true);
      setAttempt(0);
      setLastError(null);

      let currentAttempt = 0;

      const attemptExecution = async (): Promise<T> => {
        try {
          const result = await fn(...args);
          return result;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setLastError(error);

          if (currentAttempt < maxRetries) {
            const retryDelay = calculateDelay(currentAttempt);
            onRetry?.(currentAttempt + 1, error);

            await delay(retryDelay);
            currentAttempt++;
            setAttempt(currentAttempt);
            return attemptExecution();
          }

          onMaxRetriesReached?.(error);
          throw error;
        }
      };

      try {
        return await attemptExecution();
      } finally {
        setIsRetrying(false);
      }
    },
    [fn, maxRetries, baseDelay, maxDelay, onRetry, onMaxRetriesReached]
  );

  const retry = useCallback(async (): Promise<T> => {
    setIsRetrying(true);
    setLastError(null);

    let currentAttempt = 0;

    const attemptExecution = async (): Promise<T> => {
      try {
        const result = await fn(...lastArgs);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLastError(error);

        if (currentAttempt < maxRetries) {
          const retryDelay = calculateDelay(currentAttempt);
          onRetry?.(currentAttempt + 1, error);

          await delay(retryDelay);
          currentAttempt++;
          setAttempt(currentAttempt);
          return attemptExecution();
        }

        onMaxRetriesReached?.(error);
        throw error;
      }
    };

    try {
      return await attemptExecution();
    } finally {
      setIsRetrying(false);
    }
  }, [fn, lastArgs, maxRetries, baseDelay, maxDelay, onRetry, onMaxRetriesReached]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttempt(0);
    setLastError(null);
    setLastArgs([]);
  }, []);

  return {
    execute,
    retry,
    isRetrying,
    attempt,
    lastError,
    reset,
  };
}
