import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  default as JsonLd,
  OrganizationJsonLd,
  FAQJsonLd,
  ArticleJsonLd,
  BreadcrumbJsonLd,
  ProductJsonLd,
  WebSiteJsonLd,
} from '../JsonLd';

function extractScriptData(container: HTMLElement): unknown {
  const script = container.querySelector('script[type="application/ld+json"]');
  if (!script?.textContent) {
    throw new Error('No JSON-LD script tag found');
  }
  return JSON.parse(script.textContent);
}

describe('JsonLd', () => {
  it('renders a script tag with type="application/ld+json"', () => {
    const { container } = render(<JsonLd data={{ foo: 'bar' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it('serializes the data prop as JSON inside the script tag', () => {
    const { container } = render(
      <JsonLd data={{ '@type': 'Thing', name: 'Test' }} />
    );
    const parsed = extractScriptData(container) as { '@type': string; name: string };
    expect(parsed['@type']).toBe('Thing');
    expect(parsed.name).toBe('Test');
  });
});

describe('OrganizationJsonLd', () => {
  it('emits an Organization schema with TechGuru identity fields', () => {
    const { container } = render(<OrganizationJsonLd />);
    const parsed = extractScriptData(container) as {
      '@type': string;
      name: string;
      url: string;
      logo: string;
      contactPoint: { telephone: string; contactType: string };
    };
    expect(parsed['@type']).toBe('Organization');
    expect(parsed.name).toBe('TechGuru Network & Data Solutions');
    expect(parsed.url).toBe('https://www.techguru-it.asia');
    expect(parsed.logo).toContain('techguru-logo.png');
    expect(parsed.contactPoint.telephone).toContain('+63');
    expect(parsed.contactPoint.contactType).toBe('sales');
  });

  it('populates sameAs with LinkedIn and WhatsApp profile URLs', () => {
    const { container } = render(<OrganizationJsonLd />);
    const parsed = extractScriptData(container) as { sameAs: string[] };
    expect(Array.isArray(parsed.sameAs)).toBe(true);
    expect(parsed.sameAs).toContain(
      'https://www.linkedin.com/company/techguru-network-data-solutions'
    );
    expect(parsed.sameAs).toContain('https://wa.me/639602825051');
  });
});

describe('FAQJsonLd', () => {
  it('emits an FAQPage schema with one Question per item', () => {
    const items = [
      { question: 'Q1?', answer: 'A1' },
      { question: 'Q2?', answer: 'A2' },
    ];
    const { container } = render(<FAQJsonLd items={items} />);
    const parsed = extractScriptData(container) as {
      '@type': string;
      mainEntity: { '@type': string; name: string; acceptedAnswer: { text: string } }[];
    };
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity).toHaveLength(2);
    expect(parsed.mainEntity[0]['@type']).toBe('Question');
    expect(parsed.mainEntity[0].name).toBe('Q1?');
    expect(parsed.mainEntity[0].acceptedAnswer.text).toBe('A1');
    expect(parsed.mainEntity[1].name).toBe('Q2?');
  });
});

describe('ArticleJsonLd', () => {
  it('emits an Article schema with headline, author, publisher', () => {
    const { container } = render(
      <ArticleJsonLd
        title="Test Article"
        description="A description"
        url="https://example.com/article"
        datePublished="2026-01-01"
        author="TechGuru"
      />
    );
    const parsed = extractScriptData(container) as {
      '@type': string;
      headline: string;
      description: string;
      url: string;
      datePublished: string;
      dateModified: string;
      image: string;
      author: { '@type': string; name: string };
      publisher: { '@type': string; name: string };
    };
    expect(parsed['@type']).toBe('Article');
    expect(parsed.headline).toBe('Test Article');
    expect(parsed.url).toBe('https://example.com/article');
    expect(parsed.datePublished).toBe('2026-01-01');
    // dateModified falls back to datePublished when not provided.
    expect(parsed.dateModified).toBe('2026-01-01');
    expect(parsed.image).toContain('og-default.png');
    expect(parsed.author['@type']).toBe('Organization');
    expect(parsed.author.name).toBe('TechGuru');
    expect(parsed.publisher.name).toBe('TechGuru Network & Data Solutions');
  });

  it('uses the provided image and dateModified when supplied', () => {
    const { container } = render(
      <ArticleJsonLd
        title="T"
        description="D"
        url="https://example.com/a"
        image="https://example.com/img.png"
        datePublished="2026-01-01"
        dateModified="2026-06-01"
        author="TechGuru"
      />
    );
    const parsed = extractScriptData(container) as {
      image: string;
      dateModified: string;
    };
    expect(parsed.image).toBe('https://example.com/img.png');
    expect(parsed.dateModified).toBe('2026-06-01');
  });
});

describe('BreadcrumbJsonLd', () => {
  it('emits a BreadcrumbList with Home as the first item', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[
          { name: 'Products', url: '/en/products' },
          { name: 'Build', url: '/en/products/build' },
        ]}
        locale="en"
      />
    );
    const parsed = extractScriptData(container) as {
      '@type': string;
      itemListElement: { '@type': string; position: number; name: string; item?: string }[];
    };
    expect(parsed['@type']).toBe('BreadcrumbList');
    expect(parsed.itemListElement).toHaveLength(3);
    expect(parsed.itemListElement[0].name).toBe('Home');
    expect(parsed.itemListElement[0].position).toBe(1);
    expect(parsed.itemListElement[0].item).toBe('https://www.techguru-it.asia/en');
    expect(parsed.itemListElement[1].position).toBe(2);
    expect(parsed.itemListElement[1].name).toBe('Products');
    expect(parsed.itemListElement[1].item).toBe('https://www.techguru-it.asia/en/products');
  });

  it('supports locale-prefixed Home URL', () => {
    const { container } = render(
      <BreadcrumbJsonLd items={[]} locale="zh" />
    );
    const parsed = extractScriptData(container) as {
      itemListElement: { item?: string }[];
    };
    expect(parsed.itemListElement[0].item).toBe('https://www.techguru-it.asia/zh');
  });

  it('omits the `item` field when no URL is provided for a non-Home item', () => {
    const { container } = render(
      <BreadcrumbJsonLd items={[{ name: 'Current' }]} locale="en" />
    );
    const parsed = extractScriptData(container) as {
      itemListElement: { item?: string; name: string }[];
    };
    expect(parsed.itemListElement[1].item).toBeUndefined();
    expect(parsed.itemListElement[1].name).toBe('Current');
  });
});

describe('ProductJsonLd', () => {
  it('emits a Product schema with brand and no offers (fake price removed)', () => {
    const { container } = render(
      <ProductJsonLd
        name="AIGC Platform"
        description="AI-generated content platform"
        url="https://example.com/products/aigc"
        category="build"
        brand="TechGuru"
      />
    );
    const parsed = extractScriptData(container) as {
      '@type': string;
      name: string;
      description: string;
      brand: { '@type': string; name: string };
      category: string;
      offers?: { '@type': string; availability: string; price: string };
      image: string;
    };
    expect(parsed['@type']).toBe('Product');
    expect(parsed.name).toBe('AIGC Platform');
    expect(parsed.category).toBe('build');
    expect(parsed.brand.name).toBe('TechGuru');
    // offers block was removed because price: '0' was fake data violating
    // Google's structured data policy.
    expect(parsed.offers).toBeUndefined();
    expect(parsed.image).toContain('og-default.png');
  });

  it('defaults the brand to "TechGuru" when not provided', () => {
    const { container } = render(
      <ProductJsonLd name="X" description="Y" url="https://example.com" />
    );
    const parsed = extractScriptData(container) as { brand: { name: string } };
    expect(parsed.brand.name).toBe('TechGuru');
  });

  it('omits the `category` field when not provided', () => {
    const { container } = render(
      <ProductJsonLd name="X" description="Y" url="https://example.com" />
    );
    const parsed = extractScriptData(container) as { category?: string };
    expect(parsed.category).toBeUndefined();
  });
});

describe('WebSiteJsonLd', () => {
  it('emits a WebSite schema without SearchAction (search not implemented)', () => {
    const { container } = render(<WebSiteJsonLd locale="en" />);
    const parsed = extractScriptData(container) as {
      '@type': string;
      name: string;
      url: string;
      potentialAction?: unknown;
    };
    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.url).toBe('https://www.techguru-it.asia/en');
    // SearchAction was removed because /blog?q= search is not implemented;
    // advertising it would mislead Google into expecting a working search.
    expect(parsed.potentialAction).toBeUndefined();
  });

  it('uses the locale-prefixed URL', () => {
    const { container } = render(<WebSiteJsonLd locale="zh" />);
    const parsed = extractScriptData(container) as {
      url: string;
      potentialAction?: unknown;
    };
    expect(parsed.url).toBe('https://www.techguru-it.asia/zh');
    expect(parsed.potentialAction).toBeUndefined();
  });
});
