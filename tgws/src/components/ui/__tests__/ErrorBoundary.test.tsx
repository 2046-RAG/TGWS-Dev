import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import ErrorBoundary from '../ErrorBoundary';

// ErrorBoundary's fallback uses useTranslations('common.error')
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    if (namespace !== 'common.error') {
      return (key: string) => `${namespace}.${key}`;
    }
    const store: Record<string, string> = {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try the actions below.',
      tryAgain: 'Try Again',
      backToHome: 'Back to Home',
    };
    return (key: string) => store[key] ?? key;
  },
}));

// Helper: a child component that throws on render. The `ReactNode` return
// type is required because the function never returns — without it, TS
// infers `void` which isn't a valid JSX component type.
function ThrowOnRender({ error }: { error: Error }): ReactNode {
  throw error;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silence console.error noise from React when the boundary catches.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary locale="en">
        <div>Hello World</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders the default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary locale="en">
        <ThrowOnRender error={new Error('boom')} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('An unexpected error occurred. Please try the actions below.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
  });

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowOnRender error={new Error('boom')} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('Back to Home link uses the locale prop to build the URL', () => {
    render(
      <ErrorBoundary locale="zh">
        <ThrowOnRender error={new Error('boom')} />
      </ErrorBoundary>
    );
    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toHaveAttribute('href', '/zh/home');
  });

  it('defaults to "en" locale when locale prop is not provided', () => {
    render(
      <ErrorBoundary>
        <ThrowOnRender error={new Error('boom')} />
      </ErrorBoundary>
    );
    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toHaveAttribute('href', '/en/home');
  });

  it('Try Again resets the error state and re-renders children', () => {
    let shouldThrow = true;

    function ConditionalThrow() {
      if (shouldThrow) throw new Error('first-render-fails');
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary locale="en">
        <ConditionalThrow />
      </ErrorBoundary>
    );

    // Boundary caught the error and shows fallback.
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Flip the flag so the next render succeeds.
    shouldThrow = false;

    // Click Try Again — boundary resets, children re-render, no error.
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.getByText('Recovered')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('logs the error and errorInfo via console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary locale="en">
        <ThrowOnRender error={new Error('logged-error')} />
      </ErrorBoundary>
    );
    // componentDidCatch calls console.error with the [ErrorBoundary] tag.
    const calls = errorSpy.mock.calls.flat().map((c) => String(c));
    expect(calls.some((c) => c.includes('[ErrorBoundary]'))).toBe(true);
    expect(calls.some((c) => c.includes('logged-error'))).toBe(true);
  });
});
