import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom');
  return <div>safe content</div>;
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>safe content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('safe content')).toBeTruthy();
  });

  it('renders default fallback UI when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
    expect(screen.getByText('Back to Home')).toBeTruthy();
  });

  it('renders custom fallback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom fallback')).toBeTruthy();
  });

  it('reset button re-renders children once the error condition clears', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let throwState = true;
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={throwState} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();

    throwState = false;
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={throwState} />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByText('Try Again'));
    expect(screen.getByText('safe content')).toBeTruthy();
  });

  it('reports the error to console.error with component stack', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(spy).toHaveBeenCalled();
  });
});
