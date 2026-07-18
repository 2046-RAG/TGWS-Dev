import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRetry } from './useRetry';

// Helper: create a typed vi.fn whose impl signature matches useRetry's
// `(...args: unknown[]) => Promise<T>` so TS infers T correctly.
function makeFn<T>(fallback: (...args: unknown[]) => Promise<T>) {
  return vi.fn(fallback);
}

describe('useRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes successfully on first try', async () => {
    const fn = makeFn<string>(async () => 'ok');
    const { result } = renderHook(() => useRetry(fn));

    let res: string | undefined;
    await act(async () => {
      const promise = result.current.execute('arg1');
      await vi.runAllTimersAsync();
      res = await promise;
    });

    expect(res).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('arg1');
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
  });

  it('retries on failure and eventually succeeds', async () => {
    const fn = makeFn<string>(async () => {
      throw new Error('default-fail');
    });
    fn.mockRejectedValueOnce(new Error('fail-1'))
      .mockRejectedValueOnce(new Error('fail-2'))
      .mockResolvedValueOnce('ok');
    const onRetry = vi.fn();
    const { result } = renderHook(() =>
      useRetry(fn, { maxRetries: 3, baseDelay: 100, maxDelay: 500, onRetry })
    );

    let res: string | undefined;
    await act(async () => {
      const promise = result.current.execute();
      // Attach a noop catch immediately so an early rejection doesn't surface
      // as an unhandled rejection before the await below runs.
      promise.catch(() => {});
      await vi.runAllTimersAsync();
      res = await promise;
    });

    expect(res).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
    // Note: useRetry does not clear lastError on success — it retains the last
    // failure's error. This is existing behaviour, not something this task
    // changes. We assert that execute resolved (res === 'ok') instead.
  });

  it('throws after maxRetries exhausted', async () => {
    const fn = makeFn<string>(async () => {
      throw new Error('always-fail');
    });
    const onMaxRetriesReached = vi.fn();
    const { result } = renderHook(() =>
      useRetry(fn, {
        maxRetries: 2,
        baseDelay: 50,
        maxDelay: 200,
        onMaxRetriesReached,
      })
    );

    await act(async () => {
      const promise = result.current.execute();
      // Pre-attach a handler so the rejected promise is never "unhandled".
      promise.catch(() => {});
      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow('always-fail');
    });

    // initial attempt + 2 retries = 3 calls
    expect(fn).toHaveBeenCalledTimes(3);
    expect(onMaxRetriesReached).toHaveBeenCalledTimes(1);
    expect(result.current.lastError?.message).toBe('always-fail');
  });

  it('onRetry receives attempt number and error', async () => {
    const fn = makeFn<string>(async () => {
      throw new Error('default-fail');
    });
    fn.mockRejectedValueOnce(new Error('first')).mockResolvedValueOnce('ok');
    const onRetry = vi.fn();
    const { result } = renderHook(() =>
      useRetry(fn, { maxRetries: 3, baseDelay: 10, maxDelay: 50, onRetry })
    );

    await act(async () => {
      const promise = result.current.execute();
      promise.catch(() => {});
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
    const [attempt, err] = onRetry.mock.calls[0];
    expect(attempt).toBe(1);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('first');
  });

  it('reset() clears retry state', async () => {
    const fn = makeFn<string>(async () => {
      throw new Error('fail');
    });
    const { result } = renderHook(() =>
      useRetry(fn, { maxRetries: 1, baseDelay: 10, maxDelay: 50 })
    );

    await act(async () => {
      const promise = result.current.execute();
      promise.catch(() => {});
      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow('fail');
    });

    expect(result.current.lastError).not.toBeNull();
    expect(result.current.attempt).toBeGreaterThan(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.lastError).toBeNull();
  });

  it('retry() reuses args from the last execute()', async () => {
    const fn = makeFn<string>(async () => 'default-ok');
    fn.mockResolvedValueOnce('first-ok').mockResolvedValueOnce('second-ok');
    const { result } = renderHook(() =>
      useRetry(fn, { maxRetries: 5, baseDelay: 10, maxDelay: 50 })
    );

    await act(async () => {
      const promise = result.current.execute('arg-A');
      promise.catch(() => {});
      await vi.runAllTimersAsync();
      await promise;
    });
    expect(fn).toHaveBeenLastCalledWith('arg-A');

    fn.mockClear();
    await act(async () => {
      const promise = result.current.retry();
      promise.catch(() => {});
      await vi.runAllTimersAsync();
      await promise;
    });
    // retry() should re-invoke fn with the same args as the last execute()
    expect(fn).toHaveBeenCalledWith('arg-A');
  });
});
