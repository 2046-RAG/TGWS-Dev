import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/setup.ts',
        'src/types/**',
      ],
      // Pragmatic floor — locks in current coverage to prevent regression.
      //
      // Measured baseline (Wave 3 W3-1.5, 2026-07-19, excluding the
      // pre-existing RegisterForm failure):
      //   Statements: 37.89%
      //   Branches:    29.59%
      //   Functions:   32.50%
      //   Lines:       38.04%
      //
      // The PRD [S21] target is 60%, but large surface area remains
      // untested (HeroSection, MegaMenu, Navbar, Footer, CompareTable,
      // TicketDetailClient, server-component pages without dedicated
      // tests, lib/odoo, lib/resend, lib/retry). Setting the threshold
      // at current-minus-buffer ensures the build stays green while
      // coverage is grown incrementally in subsequent waves. Raising
      // these numbers is tracked as follow-up work; do NOT lower them.
      thresholds: {
        statements: 35,
        branches: 25,
        functions: 30,
        lines: 35,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
