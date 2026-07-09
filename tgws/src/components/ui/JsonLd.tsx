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
