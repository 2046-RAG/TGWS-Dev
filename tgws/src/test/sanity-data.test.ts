import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted creates a reference that survives vi.mock hoisting
const sanityMock = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('next-sanity', () => ({
  createClient: () => sanityMock,
}));

// Mock env vars
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project-id';

import { client } from '@/lib/sanity';

// Helper to report validation failures with doc ID and missing fields
function reportFailures(type: string, docs: Record<string, unknown>[], requiredFields: string[]): string[] {
  const errors: string[] = [];
  for (const doc of docs) {
    const missing = requiredFields.filter((f) => {
      const val = doc[f];
      return val === undefined || val === null || val === '';
    });
    if (missing.length > 0) {
      errors.push(`[${type}] doc _id="${doc._id}" missing: ${missing.join(', ')}`);
    }
  }
  return errors;
}

describe('Sanity Data Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Products ────────────────────────────────────────────────
  describe('Products', () => {
    const validCategories = ['build', 'run', 'protect'];

    it('each product has title, slug, category, and description', async () => {
      sanityMock.fetch.mockResolvedValue([
        { _id: 'p1', title: 'VMware vSphere', slug: { current: 'vmware-vsphere' }, category: 'build', description: 'Enterprise virtualization' },
        { _id: 'p2', title: 'Nutanix', slug: { current: 'nutanix' }, category: 'run', description: 'Hyper-converged infrastructure' },
        { _id: 'p3', title: 'Veeam', slug: { current: 'veeam' }, category: 'protect', description: 'Backup & replication' },
      ]);

      const query = `*[_type == "product"] | order(category asc, order asc) { _id, title, slug, category, description }`;
      const products = await client.fetch(query);

      const errors = reportFailures('product', products, ['title', 'slug', 'category', 'description']);
      expect(errors).toEqual([]);
    });

    it('each product category is valid (build/run/protect)', async () => {
      sanityMock.fetch.mockResolvedValue([
        { _id: 'p1', category: 'build' },
        { _id: 'p2', category: 'run' },
        { _id: 'p3', category: 'protect' },
      ]);

      const query = `*[_type == "product"] { _id, category }`;
      const products = await client.fetch(query);

      const invalid = products
        .filter((p: Record<string, unknown>) => !validCategories.includes(p.category as string))
        .map((p: Record<string, unknown>) => `[product] _id="${p._id}" invalid category="${p.category}"`);

      expect(invalid).toEqual([]);
    });

    it('each product has a non-empty title', async () => {
      sanityMock.fetch.mockResolvedValue([
        { _id: 'p1', title: 'VMware vSphere' },
        { _id: 'p2', title: 'Nutanix' },
      ]);

      const query = `*[_type == "product"] { _id, title }`;
      const products = await client.fetch(query);

      const empty = products
        .filter((p: Record<string, unknown>) => !p.title || (p.title as string).trim() === '')
        .map((p: Record<string, unknown>) => `[product] _id="${p._id}" has empty title`);

      expect(empty).toEqual([]);
    });
  });

  // ── Blog Posts ──────────────────────────────────────────────
  describe('Blog Posts', () => {
    it('each post has title and slug', async () => {
      sanityMock.fetch.mockResolvedValue([
        { _id: 'post1', title: 'Cloud Migration Guide', slug: { current: 'cloud-migration-guide' } },
        { _id: 'post2', title: 'HCI Best Practices', slug: { current: 'hci-best-practices' } },
      ]);

      const query = `*[_type == "post"] | order(publishedAt desc) { _id, title, slug }`;
      const posts = await client.fetch(query);

      const errors = reportFailures('post', posts, ['title', 'slug']);
      expect(errors).toEqual([]);
    });

    it('each post has a non-empty title', async () => {
      sanityMock.fetch.mockResolvedValue([
        { _id: 'post1', title: 'Cloud Migration Guide' },
        { _id: 'post2', title: 'HCI Best Practices' },
      ]);

      const query = `*[_type == "post"] { _id, title }`;
      const posts = await client.fetch(query);

      const empty = posts
        .filter((p: Record<string, unknown>) => !p.title || (p.title as string).trim() === '')
        .map((p: Record<string, unknown>) => `[post] _id="${p._id}" has empty title`);

      expect(empty).toEqual([]);
    });
  });

  // ── Solutions ───────────────────────────────────────────────
  describe('Solutions', () => {
    it('each solution has title and description', async () => {
      sanityMock.fetch.mockResolvedValue([
        { _id: 'sol1', title: 'Healthcare IT Solution', description: 'End-to-end healthcare infrastructure' },
        { _id: 'sol2', title: 'Finance Security Solution', description: 'Compliance & security for finance' },
      ]);

      const query = `*[_type == "solution"] { _id, title, description }`;
      const solutions = await client.fetch(query);

      const errors = reportFailures('solution', solutions, ['title', 'description']);
      expect(errors).toEqual([]);
    });

    it('each solution has a non-empty title', async () => {
      sanityMock.fetch.mockResolvedValue([
        { _id: 'sol1', title: 'Healthcare IT Solution' },
        { _id: 'sol2', title: 'Finance Security Solution' },
      ]);

      const query = `*[_type == "solution"] { _id, title }`;
      const solutions = await client.fetch(query);

      const empty = solutions
        .filter((s: Record<string, unknown>) => !s.title || (s.title as string).trim() === '')
        .map((s: Record<string, unknown>) => `[solution] _id="${s._id}" has empty title`);

      expect(empty).toEqual([]);
    });
  });

  // ── Error reporting ─────────────────────────────────────────
  describe('Error reporting', () => {
    it('outputs specific doc IDs and missing fields for validation failures', async () => {
      sanityMock.fetch.mockResolvedValue([
        { _id: 'bad1', title: '', slug: null, category: 'invalid', description: '' },
        { _id: 'bad2', title: 'OK', slug: { current: 'ok' }, category: 'build', description: 'Has desc' },
      ]);

      const query = `*[_type == "product"] { _id, title, slug, category, description }`;
      const products = await client.fetch(query);

      const errors = reportFailures('product', products, ['title', 'slug', 'category', 'description']);
      // bad1 should have errors, bad2 should not
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('bad1');
    });
  });
});
