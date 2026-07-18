import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Breadcrumb from '../Breadcrumb';

// Use vi.hoisted so the mock factories (which are hoisted above imports) can
// reference mutable state that tests mutate via beforeEach / per-test assignments.
const mock = vi.hoisted(() => ({
  params: { locale: 'en' } as { locale: string },
  homeLabel: 'Home',
}));

vi.mock('next/navigation', () => ({
  useParams: () => mock.params,
}));

vi.mock('next-intl', () => ({
  // Mirror the real `useTranslations(namespace)` signature: returns a
  // translator function `t(key)`. For this component only `home` is read.
  useTranslations: () => (key: string) =>
    key === 'home' ? mock.homeLabel : key,
}));

describe('Breadcrumb', () => {
  beforeEach(() => {
    mock.params = { locale: 'en' };
    mock.homeLabel = 'Home';
  });

  it('auto-detects locale from route params and renders English home label', () => {
    mock.params = { locale: 'en' };
    mock.homeLabel = 'Home';
    render(<Breadcrumb items={[]} />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/en');
  });

  it('auto-detects zh locale and renders localized home label (首頁)', () => {
    mock.params = { locale: 'zh' };
    mock.homeLabel = '首頁';
    render(<Breadcrumb items={[]} />);
    const homeLink = screen.getByRole('link', { name: '首頁' });
    expect(homeLink).toHaveAttribute('href', '/zh');
  });

  it('falls back to "en" when route params have no locale', () => {
    mock.params = {} as { locale: string };
    mock.homeLabel = 'Home';
    render(<Breadcrumb items={[]} />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/en');
  });

  it('explicit locale prop overrides route params for the home link URL', () => {
    mock.params = { locale: 'zh' };
    mock.homeLabel = '首頁';
    render(<Breadcrumb items={[]} locale="en" />);
    // URL prefix uses the prop value, home label still comes from i18n context.
    expect(screen.getByRole('link', { name: '首頁' })).toHaveAttribute(
      'href',
      '/en'
    );
  });

  it('renders breadcrumb items with href as links', () => {
    render(
      <Breadcrumb items={[{ label: 'Products', href: '/products' }]} />
    );
    const productsLink = screen.getByRole('link', { name: 'Products' });
    expect(productsLink).toHaveAttribute('href', '/products');
  });

  it('renders breadcrumb items without href as emphasized non-link text', () => {
    render(<Breadcrumb items={[{ label: 'Current Page' }]} />);
    const labelNode = screen.getByText('Current Page');
    expect(labelNode.tagName).toBe('SPAN');
    expect(labelNode).toHaveClass('font-medium');
  });

  it('renders multiple items in order, separated by chevrons', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Products', href: '/products' },
          { label: 'Build', href: '/products/build' },
          { label: 'Current' },
        ]}
      />
    );
    const list = screen.getByRole('list');
    const listItems = list.querySelectorAll('li');
    // 1 home item + 3 breadcrumb items
    expect(listItems).toHaveLength(4);
    expect(listItems[1]).toHaveTextContent('Products');
    expect(listItems[2]).toHaveTextContent('Build');
    expect(listItems[3]).toHaveTextContent('Current');
  });

  it('exposes an accessible breadcrumb navigation landmark', () => {
    render(<Breadcrumb items={[]} />);
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });
});
