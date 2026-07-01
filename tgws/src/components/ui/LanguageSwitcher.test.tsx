import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageSwitcher from './LanguageSwitcher';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/en/products',
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders language toggle button', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /language selector/i });
    expect(button).toBeInTheDocument();
  });

  it('displays current locale indicator', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /language selector/i });
    expect(button).toHaveTextContent('繁中');
  });

  it('calls router.push on click', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /language selector/i });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalled();
  });
});
