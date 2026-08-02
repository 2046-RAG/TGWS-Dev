import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deduplicateResults, filterExternalResults, isExternalSourcesConfigured } from './external';
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
