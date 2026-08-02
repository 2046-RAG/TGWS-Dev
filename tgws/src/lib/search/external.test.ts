import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deduplicateResults, filterExternalResults, isExternalSourcesConfigured, searchGoogleCSE, searchTavily } from './external';
import type { ExternalResult, SearchResult } from './types';

function ext(url: string, source: 'google' | 'tavily' = 'google', title = 't'): ExternalResult {
  return { id: url, title, description: 'd', url, source, relevanceScore: 0.5 };
}

function internal(url: string): SearchResult {
  return {
    id: url, type: 'product', title: 'p', description: 'd', url, source: 'internal', relevanceScore: 0.5,
  };
}

describe('deduplicateResults', () => {
  it('removes external results whose URL matches an internal result', () => {
    const internalResults = [internal('https://techguru-it.asia/products/a')];
    const externalResults = [
      ext('https://techguru-it.asia/products/a'),
      ext('https://oracle.com/x'),
    ];
    const { internal: i, external: e } = deduplicateResults(internalResults, externalResults);
    expect(i).toHaveLength(1);
    expect(e).toHaveLength(1);
    expect(e[0].url).toBe('https://oracle.com/x');
  });

  it('keeps all external results when none duplicate', () => {
    const { external: e } = deduplicateResults(
      [internal('https://techguru-it.asia/a')],
      [ext('https://oracle.com/1'), ext('https://ibm.com/2')],
    );
    expect(e).toHaveLength(2);
  });
});

describe('filterExternalResults', () => {
  it('filters blocked domains', () => {
    const results = [
      ext('https://linkedin.com/company/x'),
      ext('https://techguru-it.asia/anything'),
      ext('https://oracle.com/ok'),
    ];
    const filtered = filterExternalResults(results);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].url).toBe('https://oracle.com/ok');
  });

  it('filters spam-pattern titles', () => {
    const results = [
      ext('https://a.com/1', 'google', 'Sponsored - Buy now!'),
      ext('https://a.com/2', 'google', 'Legit article title'),
    ];
    const filtered = filterExternalResults(results);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Legit article title');
  });

  it('filters www-prefixed blocked domains', () => {
    const results = [ext('https://www.medium.com/things')];
    expect(filterExternalResults(results)).toHaveLength(0);
  });
});

describe('isExternalSourcesConfigured', () => {
  beforeEach(() => {
    delete process.env.GOOGLE_CSE_API_KEY;
    delete process.env.TAVILY_API_KEY;
  });
  afterEach(() => {
    delete process.env.GOOGLE_CSE_API_KEY;
    delete process.env.TAVILY_API_KEY;
  });

  it('returns false when keys are missing', () => {
    expect(isExternalSourcesConfigured()).toBe(false);
  });

  it('returns true when both keys are present', () => {
    process.env.GOOGLE_CSE_API_KEY = 'k';
    process.env.TAVILY_API_KEY = 't';
    expect(isExternalSourcesConfigured()).toBe(true);
  });
});

describe('searchGoogleCSE', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    process.env.GOOGLE_CSE_API_KEY = 'key';
    process.env.GOOGLE_CSE_ID = 'cse1';
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    delete process.env.GOOGLE_CSE_API_KEY;
    delete process.env.GOOGLE_CSE_ID;
    vi.unstubAllGlobals();
  });

  it('returns empty when not configured', async () => {
    delete process.env.GOOGLE_CSE_API_KEY;
    expect(await searchGoogleCSE('q')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns empty on non-OK response', async () => {
    fetchMock.mockResolvedValue({ ok: false, statusText: '403' });
    expect(await searchGoogleCSE('q')).toEqual([]);
  });

  it('maps search items to external results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ link: 'https://oracle.com/x', title: 'Oracle X', snippet: 'desc' }] }),
    });
    const results = await searchGoogleCSE('vmware');
    expect(results).toHaveLength(1);
    expect(results[0].source).toBe('google');
    expect(results[0].url).toBe('https://oracle.com/x');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('googleapis.com/customsearch'));
  });

  it('returns empty and logs on fetch throw', async () => {
    fetchMock.mockRejectedValue(new Error('network'));
    expect(await searchGoogleCSE('q')).toEqual([]);
  });
});

describe('searchTavily', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    process.env.TAVILY_API_KEY = 'tvly-key';
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    delete process.env.TAVILY_API_KEY;
    vi.unstubAllGlobals();
  });

  it('returns empty when not configured', async () => {
    delete process.env.TAVILY_API_KEY;
    const r = await searchTavily('q');
    expect(r.results).toEqual([]);
    expect(r.answer).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns empty on non-OK response', async () => {
    fetchMock.mockResolvedValue({ ok: false, statusText: '429' });
    const r = await searchTavily('q');
    expect(r.results).toEqual([]);
    expect(r.answer).toBe('');
  });

  it('maps results and extracts the AI answer', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: 'HCI means hyper-converged infrastructure',
        results: [{ url: 'https://ibm.com/hci', title: 'IBM HCI', content: 'content', score: 0.9 }],
      }),
    });
    const r = await searchTavily('hci');
    expect(r.answer).toContain('hyper-converged');
    expect(r.results).toHaveLength(1);
    expect(r.results[0].source).toBe('tavily');
    // query is enriched with TechGuru context
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.query).toContain('TechGuru Network & Data Solutions');
  });

  it('sanitizes quotes in the injected query', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ answer: '', results: [] }) });
    await searchTavily('drop" table');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    // the embedded query has quotes stripped (only wrapper quotes remain)
    const embedded = body.query.match(/explain what "(.*)" means/)[1];
    expect(embedded).not.toContain('"');
    expect(embedded).toBe('drop  table');
  });
});
