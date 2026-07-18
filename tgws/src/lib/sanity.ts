import { createClient, type SanityClient } from 'next-sanity';

let _client: SanityClient | null = null;

/**
 * Lazy-initialized Sanity browser client. See sanity.server.ts for rationale.
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
