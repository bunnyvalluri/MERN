/**
 * Utility functions for parsing, decoding, structuring, and sanitizing internship text descriptions.
 */

const KNOWN_CITY_COUNTRIES = {
  london: 'UK',
  'san francisco': 'CA, United States',
  'mountain view': 'CA, United States',
  'palo alto': 'CA, United States',
  'santa clara': 'CA, United States',
  cupertino: 'CA, United States',
  sunnyvale: 'CA, United States',
  'menlo park': 'CA, United States',
  seattle: 'WA, United States',
  redmond: 'WA, United States',
  'new york': 'NY, United States',
  austin: 'TX, United States',
  boston: 'MA, United States',
  miami: 'FL, United States',
  denver: 'CO, United States',
  stockholm: 'Sweden',
  tokyo: 'Japan',
  dublin: 'Ireland',
  zurich: 'Switzerland',
  berlin: 'Germany',
  singapore: 'Singapore',
  bengaluru: 'India',
  bangalore: 'India',
  hyderabad: 'India',
  pune: 'India',
  mumbai: 'India',
  delhi: 'India',
  gurugram: 'India',
  noida: 'India',
};

/**
 * Accurately formats location without incorrect default country concatenations.
 */
export function formatLocationSmart(loc, city, fallbackCountry) {
  let c = '';
  let s = '';
  let country = '';

  if (typeof loc === 'object' && loc !== null) {
    c = (loc.city || '').trim();
    s = (loc.state || '').trim();
    country = (loc.country || '').trim();
  } else if (typeof loc === 'string') {
    c = loc.trim();
  }

  if (!c && city) c = city.trim();
  if (!country && fallbackCountry) country = fallbackCountry.trim();

  if (!c && !country) return 'Remote Global';

  const cleanCityLower = c.toLowerCase();
  if (KNOWN_CITY_COUNTRIES[cleanCityLower]) {
    const canonical = KNOWN_CITY_COUNTRIES[cleanCityLower];
    return `${c}, ${canonical}`;
  }

  const parts = [c, s, country].filter(Boolean);
  // Remove duplicates
  const uniqueParts = Array.from(new Set(parts));
  return uniqueParts.join(', ') || 'Remote Global';
}

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
 * Converts raw HTML or raw escaped markup into clean, readable plaintext.
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

/**
 * Parses rich internship descriptions into structured blocks:
 * Headers, bullet list items, and regular paragraphs.
 */
export function parseDescriptionBlocks(raw) {
  const cleaned = cleanDescriptionText(raw);
  if (!cleaned) return [];

  const rawLines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let currentList = null;

  for (const line of rawLines) {
    // Check if line is a bullet item
    if (/^[•\-*]\s+/.test(line)) {
      const itemText = line.replace(/^[•\-*]\s+/, '').trim();
      if (!currentList) {
        currentList = { type: 'list', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(itemText);
      continue;
    }

    currentList = null;

    // Check if line is a header (ALL CAPS or ends with colon or starts with #)
    const isHeader =
      (/^#+\s+/.test(line) ||
        (/^[A-Z0-9\s,&/'()-]{4,45}:?$/.test(line) && line.length < 50) ||
        /^(About the Role|The Role|What You'll Do|Key Responsibilities|Qualifications|Requirements|What You Bring|About Us|Mission|Strategy|Benefits|Delivery|Leadership):?$/i.test(line)) &&
      !line.includes('.');

    if (isHeader) {
      const headerTitle = line.replace(/^#+\s+/, '').replace(/:$/, '').trim();
      blocks.push({
        type: 'heading',
        title: headerTitle,
      });
    } else {
      blocks.push({
        type: 'paragraph',
        text: line,
      });
    }
  }

  return blocks;
}
