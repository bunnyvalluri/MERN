/**
 * SEOHead — Declarative per-route SEO metadata component.
 *
 * Injects <title>, canonical, meta description, Open Graph, Twitter Card,
 * and optional JSON-LD structured data into <head> via react-helmet-async.
 *
 * Usage:
 *   <SEOHead
 *     title="Explore Internships | InternHub"
 *     description="Browse 2,000+ verified tech internships…"
 *     canonicalPath="/internships"
 *     ogType="website"
 *     jsonLd={jobPostingSchema}
 *   />
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { resolveSEOProps, SITE_NAME } from '../../hooks/useSEO.js';

/**
 * @param {object}  props
 * @param {string}  props.title          Full page <title> string (required)
 * @param {string}  [props.description]  Meta description (≤155 chars)
 * @param {string}  [props.canonicalPath] Pathname for canonical link, e.g. "/internships"
 * @param {string}  [props.ogImage]      Absolute URL or path to OG image
 * @param {string}  [props.ogType]       "website" | "article" (default: "website")
 * @param {boolean} [props.noindex]      Adds noindex,nofollow when true
 * @param {object}  [props.jsonLd]       JSON-LD structured data object (or array)
 */
export function SEOHead({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  noindex = false,
  jsonLd,
}) {
  const { canonicalUrl, resolvedImage, description: resolvedDesc } = resolveSEOProps({
    title,
    description,
    canonicalPath,
    ogImage,
    ogType,
    noindex,
  });

  const robotsContent = noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large';

  return (
    <Helmet>
      {/* ── Primary ─────────────────────────────────────────────────────── */}
      <title>{title}</title>
      <meta name="description" content={resolvedDesc} />
      <meta name="author" content="VALLURI RAHUL (https://valluri-rahul-portfolio.vercel.app/)" />
      <meta name="copyright" content="VALLURI RAHUL" />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph ──────────────────────────────────────────────────── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={resolvedDesc} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} — ${title}`} />
      <meta property="og:locale" content="en_US" />

      {/* ── Twitter Card ─────────────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@internhubdev" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={resolvedDesc} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} — ${title}`} />

      {/* ── JSON-LD Structured Data ──────────────────────────────────────── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export default SEOHead;
