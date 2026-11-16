/**
 * Ticket attachment URL handling (P0-3 / G3).
 *
 * The storage bucket is private (008 migration), so a stored object is not
 * reachable through a permanent public URL. Two shapes can be in the DB:
 *
 *   - new rows  : the bare object path, e.g. "uid/1720000000000-file.pdf"
 *   - old rows  : a full public URL from the previous getPublicUrl() code
 *
 * `storagePathFrom()` normalises both, and `withSignedAttachments()` swaps
 * `file_url` for a short-lived signed URL at read time so the browser never
 * receives a permanent link. The DB column is intentionally unchanged to
 * avoid a data migration.
 */

export const ATTACHMENT_BUCKET = 'ticket-attachments';

/** Signed URLs live long enough to open a preview, short enough to not leak. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Minimal shape we need from the Supabase client (keeps this module testable). */
export type StorageCapable = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (
        path: string,
        expiresIn: number,
      ) => Promise<{ data: { signedUrl: string } | null; error: unknown }>;
    };
  };
};

function stripQuery(value: string): string {
  const q = value.indexOf('?');
  return q === -1 ? value : value.slice(0, q);
}

/**
 * Resolve a stored value to a storage object path, or null when it cannot be
 * resolved (external URL, malformed value).
 */
export function storagePathFrom(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null;
  const value = String(fileUrl).trim();
  if (!value) return null;

  if (!/^https?:\/\//i.test(value)) {
    const path = value.replace(/^\/+/, '');
    return path || null;
  }

  for (const marker of [
    `/storage/v1/object/public/${ATTACHMENT_BUCKET}/`,
    `/storage/v1/object/sign/${ATTACHMENT_BUCKET}/`,
  ]) {
    const idx = value.indexOf(marker);
    if (idx === -1) continue;
    const raw = stripQuery(value.slice(idx + marker.length));
    try {
      return decodeURIComponent(raw) || null;
    } catch {
      return raw || null;
    }
  }

  return null;
}

/**
 * Return a signed URL for a stored attachment value. Falls back to the
 * original value when signing is not possible (e.g. migration not applied
 * yet, storage policy missing) so callers never throw on a read path.
 */
export async function signedAttachmentUrl(
  supabase: StorageCapable,
  fileUrl: string | null | undefined,
): Promise<string> {
  const fallback = fileUrl ?? '';
  const path = storagePathFrom(fileUrl);
  if (!path) return fallback;

  // A hanging Storage call must never block the whole ticket detail response.
  // Give signing a bounded window, then fall back to the stored value.
  const signed = await Promise.race([
    supabase.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3_000)),
  ]).catch(() => null);

  if (!signed || signed.error || !signed.data?.signedUrl) return fallback;
  return signed.data.signedUrl;
}

/** Map a list of attachment rows into the same rows with a signed `file_url`. */
export async function withSignedAttachments<T extends { file_url: string | null }>(
  supabase: StorageCapable,
  rows: T[],
): Promise<T[]> {
  return Promise.all(
    rows.map(async (row) => ({ ...row, file_url: await signedAttachmentUrl(supabase, row.file_url) })),
  );
}
