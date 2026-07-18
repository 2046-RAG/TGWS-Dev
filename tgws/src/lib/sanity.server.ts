import { createClient, type SanityClient } from 'next-sanity';

let _client: SanityClient | null = null;

/**
 * Lazy-initialized Sanity server client.
 *
 * Why lazy: `next build` performs page data collection which loads route
 * modules (e.g. /api/products, /sitemap.xml) at build time. If the env var
 * NEXT_PUBLIC_SANITY_PROJECT_ID is missing (e.g. preview deployment without
 * env vars configured), eagerly calling createClient() throws
 * "Configuration must contain projectId" and fails the entire build.
 *
 * Lazy init defers client creation to the first actual request, so build
 * succeeds even when env vars are absent.
 */
export const client = new Proxy({} as SanityClient, {
  get(_target, prop) {
    if (!_client) {
      _client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
        dataset: 'production',
        apiVersion: '2024-01-01',
        useCdn: true,
      });
    }
    // @ts-expect-error — dynamic property access on proxied client
    return _client[prop];
  },
});
