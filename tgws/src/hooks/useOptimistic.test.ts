import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimistic } from './useOptimistic';

describe('useOptimistic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state and idle pending flag', () => {
    const { result } = renderHook(() =>
      useOptimistic({ count: 1 }, (current, opt: Partial<{ count: number }>) => ({
        ...current,
        ...opt,
      })),
    );
    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.isPending).toBe(false);
  });

  it('applies optimistic update immediately, then commits the async result', async () => {
    const { result } = renderHook(() =>
      useOptimistic({ count: 1 }, (current, opt: Partial<{ count: number }>) => ({
        ...current,
        ...opt,
      })),
    );

    let resolveFn!: (v: { count: number }) => void;
    const asyncFn = () =>
      new Promise<{ count: number }>((resolve) => {
        resolveFn = resolve;
      });

    let pendingPromise: Promise<void>;
    act(() => {
      pendingPromise = result.current.optimisticUpdate({ count: 99 }, asyncFn);
    });

    // Optimistic value visible immediately
    expect(result.current.state).toEqual({ count: 99 });
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      resolveFn({ count: 42 });
      await pendingPromise;
    });

    expect(result.current.state).toEqual({ count: 42 });
    expect(result.current.isPending).toBe(false);
  });

  it('rolls back to the last committed value on failure', async () => {
    const { result } = renderHook(() =>
      useOptimistic({ count: 1 }, (current, opt: Partial<{ count: number }>) => ({
        ...current,
        ...opt,
      })),
    );

    let pendingPromise: Promise<void>;
    act(() => {
      pendingPromise = result.current.optimisticUpdate({ count: 99 }, async () => {
        throw new Error('boom');
      });
    });

    expect(result.current.state).toEqual({ count: 99 });

    await act(async () => {
      await pendingPromise;
    });

    // Rolled back to the ORIGINAL committed value, not the optimistic one
    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.isPending).toBe(false);
  });

  it('rolls back to the previous committed value after a prior successful commit', async () => {
    const { result } = renderHook(() =>
      useOptimistic({ count: 1 }, (current, opt: Partial<{ count: number }>) => ({
        ...current,
        ...opt,
      })),
    );

    // First commit succeeds → committedRef becomes { count: 10 }
    let resolveFn!: (v: { count: number }) => void;
    let p1: Promise<void>;
    act(() => {
      p1 = result.current.optimisticUpdate({ count: 5 }, () =>
        new Promise<{ count: number }>((resolve) => {
          resolveFn = resolve;
        }),
      );
    });
    await act(async () => {
      resolveFn({ count: 10 });
      await p1;
    });
    expect(result.current.state).toEqual({ count: 10 });

    // Second update fails → must roll back to { count: 10 }, not { count: 5 }
    let p2: Promise<void>;
    act(() => {
      p2 = result.current.optimisticUpdate({ count: 20 }, async () => {
        throw new Error('boom2');
      });
    });
    await act(async () => {
      await p2;
    });
    expect(result.current.state).toEqual({ count: 10 });
  });

  it('setState commits a value without going through the optimistic path', () => {
    const { result } = renderHook(() =>
      useOptimistic({ count: 1 }, (current, opt: Partial<{ count: number }>) => ({
        ...current,
        ...opt,
      })),
    );
    act(() => {
      result.current.setState({ count: 7 });
    });
    expect(result.current.state).toEqual({ count: 7 });
    expect(result.current.isPending).toBe(false);
  });
});
