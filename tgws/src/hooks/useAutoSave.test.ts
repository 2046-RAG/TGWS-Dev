import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoSave } from './useAutoSave';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
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
});

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns load and clear functions', () => {
    const { result } = renderHook(() => useAutoSave('test-key', { test: 'data' }));
    
    expect(result.current.load).toBeInstanceOf(Function);
    expect(result.current.clear).toBeInstanceOf(Function);
  });

  it('clear removes data from localStorage', () => {
    const { result } = renderHook(() => useAutoSave('test-key', { test: 'data' }));
    
    act(() => {
      result.current.clear();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('load returns null when no data exists', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAutoSave('test-key', { test: 'data' }));
    
    let data: Record<string, unknown> | null = null;
    act(() => {
      data = result.current.load();
    });
    
    expect(data).toBeNull();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('load returns parsed data when data exists', () => {
    const savedData = { test: 'saved' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));
    
    const { result } = renderHook(() => useAutoSave('test-key', { test: 'data' }));
    
    let data: Record<string, unknown> | null = null;
    act(() => {
      data = result.current.load();
    });
    
    expect(data).toEqual(savedData);
  });

  it('saves data to localStorage at specified interval', () => {
    const data = { test: 'data' };
    const intervalMs = 1000;
    
    renderHook(() => useAutoSave('test-key', data, intervalMs));
    
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(intervalMs);
    });
    
    // The hook adds __version and __timestamp fields, so check the structure
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', expect.stringMatching(/"test":"data"/));
  });

  it('clears interval on unmount', () => {
    const data = { test: 'data' };
    const intervalMs = 1000;

    const { unmount } = renderHook(() => useAutoSave('test-key', data, intervalMs));

    unmount();

    act(() => {
      vi.advanceTimersByTime(intervalMs * 3);
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('flushes data to localStorage on beforeunload', () => {
    const data = { subject: 'hello world' };
    // Long interval so the only setItem comes from the unload flush.
    renderHook(() => useAutoSave('test-key', data, 60000));

    // Interval hasn't fired yet — setItem should be empty so far.
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      expect.stringMatching(/"subject":"hello world"/)
    );
  });

  it('does not flush on beforeunload when data is empty', () => {
    renderHook(() => useAutoSave('test-key', {}, 60000));

    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('removes beforeunload listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useAutoSave('test-key', { test: 'data' }, 60000)
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
    removeSpy.mockRestore();
  });
});