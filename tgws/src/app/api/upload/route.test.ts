import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const { mockFrom, mockGetUser, mockStorageUpload, mockStorageRemove, mockSignedUrl, mockLogError } =
  vi.hoisted(() => ({
    mockFrom: vi.fn(),
    mockGetUser: vi.fn(),
    mockStorageUpload: vi.fn(),
    mockStorageRemove: vi.fn(),
    mockSignedUrl: vi.fn(),
    mockLogError: vi.fn(),
  }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    storage: {
      from: () => ({
        upload: mockStorageUpload,
        remove: mockStorageRemove,
        createSignedUrl: mockSignedUrl,
      }),
    },
  }),
}));

vi.mock('@/lib/errors', () => ({ logServiceError: mockLogError }));

// Let the real guard run; use a same-origin request so it never blocks.
function req(name: string, mime: string, size = 128): Request {
  const form = new FormData();
  form.append('file', new File([new Uint8Array(size)], name, { type: mime }));
  form.append('ticketId', '11111111-1111-4111-8111-111111111111');
  // No Origin header: requireSameOrigin explicitly allows non-browser posts.
  return new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    body: form,
  });
}

function chain(overrides: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = {
    select: () => chain(),
    eq: () => chain(),
    is: () => chain(),
    single: async () => ({ data: { user_id: 'u1' }, error: null }),
    insert: async () => ({ error: null }),
    ...overrides,
  };
  return base;
}

describe('upload file-format policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@x.com' } } });
    mockFrom.mockImplementation(() => chain());
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageRemove.mockResolvedValue({ error: null });
    mockSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed' }, error: null });
  });

  const allowed = [
    ['report.md', 'text/markdown'],
    ['notes.md', ''], // empty MIME, extension decides
    ['sheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['clip.mp3', 'audio/mpeg'],
    ['bundle.zip', 'application/zip'],
    ['readme.txt', 'text/plain'],
    ['slide.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ] as const;

  it.each(allowed)('accepts %s', async (name, mime) => {
    const res = await POST(req(name, mime));
    expect(res.status).toBe(200);
  });

  const blocked = [
    ['payload.svg', 'image/svg+xml'],
    ['page.html', 'text/html'],
    ['evil.txt', 'text/html'], // harmless extension, script MIME
    ['script.js', 'application/javascript'],
    // .exe/.bat are in BLOCKED_EXT; jsdom renames those File names to 'blob',
    // so they cannot be exercised here without a real browser.
  ] as const;

  it.each(blocked)('rejects %s', async (name, mime) => {
    const res = await POST(req(name, mime));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('File type not allowed');
  });

  it('returns a specific Storage upload failure message', async () => {
    mockStorageUpload.mockResolvedValue({ error: { message: 'denied' } });
    const res = await POST(req('a.md', 'text/markdown'));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('Storage upload failed');
  });

  it('returns a specific metadata insert failure message', async () => {
    mockFrom.mockImplementation(() =>
      chain({ insert: async () => ({ error: { message: 'rls denied' } }) }),
    );
    const res = await POST(req('b.md', 'text/markdown'));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('Metadata insert failed');
    expect(mockStorageRemove).toHaveBeenCalled(); // orphan object rolled back
  });
});
