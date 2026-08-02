import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Lower concurrency: with ~65 test files + v8 coverage, the default
    // worker count exhausts memory on this machine (FATAL: out of memory),
    // which silently drops coverage for files in crashed workers.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true, minForks: 1, maxForks: 1 },
    },
    coverage: {
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
