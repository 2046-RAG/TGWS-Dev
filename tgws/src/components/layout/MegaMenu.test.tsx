import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MegaMenu from './MegaMenu';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const items = [
  { key: 'products', label: 'Products', href: '/en/products', children: [
    { label: 'Build', href: '/en/products#build', desc: 'AI & cloud' },
    { label: 'Run', href: '/en/products#run', desc: 'Infrastructure' },
  ]},
  { key: 'about', label: 'About', href: '/en/about' },
];

describe('MegaMenu', () => {
  it('renders top-level links', () => {
    render(<MegaMenu items={items} />);
    expect(screen.getByText('Products').closest('a')!.getAttribute('href')).toBe('/en/products');
    expect(screen.getByText('About').closest('a')!.getAttribute('href')).toBe('/en/about');
  });

  it('highlights the active path', () => {
    render(<MegaMenu items={items} activePath="/en/products" />);
    const productLink = screen.getByText('Products').closest('a')!;
    expect(productLink.className).toContain('text-[#00D4FF]');
  });

  it('opens dropdown on mouse enter and closes on leave', () => {
    vi.useFakeTimers();
    render(<MegaMenu items={items} />);
    // the relative div holding the Link carries onMouseEnter
    const container = screen.getByText('Products').closest('a')!.parentElement!;
    fireEvent.mouseEnter(container);
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
    fireEvent.mouseLeave(container);
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('Build')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('closes dropdown on Escape', () => {
    vi.useFakeTimers();
    render(<MegaMenu items={items} />);
    const container = screen.getByText('Products').closest('a')!.parentElement!;
    fireEvent.mouseEnter(container);
    expect(screen.getByText('Build')).toBeInTheDocument();
    fireEvent.keyDown(container, { key: 'Escape' });
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('Build')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('does not open dropdown for items without children', () => {
    vi.useFakeTimers();
    render(<MegaMenu items={items} />);
    const about = screen.getByText('About').closest('a')!.parentElement!;
    fireEvent.mouseEnter(about);
    act(() => { vi.advanceTimersByTime(200); });
    // no dropdown content for About
    expect(document.querySelectorAll('[class*="rounded-2xl shadow-xl"]')).toHaveLength(0);
    vi.useRealTimers();
  });
});
