import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CookieConsent from '../CookieConsent';

// Mock next-intl — CookieConsent uses useLocale + useTranslations('common.cookieConsent')
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace: string) => {
    if (namespace !== 'common.cookieConsent') {
      return (key: string) => `${namespace}.${key}`;
    }
    const store: Record<string, string> = {
      ariaLabel: 'Cookie consent',
      message: 'We use essential cookies only. No tracking.',
      privacyPolicy: 'Privacy Policy',
      accept: 'Accept',
    };
    return (key: string) => store[key] ?? key;
  },
}));

describe('CookieConsent', () => {
  beforeEach(() => {
    // Each test gets a fresh localStorage state.
    window.localStorage.clear();
    // jsdom doesn't implement requestAnimationFrame by default in vitest's
    // jsdom env; polyfill it so the `useEffect` actually flips `showConsent`.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing initially and shows the banner after rAF fires', async () => {
    const { container } = render(<CookieConsent />);
    // After rAF, the dialog should appear.
    expect(
      await screen.findByRole('dialog', { name: 'Cookie consent' })
    ).toBeInTheDocument();
    // sanity check that the component renders *something*
    expect(container.firstChild).not.toBeNull();
  });

  it('does not render the banner if consent was already stored', () => {
    window.localStorage.setItem('cookie-consent', 'accepted');
    render(<CookieConsent />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the message, privacy link, and Accept button', async () => {
    render(<CookieConsent />);
    expect(
      await screen.findByText('We use essential cookies only. No tracking.')
    ).toBeInTheDocument();
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(privacyLink).toHaveAttribute('href', '/en/privacy');
    expect(
      screen.getByRole('button', { name: 'Accept' })
    ).toBeInTheDocument();
  });

  it('stores "accepted" in localStorage and hides the banner on Accept click', async () => {
    render(<CookieConsent />);
    const acceptBtn = await screen.findByRole('button', { name: 'Accept' });
    act(() => {
      fireEvent.click(acceptBtn);
    });
    expect(window.localStorage.getItem('cookie-consent')).toBe('accepted');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exposes the dialog with an accessible aria-label', async () => {
    render(<CookieConsent />);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Cookie consent');
  });

  it('meets the 44px minimum touch target on the Accept button (min-height)', async () => {
    render(<CookieConsent />);
    const acceptBtn = await screen.findByRole('button', { name: 'Accept' });
    // min-h-[44px] is applied via Tailwind class; assert it is present.
    expect(acceptBtn.className).toContain('min-h-[44px]');
  });
});
