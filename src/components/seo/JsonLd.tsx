import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://puretask.co';

// ─── Generic passthrough ───────────────────────────────────────────────
interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  const structuredData = Array.isArray(data)
    ? data
    : { '@context': 'https://schema.org', ...data };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

// ─── Multi-schema helper (multiple @graph nodes) ───────────────────────
export function JsonLdGraph({ nodes }: { nodes: Record<string, unknown>[] }) {
  const structured = {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structured)}
      </script>
    </Helmet>
  );
}

// ─── Organization ─────────────────────────────────────────────────────
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'PureTask',
        url: BASE_URL,
        logo: `${BASE_URL}/icons/icon-192x192.png`,
        description:
          'Trusted cleaning services marketplace with verified, background-checked cleaners, GPS-verified arrivals, and photo-documented results.',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@puretask.com',
          contactType: 'customer service',
        },
        sameAs: [
          'https://twitter.com/puretask',
          'https://facebook.com/puretask',
          'https://instagram.com/puretask',
        ],
      }}
    />
  );
}

// ─── LocalBusiness ────────────────────────────────────────────────────
export function LocalBusinessSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'PureTask',
        '@id': BASE_URL,
        url: BASE_URL,
        image: `${BASE_URL}/og/puretask-og.png`,
        description:
          'Professional cleaning services marketplace with GPS verification and photo documentation.',
        priceRange: '$$',
        address: { '@type': 'PostalAddress', addressCountry: 'US' },
        areaServed: { '@type': 'Country', name: 'United States' },
        serviceType: [
          'House Cleaning',
          'Deep Cleaning',
          'Move-out Cleaning',
          'Airbnb Turnover',
        ],
      }}
    />
  );
}

// ─── FAQPage ──────────────────────────────────────────────────────────
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }}
    />
  );
}

// ─── Service ──────────────────────────────────────────────────────────
export function ServiceSchema({
  name,
  description,
  price,
}: {
  name: string;
  description: string;
  price?: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        provider: { '@type': 'Organization', name: 'PureTask' },
        areaServed: { '@type': 'Country', name: 'United States' },
        ...(price && {
          offers: { '@type': 'Offer', price, priceCurrency: 'USD' },
        }),
      }}
    />
  );
}

// ─── Article / BlogPosting ────────────────────────────────────────────
export function ArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  url,
  imageUrl,
}: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  imageUrl?: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline,
        description,
        datePublished,
        dateModified: dateModified ?? datePublished,
        author: { '@type': 'Organization', name: 'PureTask' },
        publisher: {
          '@type': 'Organization',
          name: 'PureTask',
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_URL}/icons/icon-192x192.png`,
          },
        },
        url: `${BASE_URL}${url}`,
        ...(imageUrl && { image: imageUrl }),
      }}
    />
  );
}

// ─── Dataset (for stats/research pages) ───────────────────────────────
export function DatasetSchema({
  name,
  description,
  url,
  datePublished,
  keywords,
}: {
  name: string;
  description: string;
  url: string;
  datePublished: string;
  keywords?: string[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name,
        description,
        url: `${BASE_URL}${url}`,
        datePublished,
        creator: { '@type': 'Organization', name: 'PureTask' },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true,
        ...(keywords && { keywords }),
      }}
    />
  );
}

// ─── WebApplication / Tool (for calculators) ──────────────────────────
export function WebApplicationSchema({
  name,
  description,
  url,
  applicationCategory = 'UtilityApplication',
}: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name,
        description,
        url: `${BASE_URL}${url}`,
        applicationCategory,
        operatingSystem: 'All',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        creator: { '@type': 'Organization', name: 'PureTask' },
      }}
    />
  );
}

// ─── HowTo (for checklist pages) ─────────────────────────────────────
interface HowToStep {
  name: string;
  text: string;
}

export function HowToSchema({
  name,
  description,
  url,
  estimatedCost,
  totalTime,
  steps,
}: {
  name: string;
  description: string;
  url: string;
  estimatedCost?: string;
  totalTime?: string;
  steps: HowToStep[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        url: `${BASE_URL}${url}`,
        ...(estimatedCost && {
          estimatedCost: {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            value: estimatedCost,
          },
        }),
        ...(totalTime && { totalTime }),
        step: steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      }}
    />
  );
}

// ─── BreadcrumbList ───────────────────────────────────────────────────
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
        })),
      }}
    />
  );
}

export default JsonLd;
