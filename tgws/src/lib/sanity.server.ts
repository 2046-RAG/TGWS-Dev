/**
 * Server-side Sanity client (T-086).
 *
 * This module used to contain a byte-for-byte copy of lib/sanity.ts. Both
 * paths are imported across the app (server routes / client components), so
 * removing either file would break those imports and their test mocks. Keep
 * both paths, but make this one a re-export so there is exactly one client
 * configuration to maintain.
 */
export { client } from './sanity';
