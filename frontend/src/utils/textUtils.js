/**
 * Utility functions for parsing, decoding, and sanitizing internship text descriptions.
 */

/**
 * Decodes HTML entities from strings (e.g., &lt;div&gt; &quot; &#39; &amp;nbsp;).
 * Performs iterative decoding to handle multiply-encoded strings.
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';

  let current = str;
  let prev = '';
  let iterations = 0;

  while (current !== prev && iterations < 3) {
    prev = current;
    iterations++;

    current = current
      .replace(/&amp;nbsp;/gi, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;quot;/gi, '"')
      .replace(/&quot;/gi, '"')
      .replace(/&amp;#39;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&amp;#x27;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&amp;lt;/gi, '<')
      .replace(/&lt;/gi, '<')
      .replace(/&amp;gt;/gi, '>')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;amp;/gi, '&')
      .replace(/&amp;/gi, '&');
  }

  return current;
}

/**
 * Converts raw HTML or raw escaped markup into clean, readable plaintext paragraphs.
 */
export function cleanDescriptionText(raw) {
  if (!raw || typeof raw !== 'string') return '';

  let text = decodeHtmlEntities(raw);

  // Replace block tags with newlines
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '') // remove remaining HTML tags
    .replace(/\n\s*\n\s*\n+/g, '\n\n') // collapse excessive newlines
    .trim();

  return text;
}

/**
 * Splits text into paragraphs for clean React rendering.
 */
export function parseDescriptionParagraphs(raw) {
  const cleaned = cleanDescriptionText(raw);
  if (!cleaned) return [];
  return cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
