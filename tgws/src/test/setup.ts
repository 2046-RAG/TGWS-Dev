import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { resetRateLimits } from '@/lib/api-guard';

// T-069: api-guard keeps a module-level Map. Without this reset, earlier
// API tests (all sharing clientIp 'unknown') exhaust the quota and later
// cases receive 429 instead of the response they are asserting.
beforeEach(() => resetRateLimits());
