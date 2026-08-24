import { describe, it, expect } from '@jest/globals';
import { generateFingerprint, generateSlug, sanitizeContent } from '../../src/services/ingestion.service.js';
import { sourceRegistry } from '../../src/connectors/SourceRegistry.js';
import { JobSourceConnector } from '../../src/connectors/base/JobSourceConnector.js';
import { SOURCE_TYPE } from '../../src/models/Internship.model.js';

class MockJobConnector extends JobSourceConnector {
  constructor(name = 'MockSource') {
    super(name, SOURCE_TYPE.API, { timeoutMs: 2000, failureThreshold: 3 });
  }
  async fetchListings() {
    return [
      {
        externalId: 'ext_101',
        title: 'Distributed Systems Intern',
        companyName: 'Acme Cloud Corp',
        location: 'Bengaluru, India',
        workMode: 'HYBRID',
        description: 'Design distributed storage engines.',
        skills: ['Go', 'Raft', 'Rust'],
        canonicalUrl: 'https://acme.com/jobs/101',
        stipend: { amount: 45000, currency: 'INR', period: 'MONTH' },
      },
    ];
  }
  normalizeListing(raw) {
    return raw;
  }
}

describe('Ingestion Engine, Deduplication & Connectors Unit Tests', () => {
  describe('Source Registry', () => {
    it('registers and retrieves source connectors', () => {
      const connector = new MockJobConnector('CustomMockAPI');
      sourceRegistry.registerConnector(connector);
      expect(sourceRegistry.getConnector('CustomMockAPI')).toBe(connector);
      expect(sourceRegistry.getAllConnectors().some((c) => c.name === 'CustomMockAPI')).toBe(true);
    });

    it('summarizes registered connectors metrics correctly', () => {
      const metrics = sourceRegistry.getMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
      const first = metrics[0];
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('type');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('circuitOpen');
    });
  });

  describe('Deduplication Fingerprinting', () => {
    it('generates deterministic SHA-256 hash across whitespace and casing variations', () => {
      const hash1 = generateFingerprint(
        'Google',
        'Software Engineer Intern',
        'Mountain View, CA',
        'https://careers.google.com/jobs/123'
      );
      const hash2 = generateFingerprint(
        '  GOOGLE  ',
        'software engineer intern',
        'mountain view, ca',
        'https://careers.google.com/jobs/123/'
      );
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('generates distinct hashes for different titles or companies', () => {
      const hashA = generateFingerprint(
        'Stripe',
        'Backend Engineer Intern',
        'Remote',
        'https://stripe.com/jobs/a'
      );
      const hashB = generateFingerprint(
        'Stripe',
        'Frontend Engineer Intern',
        'Remote',
        'https://stripe.com/jobs/b'
      );
      expect(hashA).not.toBe(hashB);
    });

    it('generates valid URL slug with company and unique suffix', () => {
      const slug = generateSlug('Machine Learning Intern', 'OpenAI');
      expect(slug).toMatch(/^machine-learning-intern-at-openai-[a-f0-9]+$/);
    });

    it('sanitizes malicious script and iframe tags from raw descriptions', () => {
      const dirty = '<p>Great job opportunity</p><script>alert("hacked")</script><iframe src="evil.com"></iframe>';
      const clean = sanitizeContent(dirty);
      expect(clean).not.toContain('<script');
      expect(clean).not.toContain('<iframe');
      expect(clean).toContain('Great job opportunity');
    });
  });

  describe('Circuit Breaker Mechanics', () => {
    it('records success and keeps circuit closed under normal operation', () => {
      const connector = new MockJobConnector('ResilienceTest');
      connector.recordSuccess(10);
      expect(connector.isCircuitOpen()).toBe(false);
      expect(connector.failureCount).toBe(0);
      expect(connector.getStatus()).toBe('HEALTHY');
    });

    it('trips circuit breaker to OPEN state after 3 consecutive failures', () => {
      const connector = new MockJobConnector('FaultyAPI');
      connector.recordFailure(new Error('Network timeout 1'));
      connector.recordFailure(new Error('Network timeout 2'));
      expect(connector.isCircuitOpen()).toBe(false);

      connector.recordFailure(new Error('Network timeout 3'));
      expect(connector.isCircuitOpen()).toBe(true);
      expect(connector.getStatus()).toBe('ERROR');
    });
  });
});
