# InternHub — SEO Strategy & Reference Guide

> **Last updated:** 2026-08-23  
> **Applies to:** `client/` (Vite + React SPA)

---

## Table of Contents

1. [Overview & Strategy](#1-overview--strategy)
2. [Technology](#2-technology)
3. [Meta Tag Inventory](#3-meta-tag-inventory)
4. [robots.txt](#4-robotstxt)
5. [Sitemap](#5-sitemap)
6. [Structured Data (JSON-LD)](#6-structured-data-json-ld)
7. [Core Web Vitals Optimizations](#7-core-web-vitals-optimizations)
8. [Private Route Protection](#8-private-route-protection)
9. [Image SEO](#9-image-seo)
10. [Accessibility & Semantic HTML](#10-accessibility--semantic-html)
11. [Future Recommendations](#11-future-recommendations)

---

## 1. Overview & Strategy

InternHub is a **client-side SPA** (Vite + React). SEO for SPAs is achievable because Google's crawler fully executes JavaScript. Bing, Yahoo, and social crawlers (Facebook, Twitter) render pages statically and rely on the `index.html` shell meta tags.

**Two-layer approach:**

| Layer | What it does | Who sees it |
|---|---|---|
| `client/index.html` | Static fallback meta: title, description, OG, Twitter | Social crawlers, non-JS bots |
| `<SEOHead>` component | Runtime override per route via `react-helmet-async` | Googlebot, Bingbot (JS-enabled crawlers) |

**Canonical domain:** `https://internhub.dev/`

---

## 2. Technology

| Package | Purpose |
|---|---|
| `react-helmet-async` | Inject `<title>`, `<meta>`, `<link rel="canonical">`, JSON-LD into `<head>` per route |
| `SEOHead.jsx` | Declarative component — wraps Helmet with sensible defaults |
| `useSEO.js` | Helper module: constants, `resolveSEOProps()` |

**Setup:** `HelmetProvider` wraps the app in `src/main.jsx`.

---

## 3. Meta Tag Inventory

### `/` — Home (LandingPage)

| Tag | Value |
|---|---|
| `<title>` | `InternHub — Find the Right Internship. Build Your Future.` |
| `description` | `Discover 2,000+ verified tech internships at top startups and Fortune 500 companies…` |
| `canonical` | `https://internhub.dev/` |
| `og:type` | `website` |
| `og:image` | `https://internhub.dev/og-default.jpg` (1200×630) |
| `twitter:card` | `summary_large_image` |
| JSON-LD | `WebSite` + `SearchAction` + `Organization` |
| `robots` | `index,follow,max-snippet:-1,max-image-preview:large` |

### `/internships` — Internship Listing (InternshipsPage)

| Tag | Value |
|---|---|
| `<title>` | `Tech Internships — Browse Verified Roles \| InternHub` |
| `description` | `Browse and filter 2,000+ verified software engineering, AI/ML, design, and data science internships…` |
| `canonical` | `https://internhub.dev/internships` (**no query params** — all filter variants canonicalize here) |
| `og:type` | `website` |
| JSON-LD | `ItemList` (first 10 results with name + URL) |

> [!NOTE]
> The canonical always points to `/internships` without query parameters. This prevents duplicate content issues when users filter by skill, location, etc. Each filter combination is a different URL but a single canonical.

### `/internships/:id` — Internship Detail (InternshipDetailPage)

| Tag | Value |
|---|---|
| `<title>` | `{internship.title} at {company.name} — InternHub` |
| `description` | First 152 characters of `internship.description` |
| `canonical` | `https://internhub.dev/internships/{id}` |
| `og:type` | `article` |
| `og:image` | Company logo URL (falls back to `/og-default.jpg`) |
| JSON-LD | `JobPosting` (full schema with baseSalary, jobLocation, hiringOrganization) |

> [!IMPORTANT]
> The `JobPosting` schema enables **Google for Jobs** integration, which shows internship listings directly in Google Search with rich results including title, company, location, salary, and deadline. Verify implementation at [Google Rich Results Test](https://search.google.com/test/rich-results).

### `/companies` — Company Directory (CompaniesPage)

| Tag | Value |
|---|---|
| `<title>` | `Top Tech Companies Hiring Interns \| InternHub` |
| `description` | `Browse 500+ verified tech companies actively hiring…` |
| `canonical` | `https://internhub.dev/companies` |
| `og:type` | `website` |
| JSON-LD | `CollectionPage` |

### `/companies/:id` — Company Profile (CompanyDetailPage)

| Tag | Value |
|---|---|
| `<title>` | `{company.name} Internships & Hiring \| InternHub` |
| `description` | Dynamic per company |
| `canonical` | `https://internhub.dev/companies/{id}` |
| `og:type` | `website` |
| JSON-LD | `ProfilePage` + `Organization` |

### Internal / Noindex Pages

| Route | Status |
|---|---|
| `/design-system` | `noindex,nofollow` via `<SEOHead noindex>` in router |
| `/login` | Not blocked in robots.txt (crawlable but no SEO value — relies on auth middleware) |
| `/register` | Blocked in `robots.txt` |
| `/admin/*` | Blocked in `robots.txt` + `ProtectedRoute` auth guard |
| `/student/*` | Blocked in `robots.txt` + `ProtectedRoute` auth guard |
| `/recruiter/*` | Blocked in `robots.txt` + `ProtectedRoute` auth guard |

---

## 4. robots.txt

**Location:** `client/public/robots.txt` → served at `https://internhub.dev/robots.txt`

```
User-agent: *
Allow: /
Allow: /internships
Allow: /companies
Disallow: /admin
Disallow: /student
Disallow: /recruiter
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /notifications
Disallow: /design-system

Sitemap: https://internhub.dev/sitemap.xml
```

**Why block auth routes?** These pages return login forms or redirects to authenticated content. Blocking them:
- Prevents "soft 404" signals from auth redirects
- Keeps crawl budget focused on indexable content
- Prevents session/token URLs from appearing in search results

---

## 5. Sitemap

### Static Sitemap

**Location:** `client/public/sitemap.xml` → served at `https://internhub.dev/sitemap.xml`

| URL | Priority | changefreq |
|---|---|---|
| `https://internhub.dev/` | 1.0 | weekly |
| `https://internhub.dev/internships` | 0.9 | daily |
| `https://internhub.dev/companies` | 0.8 | weekly |

### Dynamic Sitemap (To Implement)

For dynamic routes (`/internships/:id`, `/companies/:id`), implement a server-side endpoint:

```
GET https://internhub.dev/api/sitemap
```

This should query the database for all published internships and verified companies and return XML. Reference it from a **Sitemap Index**:

**`/sitemap-index.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://internhub.dev/sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://internhub.dev/api/sitemap</loc>
  </sitemap>
</sitemapindex>
```

Update `robots.txt` to reference the index:
```
Sitemap: https://internhub.dev/sitemap-index.xml
```

### Sitemap Submission

After deployment, submit to:
- [Google Search Console](https://search.google.com/search-console/) → Sitemaps → Submit `https://internhub.dev/sitemap.xml`
- [Bing Webmaster Tools](https://www.bing.com/webmasters/) → Submit sitemap

---

## 6. Structured Data (JSON-LD)

### WebSite + SearchAction (Landing Page)
Enables the Google Sitelinks Search Box in search results. The `SearchAction` points to `/internships?search=`.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "InternHub",
  "url": "https://internhub.dev/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://internhub.dev/internships?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### JobPosting (Internship Detail Page)
Enables **Google for Jobs** rich results. Key fields:
- `title`, `description`, `datePosted`, `validThrough`
- `hiringOrganization` (name, sameAs, logo)
- `jobLocation` (PostalAddress or "Remote")
- `baseSalary` (MonetaryAmount with unitText HOUR/MONTH)
- `directApply: true` (signals one-click apply)
- `jobLocationType: "TELECOMMUTE"` (for remote roles)

**Validate at:** https://search.google.com/test/rich-results

### ItemList (Internships Listing Page)
Lists the first 10 internships from the current result set. Helps Google understand the collection structure.

### CollectionPage (Companies Page)
Signals that `/companies` is a curated directory of organizations.

---

## 7. Core Web Vitals Optimizations

### LCP (Largest Contentful Paint)

| Change | Impact |
|---|---|
| Added `<link rel="preload">` for Inter 700 woff2 in `index.html` | Eliminates FOUT; LCP text renders immediately |
| Company logo `<img>` on detail page: `loading="eager"` (above fold) | Ensures LCP image is not deferred |
| All off-screen images: `loading="lazy"` | Reduces initial payload |

### CLS (Cumulative Layout Shift)

| Change | Impact |
|---|---|
| Company logo `<img>` has explicit `width={64} height={64}` | Browser reserves space before image loads; prevents layout shift |
| Font preload prevents FOUT-induced reflow | Stable heading dimensions |

### FID / INP (Interaction to Next Paint)

| Change | Impact |
|---|---|
| All routes are lazy-loaded via `React.lazy` + `Suspense` | Smaller initial JS bundle; faster TTI |
| Removed indefinitely-running `animate-pulse` from announcement pill | Frees compositor thread from constant paint/composite cycles |

### Network

| Change | Impact |
|---|---|
| `<link rel="preconnect">` for Google Fonts origin | Eliminates DNS + TLS handshake latency on first font request |

---

## 8. Private Route Protection

InternHub uses a two-layer approach:

1. **`robots.txt` Disallow** — Tells crawlers not to visit private routes. This is a crawler hint, not a security measure.
2. **`ProtectedRoute.jsx`** — Enforces auth at render time; unauthenticated users are redirected to `/login`. Even if a crawler ignores `robots.txt`, it receives a redirect to `/login` — not private content.

> [!WARNING]
> Never rely solely on `robots.txt` to protect sensitive content. Always enforce server-side auth on API routes.

---

## 9. Image SEO

| Image | Location | Optimization |
|---|---|---|
| OG Social Image | `public/og-default.jpg` | 1200×630, < 300KB |
| Company logos (detail page) | External CDN | `width={64} height={64}`, `loading="eager"`, `alt="{company.name} company logo"` |
| Testimonial avatars | Unsplash CDN | `loading="lazy"` via Avatar component |
| Internship card logos | External CDN | Handled by `InternshipCard` — add `loading="lazy"` in that component |

**Recommended future changes:**
- Serve OG image from CDN with cache headers `max-age=31536000`
- Add `decoding="async"` to all non-critical images
- Consider `next/image` equivalent if SSR is adopted

---

## 10. Accessibility & Semantic HTML

| Change | Route | Benefit |
|---|---|---|
| `<main id="main-content">` | All public pages | Skip-to-content link target |
| Skip-to-content `<a>` in `index.html` | Global | Keyboard navigation compliance (WCAG 2.4.1) |
| `aria-labelledby` on all `<section>` elements | LandingPage | Screen readers announce section names |
| `aria-live="polite"` on results count | InternshipsPage | Screen readers announce count changes when filters applied |
| `role="search"` on filter sidebar | InternshipsPage | Landmark navigation for screen readers |
| `aria-label="Back to all internships"` | Detail pages | Descriptive link text for screen readers |
| `role="status" aria-live="polite"` on announcement pill | LandingPage | Accessible status announcement |

---

## 11. Future Recommendations

### High Priority

- [ ] **SSR / Prerender**: Adopt Vite SSR, Remix, or Next.js to serve pre-rendered HTML to all crawlers (not just Googlebot). This removes the JS-execution dependency for Bing, Yahoo, and social bots.
- [ ] **Dynamic Sitemap Endpoint**: Implement `GET /api/sitemap` in the Express server to auto-generate a sitemap from the database for all published internships and verified companies.
- [ ] **IndexNow**: Implement the IndexNow API to instantly notify Bing/Yandex when new internships are published.

### Medium Priority

- [ ] **InternshipCard images**: Add `loading="lazy"` and `width`/`height` to company logos inside `InternshipCard.jsx`.
- [ ] **Breadcrumb JSON-LD**: Add `BreadcrumbList` schema to detail pages (Home → Internships → {Title}).
- [ ] **FAQ JSON-LD**: Add FAQ schema to the landing page for common questions.
- [ ] **hreflang**: Add `<link rel="alternate" hreflang="en">` if multiple language versions are introduced.

### Low Priority

- [ ] **Google Search Console verification**: Uncomment and fill in the GSC meta token in `index.html`.
- [ ] **Core Web Vitals monitoring**: Integrate Vercel Analytics or the `web-vitals` package to track real-user LCP, CLS, and INP.
- [ ] **Open Graph image per internship**: Generate per-internship OG images (company logo + role title) using an Edge Function or Cloudinary.
