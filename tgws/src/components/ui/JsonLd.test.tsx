import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import JsonLd, {
  OrganizationJsonLd,
  FAQJsonLd,
  ArticleJsonLd,
  BreadcrumbJsonLd,
  ProductJsonLd,
  WebSiteJsonLd,
} from './JsonLd';

function scriptContent(container: HTMLElement): string {
  const script = container.querySelector('script[type="application/ld+json"]');
  expect(script).toBeTruthy();
  return script!.textContent || '';
}

describe('JsonLd', () => {
  it('escapes < and > in user-supplied data to prevent script injection', () => {
    const malicious = { name: '</script><script>alert(1)</script>' };
    const { container } = render(<JsonLd data={malicious} />);
    const html = container.querySelector('script')!.innerHTML;
    expect(html).toContain('\\u003c/script\\u003e');
    expect(html).not.toContain('</script>');
  });

  it('renders plain JSON data unmodified', () => {
    const { container } = render(<JsonLd data={{ a: 1, b: 'x' }} />);
    expect(scriptContent(container)).toBe('{"a":1,"b":"x"}');
  });
});

describe('OrganizationJsonLd', () => {
  it('emits Organization schema with correct type and name', () => {
    const { container } = render(<OrganizationJsonLd />);
    const parsed = JSON.parse(scriptContent(container));
    expect(parsed['@type']).toBe('Organization');
    expect(parsed.name).toBe('TechGuru Network & Data Solutions');
    expect(parsed.url).toBe('https://www.techguru-it.asia');
  });
});

describe('FAQJsonLd', () => {
  it('maps items to Question/Answer mainEntity', () => {
    const { container } = render(
      <FAQJsonLd
        items={[
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ]}
      />,
    );
    const parsed = JSON.parse(scriptContent(container));
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity).toHaveLength(2);
    expect(parsed.mainEntity[0].acceptedAnswer.text).toBe('A1');
  });
});

describe('ArticleJsonLd', () => {
  it('uses provided values and falls back to brand image', () => {
    const { container } = render(
      <ArticleJsonLd
        title="T"
        description="D"
        url="https://x.com/a"
        datePublished="2026-01-01"
        author="TechGuru"
      />,
    );
    const parsed = JSON.parse(scriptContent(container));
    expect(parsed['@type']).toBe('Article');
    expect(parsed.headline).toBe('T');
    expect(parsed.image).toBe('https://www.techguru-it.asia/logos/techguru-logo.png');
    expect(parsed.dateModified).toBe('2026-01-01');
  });

  it('prefers explicit image and dateModified', () => {
    const { container } = render(
      <ArticleJsonLd
        title="T"
        description="D"
        url="https://x.com/a"
        image="https://img.example/cover.png"
        datePublished="2026-01-01"
        dateModified="2026-02-02"
        author="A"
      />,
    );
    const parsed = JSON.parse(scriptContent(container));
    expect(parsed.image).toBe('https://img.example/cover.png');
    expect(parsed.dateModified).toBe('2026-02-02');
  });
});

describe('BreadcrumbJsonLd', () => {
  it('prepends a Home item with the locale prefix', () => {
    const { container } = render(
      <BreadcrumbJsonLd locale="zh" items={[{ name: '产品', url: '/products' }]} />,
    );
    const parsed = JSON.parse(scriptContent(container));
    expect(parsed.itemListElement).toHaveLength(2);
    expect(parsed.itemListElement[0].position).toBe(1);
    expect(parsed.itemListElement[0].item).toBe('https://www.techguru-it.asia/zh');
    expect(parsed.itemListElement[1].position).toBe(2);
    expect(parsed.itemListElement[1].item).toBe('https://www.techguru-it.asia/products');
  });
});

describe('ProductJsonLd', () => {
  it('emits Product schema with default brand', () => {
    const { container } = render(<ProductJsonLd name="P" description="D" url="https://x.com/p" />);
    const parsed = JSON.parse(scriptContent(container));
    expect(parsed['@type']).toBe('Product');
    expect(parsed.brand.name).toBe('TechGuru');
    expect(parsed.category).toBeUndefined();
  });

  it('includes category and custom brand when provided', () => {
    const { container } = render(
      <ProductJsonLd name="P" description="D" url="https://x.com/p" category="Run" brand="TG" />,
    );
    const parsed = JSON.parse(scriptContent(container));
    expect(parsed.category).toBe('Run');
    expect(parsed.brand.name).toBe('TG');
  });
});

describe('WebSiteJsonLd', () => {
  it('emits WebSite schema with search action for the locale', () => {
    const { container } = render(<WebSiteJsonLd locale="en" />);
    const parsed = JSON.parse(scriptContent(container));
    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.url).toBe('https://www.techguru-it.asia/en');
    expect(parsed.potentialAction['query-input']).toBe('required name=search_term_string');
  });
});
