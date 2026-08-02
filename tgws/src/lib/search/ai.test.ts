import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateAiSummary } from './ai';
import type { ExternalResult, SearchResult } from './types';

function internal(title: string): SearchResult {
  return {
    id: title, type: 'product', title, description: 'desc', url: '/products/' + title,
    source: 'internal', relevanceScore: 0.5,
  };
}

function external(url: string, source: 'google' | 'tavily' = 'google'): ExternalResult {
  return { id: url, title: 'External ' + url, description: 'ext desc', url, source, relevanceScore: 0.5 };
}

describe('generateAiSummary', () => {
  beforeEach(() => {
    delete process.env.GOOGLE_GEMINI_API_KEY;
  });
  afterEach(() => {
    delete process.env.GOOGLE_GEMINI_API_KEY;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses the fallback summary when no Gemini key is configured', async () => {
    const result = await generateAiSummary('firewall', '', [internal('Firewall Guide')], []);
    expect(result).toContain('[RESOURCES]');
    expect(result).toContain('TechGuru has 1 resource(s)');
    expect(result).toContain('Firewall Guide');
  });

  it('fallback includes external sources when present', async () => {
    const result = await generateAiSummary(
      'hci',
      '',
      [internal('HCI')],
      [external('https://oracle.com/hci'), external('https://ibm.com/hci')],
    );
    expect(result).toContain('[SOURCES]');
    expect(result).toContain('oracle.com');
    expect(result).toContain('ibm.com');
  });

  it('fallback writes no dedicated-resources message when nothing matches', async () => {
    const result = await generateAiSummary('quantum computing', '', [], []);
    expect(result).toContain("doesn't currently have dedicated resources");
  });

  it('calls Gemini and post-processes its output', async () => {
    process.env.GOOGLE_GEMINI_API_KEY = 'test-key';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '[RESOURCES]\nOne resource\n\n[INSIGHT]\nInsight text\n\n[SOURCES]\n- Example (oracle.com)' }] } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await generateAiSummary('firewall', 'tavily answer', [internal('FW')], []);
    expect(result).toContain('[RESOURCES]');
    expect(result).toContain('Insight text');
    expect(result).toContain('[SOURCES]');
    // POST to Gemini endpoint
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('falls back when Gemini returns a non-OK response', async () => {
    process.env.GOOGLE_GEMINI_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: '429' }));
    const result = await generateAiSummary('firewall', '', [internal('FW')], []);
    expect(result).toContain('[RESOURCES]');
  });

  it('filters disallowed source domains from Gemini output', async () => {
    process.env.GOOGLE_GEMINI_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '[RESOURCES]\nR\n\n[INSIGHT]\nI\n\n[SOURCES]\n- Bad (evil.com)\n- Good (wikipedia.org)' }] } }],
      }),
    }));
    const result = await generateAiSummary('firewall', '', [internal('FW')], []);
    expect(result).not.toContain('evil.com');
    expect(result).toContain('wikipedia.org');
  });
});
