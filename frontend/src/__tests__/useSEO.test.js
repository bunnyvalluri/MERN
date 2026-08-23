import { describe, it, expect } from 'vitest';
import { resolveSEOProps, SITE_NAME, BASE_URL } from '../hooks/useSEO.js';

describe('useSEO Utility', () => {
  it('should export correct site defaults', () => {
    expect(SITE_NAME).toBe('InternHub');
    expect(BASE_URL).toBe('https://internhub.dev');
  });

  it('should construct valid SEO metadata object', () => {
    const props = resolveSEOProps({
      title: 'Explore Software Internships',
      description: 'Find paid summer internships in tech.',
      canonicalPath: '/internships',
      ogType: 'website',
    });

    expect(props.title).toBe('Explore Software Internships');
    expect(props.description).toBe('Find paid summer internships in tech.');
    expect(props.canonicalUrl).toBe('https://internhub.dev/internships');
    expect(props.resolvedImage).toContain('https://internhub.dev');
    expect(props.noindex).toBe(false);
  });

  it('should support noindex flag for private dashboard routes', () => {
    const props = resolveSEOProps({
      title: 'Admin Dashboard',
      noindex: true,
    });

    expect(props.noindex).toBe(true);
  });
});
