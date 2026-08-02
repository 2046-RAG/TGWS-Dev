import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRetry } from './useRetry';

describe('useRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolves on the first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useRetry(fn, { baseDelay: 10 }));

    let promise: Promise<string> | undefined;
    act(() => {
      promise = result.current.execute('a') as Promise<string>;
    });
    await act(async () => {
      await promise!;
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current.lastError).toBeNull();
    expect(result.current.attempt).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  it('retries with backoff until success', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockRejectedValueOnce(new Error('e2'))
      .mockResolvedValue('ok');
    const onRetry = vi.fn();
    const { result } = renderHook(() =>
      useRetry(fn, { maxRetries: 3, baseDelay: 100, onRetry }),
    );

    let promise: Promise<string> | undefined;
    act(() => {
      promise = result.current.execute() as Promise<string>;
    });

    // Attempt 1 fails → schedule retry
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    // Attempt 2 fails → schedule retry
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    // Attempt 3 succeeds
    await act(async () => {
      await promise!;
    });

    expect(fn).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(result.current.attempt).toBe(2);
    expect(result.current.isRetrying).toBe(false);
  });

  it('fails after maxRetries and notifies onMaxRetriesReached', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    const onMaxRetriesReached = vi.fn();
    const { result } = renderHook(() =>
      useRetry(fn, { maxRetries: 2, baseDelay: 10, onMaxRetriesReached }),
    );

    let promise: Promise<string> | undefined;
    act(() => {
      promise = result.current.execute() as Promise<string>;
    });
    // swallow the rejection now so the later expects don't race with unhandled-rejection
    const settled = promise!.catch(() => 'rejected');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    await act(async () => {
      await expect(promise!).rejects.toThrow('always fails');
    });
    await settled;

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    expect(onMaxRetriesReached).toHaveBeenCalledTimes(1);
    expect(result.current.lastError?.message).toBe('always fails');
    expect(result.current.isRetrying).toBe(false);
  });

  it('retry() re-executes with the last arguments', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockResolvedValue('recovered');
    const { result } = renderHook(() => useRetry(fn, { maxRetries: 0, baseDelay: 10 }));

    let p1: Promise<string> | undefined;
    act(() => {
      p1 = result.current.execute('arg1', 'arg2') as Promise<string>;
    });
    const settled1 = p1!.catch(() => 'rejected');
    await act(async () => {
      await expect(p1!).rejects.toThrow('first');
    });
    await settled1;

    // Manual retry reuses stored args
    let p2: Promise<string> | undefined;
    act(() => {
      p2 = result.current.retry() as Promise<string>;
    });
    await act(async () => {
      await p2!;
    });

    expect(fn).toHaveBeenLastCalledWith('arg1', 'arg2');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('reset clears error, attempt and pending flags', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => useRetry(fn, { maxRetries: 1, baseDelay: 10 }));

    let promise: Promise<string> | undefined;
    act(() => {
      promise = result.current.execute() as Promise<string>;
    });
    const settled = promise!.catch(() => 'rejected');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    await act(async () => {
      await expect(promise!).rejects.toThrow('x');
    });
    await settled;

    act(() => {
      result.current.reset();
    });
    expect(result.current.lastError).toBeNull();
    expect(result.current.attempt).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });
});
