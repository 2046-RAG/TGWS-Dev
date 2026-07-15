interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TechGuru Network & Data Solutions',
    url: 'https://www.techguru-it.asia',
    logo: 'https://www.techguru-it.asia/logos/techguru-logo.png',
    description: 'Asia\'s IT solutions integrator specializing in Build, Run, and Protect infrastructure solutions.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PH',
      addressRegion: 'Metro Manila',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+63-960-282-5051',
      contactType: 'sales',
    },
    sameAs: [],
  };

  return <JsonLd data={org} />;
}

export function FAQJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={faq} />;
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
}) {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || 'https://picsum.photos/seed/techguru/1200/630',
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author,
      url: 'https://www.techguru-it.asia',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechGuru Network & Data Solutions',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.techguru-it.asia/logos/techguru-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return <JsonLd data={article} />;
}

export function BreadcrumbJsonLd({
  items,
  locale,
}: {
  items: { name: string; url?: string }[];
  locale: string;
}) {
  const baseUrl = 'https://www.techguru-it.asia';
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${baseUrl}/${locale}`,
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.name,
      item: item.url ? `${baseUrl}${item.url}` : undefined,
    })),
  ];

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return <JsonLd data={breadcrumb} />;
}

export function ProductJsonLd({
  name,
  description,
  url,
  image,
  category,
  brand,
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
  category?: string;
  brand?: string;
}) {
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url,
    image: image || 'https://picsum.photos/seed/techguru-product/1200/630',
    brand: {
      '@type': 'Organization',
      name: brand || 'TechGuru',
    },
    ...(category && { category }),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      price: '0',
      priceValidUntil: '2027-12-31',
      seller: {
        '@type': 'Organization',
        name: 'TechGuru Network & Data Solutions',
      },
    },
  };

  return <JsonLd data={product} />;
}

export function WebSiteJsonLd({ locale }: { locale: string }) {
  const baseUrl = 'https://www.techguru-it.asia';
  const site = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TechGuru Network & Data Solutions',
    url: `${baseUrl}/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={site} />;
}
