import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOfflineCache } from './useOfflineCache';

describe('useOfflineCache', () => {
  const KEY = 'test-cache-key';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns cached data immediately with isStale=true, then fresh data', async () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 'old' }));
    const fetcher = vi.fn().mockResolvedValue({ v: 'new' });

    const { result } = renderHook(() => useOfflineCache<{ v: string }>(KEY, fetcher));

    // Synchronous init reads cache
    expect(result.current).toEqual({ data: { v: 'old' }, isStale: true, loading: true });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ v: 'new' });
    expect(result.current.isStale).toBe(false);
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ v: 'new' }));
  });

  it('starts with no data when cache is empty', () => {
    const fetcher = vi.fn().mockResolvedValue({ v: 'new' });
    const { result } = renderHook(() => useOfflineCache<{ v: string }>(KEY, fetcher));
    expect(result.current).toEqual({ data: null, isStale: false, loading: true });
  });

  it('discards corrupted cache entries and keeps stale data on fetch failure', async () => {
    localStorage.setItem(KEY, 'not-valid-json{{{');
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useOfflineCache<{ v: string }>(KEY, fetcher));

    // Corrupted entry removed and treated as no cache
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.isStale).toBe(false);
  });

  it('keeps stale cached data visible when fetch fails', async () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 'cached' }));
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useOfflineCache<{ v: string }>(KEY, fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ v: 'cached' });
    expect(result.current.isStale).toBe(true);
  });

  it('does not write to storage when the fetch fails', async () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 'cached' }));
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));

    renderHook(() => useOfflineCache<{ v: string }>(KEY, fetcher));

    await waitFor(() => expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ v: 'cached' })));
  });

  it('survives a storage write failure without crashing', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const fetcher = vi.fn().mockResolvedValue({ v: 'fresh' });

    const { result } = renderHook(() => useOfflineCache<{ v: string }>(KEY, fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ v: 'fresh' });
    expect(result.current.isStale).toBe(false);
    setItemSpy.mockRestore();
  });

  it('ignores stale async resolution after unmount', async () => {
    const fetcher = vi.fn().mockResolvedValue({ v: 'fresh' });

    const { result, unmount } = renderHook(() => useOfflineCache<{ v: string }>(KEY, fetcher));
    unmount();
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(result.current).toBeDefined();
  });
});
