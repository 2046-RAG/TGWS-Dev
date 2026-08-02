import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CookieConsent from './CookieConsent';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
    // stub requestAnimationFrame to fire synchronously
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => { cb(); return 1; });
  });

  it('renders nothing when consent already given', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    const { container } = render(<CookieConsent />);
    expect(container.innerHTML).toBe('');
  });

  it('shows the dialog when no consent stored', async () => {
    render(<CookieConsent />);
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Cookie consent' })).toBeInTheDocument();
    });
  });

  it('stores consent and hides on accept', async () => {
    render(<CookieConsent />);
    await waitFor(() => {
      expect(screen.getByText('Accept')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Accept'));
    expect(localStorage.getItem('cookie-consent')).toBe('accepted');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('links to the localized privacy policy', async () => {
    render(<CookieConsent />);
    await waitFor(() => {
      const link = screen.getByText('Privacy Policy');
      expect(link.getAttribute('href')).toBe('/en/privacy');
    });
  });
});
