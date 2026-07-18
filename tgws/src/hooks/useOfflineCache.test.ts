import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOfflineCache } from './useOfflineCache';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index]),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

// Flushes the microtask queue enough times to let fetcher().then(setState)
// chain resolve, then lets React's act() flush the resulting state update.
async function flushEffects() {
  await act(async () => {
    // Microtasks: fetcher Promise resolves, .then() schedules setState
    await Promise.resolve();
    await Promise.resolve();
    // Tick past any scheduler yields
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('useOfflineCache', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.clear();
  });

  it('initial state: loading=true, data=null, isStale=false when no cache', () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: '1' }]);
    const { result } = renderHook(() =>
      useOfflineCache('test-key', fetcher)
    );

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isStale).toBe(false);
  });

  it('fetches fresh data and clears stale flag', async () => {
    const fresh = [{ id: 'fresh-1' }];
    const fetcher = vi.fn().mockResolvedValue(fresh);
    const { result } = renderHook(() =>
      useOfflineCache('test-key', fetcher)
    );

    await flushEffects();

    expect(result.current.data).toEqual(fresh);
    expect(result.current.isStale).toBe(false);
    expect(result.current.loading).toBe(false);
    // Fresh data should be persisted to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(fresh)
    );
  });

  it('restores cached data on mount and marks stale', async () => {
    const cached = [{ id: 'cached-1' }];
    // mockReturnValueOnce: only the initial useState call reads getItem,
    // and we don't want to override the default impl for subsequent tests.
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cached));

    const fetcher = vi.fn().mockResolvedValue([{ id: 'fresh-1' }]);
    const { result } = renderHook(() =>
      useOfflineCache('test-key', fetcher)
    );

    // Initial state should reflect the cache
    expect(result.current.data).toEqual(cached);
    expect(result.current.isStale).toBe(true);
    expect(result.current.loading).toBe(true);

    // After fetcher resolves, fresh replaces cache
    await flushEffects();

    expect(result.current.data).toEqual([{ id: 'fresh-1' }]);
    expect(result.current.isStale).toBe(false);
  });

  it('falls back to cached data and stays stale when fetcher fails', async () => {
    const cached = [{ id: 'cached-1' }];
    // mockReturnValueOnce: only the initial useState call reads getItem,
    // and we don't want to override the default impl for subsequent tests.
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cached));

    const fetcher = vi.fn().mockRejectedValue(new Error('network-down'));
    const { result } = renderHook(() =>
      useOfflineCache('test-key', fetcher)
    );

    await flushEffects();

    // Cached data preserved, stale flag stays on (the offline scenario)
    expect(result.current.data).toEqual(cached);
    expect(result.current.isStale).toBe(true);
    expect(result.current.loading).toBe(false);
    // Cache must NOT be overwritten by the failure
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('returns null data and isStale=false when fetcher fails with no cache', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network-down'));
    const { result } = renderHook(() =>
      useOfflineCache('test-key', fetcher)
    );

    await flushEffects();

    expect(result.current.data).toBeNull();
    expect(result.current.isStale).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});
