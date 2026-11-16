import { describe, it, expect, vi } from 'vitest';
import {
  ATTACHMENT_BUCKET,
  SIGNED_URL_TTL_SECONDS,
  signedAttachmentUrl,
  storagePathFrom,
  withSignedAttachments,
} from './attachments';

type CreateSignedUrl = (
  path: string,
  expiresIn: number,
) => Promise<{ data: { signedUrl: string } | null; error: unknown }>;

function fakeClient(createSignedUrl: CreateSignedUrl) {
  return {
    storage: {
      from: vi.fn(() => ({ createSignedUrl })),
    },
  };
}

describe('storagePathFrom', () => {
  it('returns a bare object path unchanged', () => {
    expect(storagePathFrom('uid-1/1720000000000-invoice.pdf')).toBe(
      'uid-1/1720000000000-invoice.pdf',
    );
  });

  it('strips leading slashes', () => {
    expect(storagePathFrom('/uid-1/file.png')).toBe('uid-1/file.png');
  });

  it('extracts the path from a legacy public URL', () => {
    const url = `https://project.supabase.co/storage/v1/object/public/${ATTACHMENT_BUCKET}/uid-1/1720-shot%20one.png`;
    expect(storagePathFrom(url)).toBe('uid-1/1720-shot one.png');
  });

  it('extracts the path from a signed URL and drops the token query', () => {
    const url = `https://project.supabase.co/storage/v1/object/sign/${ATTACHMENT_BUCKET}/uid-1/a.pdf?token=abc.def`;
    expect(storagePathFrom(url)).toBe('uid-1/a.pdf');
  });

  it('returns null for an unrelated external URL', () => {
    expect(storagePathFrom('https://example.com/whatever.pdf')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(storagePathFrom('')).toBeNull();
    expect(storagePathFrom(null)).toBeNull();
    expect(storagePathFrom(undefined)).toBeNull();
  });
});

describe('signedAttachmentUrl', () => {
  it('returns a signed URL for a stored path', async () => {
    const createSignedUrl = vi.fn(async (path: string, ttl: number) => ({
      data: { signedUrl: `https://signed/${path}?ttl=${ttl}` },
      error: null,
    }));
    const url = await signedAttachmentUrl(fakeClient(createSignedUrl), 'uid-1/a.pdf');
    expect(url).toBe('https://signed/uid-1/a.pdf?ttl=' + SIGNED_URL_TTL_SECONDS);
    expect(createSignedUrl).toHaveBeenCalledWith('uid-1/a.pdf', SIGNED_URL_TTL_SECONDS);
  });

  it('falls back to the stored value when signing fails', async () => {
    const createSignedUrl = vi.fn(async () => ({ data: null, error: { message: 'denied' } }));
    await expect(
      signedAttachmentUrl(fakeClient(createSignedUrl), 'uid-1/a.pdf'),
    ).resolves.toBe('uid-1/a.pdf');
  });

  it('does not call storage for an unrelated external URL', async () => {
    const createSignedUrl = vi.fn();
    await expect(
      signedAttachmentUrl(fakeClient(createSignedUrl as unknown as CreateSignedUrl), 'https://example.com/x.pdf'),
    ).resolves.toBe('https://example.com/x.pdf');
    expect(createSignedUrl).not.toHaveBeenCalled();
  });
});

describe('withSignedAttachments', () => {
  it('maps every row and preserves unrelated fields', async () => {
    const createSignedUrl = vi.fn(async (path: string) => ({
      data: { signedUrl: `https://signed/${path}` },
      error: null,
    }));

    const rows = await withSignedAttachments(fakeClient(createSignedUrl), [
      { id: 'a1', file_name: 'one.pdf', file_url: 'uid/a1.pdf' },
      { id: 'a2', file_name: 'two.png', file_url: 'uid/a2.png' },
    ]);

    expect(rows).toEqual([
      { id: 'a1', file_name: 'one.pdf', file_url: 'https://signed/uid/a1.pdf' },
      { id: 'a2', file_name: 'two.png', file_url: 'https://signed/uid/a2.png' },
    ]);
  });

  it('returns an empty list unchanged', async () => {
    const createSignedUrl = vi.fn();
    await expect(
      withSignedAttachments(fakeClient(createSignedUrl as unknown as CreateSignedUrl), []),
    ).resolves.toEqual([]);
  });
});
