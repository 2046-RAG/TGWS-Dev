import { describe, it, expect } from 'vitest';
import { detectCapabilityGap } from './capability';
import type { SearchResult } from './types';

function result(title: string): SearchResult {
  return {
    id: title, type: 'product', title, description: '', url: '/x', source: 'internal', relevanceScore: 0.5,
  };
}

describe('detectCapabilityGap', () => {
  it('returns no gap when 3+ internal results exist', async () => {
    const r = await detectCapabilityGap('firewall', [result('a'), result('b'), result('c')]);
    expect(r.detected).toBe(false);
    expect(r.gapDescription).toBeNull();
  });

  it('detects a gap with zero internal results', async () => {
    const r = await detectCapabilityGap('quantum storage', []);
    expect(r.detected).toBe(true);
    expect(r.gapDescription).toContain('No existing resources');
  });

  it('detects a gap with limited internal results', async () => {
    const r = await detectCapabilityGap('kubernetes', [result('a')]);
    expect(r.detected).toBe(true);
    expect(r.gapDescription).toContain('Only 1 result(s)');
  });

  it('ignores generic navigation terms', async () => {
    for (const q of ['about', 'contact', 'help', 'FAQ', 'login', '首頁', '搜尋']) {
      const r = await detectCapabilityGap(q, []);
      expect(r.detected).toBe(false);
    }
  });
});
