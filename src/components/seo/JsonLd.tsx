import { Helmet } from 'react-helmet-async';

type JsonLdType = 'Organization' | 'LocalBusiness' | 'FAQPage' | 'Service' | 'WebPage';

interface JsonLdProps {
  type: JsonLdType;
  data: Record<string, unknown>;
}

const BASE_URL = 'https://pure-task-trust.lovable.app';

export function JsonLd({ type, data }: JsonLdProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

// Pre-built schemas for common use cases
export function OrganizationSchema() {
  return (
    <JsonLd
      type="Organization"
      data={{
        name: 'PureTask',
        url: BASE_URL,
        logo: `${BASE_URL}/og/puretask-logo.png`,
        description: 'Trusted cleaning services marketplace with verified, background-checked cleaners.',
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

export function LocalBusinessSchema() {
  return (
    <JsonLd
      type="LocalBusiness"
      data={{
        name: 'PureTask',
        '@id': BASE_URL,
        url: BASE_URL,
        image: `${BASE_URL}/og/puretask-og.png`,
        description: 'Professional cleaning services with GPS verification and photo documentation.',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
        },
        areaServed: {
          '@type': 'Country',
          name: 'United States',
        },
        serviceType: ['House Cleaning', 'Deep Cleaning', 'Move-out Cleaning', 'Airbnb Turnover'],
      }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  return (
    <JsonLd
      type="FAQPage"
      data={{
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function ServiceSchema({ 
  name, 
  description, 
  price 
}: { 
  name: string; 
  description: string; 
  price?: string;
}) {
  return (
    <JsonLd
      type="Service"
      data={{
        name,
        description,
        provider: {
          '@type': 'Organization',
          name: 'PureTask',
        },
        areaServed: {
          '@type': 'Country',
          name: 'United States',
        },
        ...(price && {
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: 'USD',
          },
        }),
      }}
    />
  );
}

export default JsonLd;
