/**
 * useSEO — Per-route metadata hook.
 *
 * Sets <title>, canonical, meta description, Open Graph, and Twitter
 * tags reactively as the user navigates. Relies on react-helmet-async
 * (HelmetProvider must wrap the app in main.jsx).
 *
 * @param {object} opts
 * @param {string} opts.title           Full page <title> string
 * @param {string} opts.description     Meta description (≤155 chars recommended)
 * @param {string} [opts.canonicalPath] Pathname + query, e.g. "/internships"
 * @param {string} [opts.ogImage]       Absolute URL to OG image (1200×630)
 * @param {string} [opts.ogType]        OG type: "website" | "article" (default: "website")
 * @param {boolean} [opts.noindex]      When true, adds noindex,nofollow robots directive
 */

import { Helmet, HelmetProvider } from 'react-helmet-async';

export { Helmet, HelmetProvider };

const SITE_NAME = 'InternHub';
const BASE_URL = 'https://internhub.dev';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`;
const DEFAULT_DESCRIPTION =
  'Discover 2,000+ verified tech internships at top startups and Fortune 500 companies. Apply directly and track your career in real time.';

/**
 * Returns the resolved SEO props object — useful when you need to build
 * structured data alongside the Helmet tags.
 */
export function resolveSEOProps({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '/',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
}) {
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const resolvedImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  return {
    title,
    description,
    canonicalUrl,
    resolvedImage,
    ogType,
    noindex,
  };
}

export { SITE_NAME, BASE_URL, DEFAULT_OG_IMAGE, DEFAULT_DESCRIPTION };
