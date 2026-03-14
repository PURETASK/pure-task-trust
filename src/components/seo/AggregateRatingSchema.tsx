import { usePlatformStats } from "@/hooks/usePlatformStats";
import { JsonLd } from "./JsonLd";

const BASE_URL = "https://puretask.co";

export function AggregateRatingSchema() {
  const { data: stats } = usePlatformStats();

  if (!stats || stats.totalReviews === 0) return null;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: "PureTask Cleaning Services",
        description:
          "Book verified, background-checked cleaners with GPS-verified arrivals and photo-documented results. Transparent pricing with escrow protection.",
        url: BASE_URL,
        provider: {
          "@type": "Organization",
          name: "PureTask",
          url: BASE_URL,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: stats.averageRating.toFixed(1),
          reviewCount: stats.totalReviews,
          bestRating: "5",
          worstRating: "1",
        },
        areaServed: {
          "@type": "State",
          name: "Texas",
        },
        serviceType: "House Cleaning",
      }}
    />
  );
}
