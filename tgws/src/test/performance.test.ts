import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Performance baseline tests — verifies bundle size and asset budgets
// NOT load tests; these catch regressions in bundle growth

describe('Performance Baseline', () => {
  // ── i18n parsing performance ──────────────────────────────
  it('en.json parses within 10ms', () => {
    const start = performance.now();
    const data = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf-8'));
    const elapsed = performance.now() - start;
    expect(data).toBeDefined();
    expect(Object.keys(data).length).toBeGreaterThan(10);
    expect(elapsed).toBeLessThan(10);
  });

  it('zh.json parses within 10ms', () => {
    const start = performance.now();
    const data = JSON.parse(fs.readFileSync('src/messages/zh.json', 'utf-8'));
    const elapsed = performance.now() - start;
    expect(data).toBeDefined();
    expect(Object.keys(data).length).toBeGreaterThan(10);
    expect(elapsed).toBeLessThan(10);
  });

  // ── Static asset sizes ────────────────────────────────────
  it('globals.css is under 50KB', () => {
    const size = fs.statSync('src/app/globals.css').size;
    expect(size).toBeLessThan(50 * 1024);
  });

  it('en.json is under 100KB', () => {
    const size = fs.statSync('src/messages/en.json').size;
    expect(size).toBeLessThan(100 * 1024);
  });

  it('zh.json is under 100KB', () => {
    const size = fs.statSync('src/messages/zh.json').size;
    expect(size).toBeLessThan(100 * 1024);
  });

  // ── Component count sanity check ──────────────────────────
  it('has fewer than 50 component files', () => {
    function countFiles(dir: string, ext: string): number {
      let count = 0;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          count += countFiles(full, ext);
        } else if (entry.name.endsWith(ext)) {
          count++;
        }
      }
      return count;
    }

    const tsxCount = countFiles('src/components', '.tsx');
    expect(tsxCount).toBeLessThan(50);
  });

  // ── i18n key completeness ─────────────────────────────────
  it('en.json and zh.json have matching top-level keys', () => {
    const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf-8'));
    const zh = JSON.parse(fs.readFileSync('src/messages/zh.json', 'utf-8'));
    const enKeys = Object.keys(en).sort();
    const zhKeys = Object.keys(zh).sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it('solutions namespace has metricLabels for all 6 industries', () => {
    const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf-8'));
    const industries = ['healthcare', 'finance', 'retail', 'logistics', 'education', 'government'];
    for (const ind of industries) {
      expect(en.solutions.metricLabels[ind]).toBeDefined();
      expect(typeof en.solutions.metricLabels[ind]).toBe('string');
      expect(en.solutions.metricLabels[ind].length).toBeGreaterThan(0);
    }
  });

  // ── Schema completeness ───────────────────────────────────
  it('has all 6 Sanity schemas registered', () => {
    // Check that schema files exist (caseStudy removed 2026-07-12)
    const schemaDir = 'sanity/schemas';
    const required = ['product.ts', 'post.ts', 'solution.ts', 'faq.ts', 'partner.ts', 'teamMember.ts'];
    for (const file of required) {
      expect(fs.existsSync(path.join(schemaDir, file))).toBe(true);
    }
  });

  // ── Test coverage sanity ──────────────────────────────────
  it('has at least 10 test files', () => {
    function countFiles(dir: string, ext: string): number {
      let count = 0;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          count += countFiles(full, ext);
        } else if (entry.name.endsWith(ext)) {
          count++;
        }
      }
      return count;
    }

    const testCount = countFiles('src', '.test.ts') + countFiles('src', '.test.tsx');
    expect(testCount).toBeGreaterThanOrEqual(10);
  });
});
