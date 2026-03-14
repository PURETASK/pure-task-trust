import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  /** Path segment e.g. "/about" — if omitted, current route path is used */
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  keywords?: string;
}

const SITE_NAME = 'PureTask';
const DEFAULT_DESCRIPTION = 'Book verified, background-checked cleaners with GPS-verified arrivals and photo-documented results. Transparent pricing with escrow protection.';
const DEFAULT_IMAGE = '/og/puretask-og.png';
const BASE_URL = 'https://pure-task-trust.lovable.app';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  keywords,
}: SEOProps) {
  const location = useLocation();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Trusted Cleaning Services`;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  // Always resolve canonical — use explicit url prop, fall back to current path.
  // Strip trailing slash (except root "/") for canonical consistency.
  const rawPath = url ?? location.pathname;
  const normalizedPath = rawPath !== '/' ? rawPath.replace(/\/$/, '') : rawPath;
  const canonicalUrl = `${BASE_URL}${normalizedPath}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical URL — always present, one per page */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}

export default SEO;

