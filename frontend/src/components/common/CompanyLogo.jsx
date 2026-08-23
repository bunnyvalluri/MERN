import React, { useState } from 'react';

/**
 * High-definition Company Brand Logo with Vector SVGs, Official Favicons,
 * and smart fallbacks for all top tech employers.
 */
export function CompanyLogo({
  companyName = '',
  slug = '',
  logo = '',
  website = '',
  className = 'w-12 h-12',
}) {
  const [imgError, setImgError] = useState(false);

  const cleanName = (companyName || slug || '').toLowerCase().trim();

  // Mapping of common tech company website domains for 128px high-res favicons
  const domainMap = {
    stripe: 'stripe.com',
    google: 'google.com',
    openai: 'openai.com',
    anthropic: 'anthropic.com',
    nvidia: 'nvidia.com',
    microsoft: 'microsoft.com',
    apple: 'apple.com',
    meta: 'meta.com',
    facebook: 'meta.com',
    'amazon-aws': 'aws.amazon.com',
    amazon: 'amazon.com',
    netflix: 'netflix.com',
    figma: 'figma.com',
    linear: 'linear.app',
    vercel: 'vercel.com',
    supabase: 'supabase.com',
    cloudflare: 'cloudflare.com',
    airbnb: 'airbnb.com',
    uber: 'uber.com',
    spotify: 'spotify.com',
    'jane-street': 'janestreet.com',
    citadel: 'citadel.com',
    databricks: 'databricks.com',
    snowflake: 'snowflake.com',
    palantir: 'palantir.com',
    spacex: 'spacex.com',
    tesla: 'tesla.com',
    'scale-ai': 'scale.com',
    github: 'github.com',
    discord: 'discord.com',
    robinhood: 'robinhood.com',
    coinbase: 'coinbase.com',
    brex: 'brex.com',
    notion: 'notion.so',
    cursor: 'cursor.com',
    perplexity: 'perplexity.ai',
    elevenlabs: 'elevenlabs.io',
    'mistral-ai': 'mistral.ai',
    huggingface: 'huggingface.co',
    roblox: 'roblox.com',
    canva: 'canva.com',
    adobe: 'adobe.com',
  };

  // Find domain
  let matchedDomain = '';
  if (website && website.startsWith('http')) {
    try {
      matchedDomain = new URL(website).hostname.replace(/^www\./, '');
    } catch {
      // ignore
    }
  }

  if (!matchedDomain) {
    for (const [key, dom] of Object.entries(domainMap)) {
      if (cleanName.includes(key) || (slug && slug.toLowerCase().includes(key))) {
        matchedDomain = dom;
        break;
      }
    }
  }

  // Determine logo source
  let logoSrc = null;

  // If provided logo is already a favicon or valid brand icon (not an Unsplash generic photo)
  if (logo && !logo.includes('images.unsplash.com') && !imgError) {
    logoSrc = logo;
  } else if (matchedDomain && !imgError) {
    // 128px high resolution Google Favicon CDN for official company brand icon
    logoSrc = `https://www.google.com/s2/favicons?domain=${matchedDomain}&sz=128`;
  }

  // Brand background color styling
  const brandColors = {
    cloudflare: 'bg-orange-50 border-orange-200 text-orange-600',
    airbnb: 'bg-rose-50 border-rose-200 text-rose-600',
    stripe: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    google: 'bg-blue-50 border-blue-200 text-blue-600',
    spotify: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    nvidia: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    netflix: 'bg-rose-50 border-rose-200 text-rose-700',
    openai: 'bg-slate-900 border-slate-800 text-white',
    anthropic: 'bg-amber-50 border-amber-200 text-amber-800',
    figma: 'bg-purple-50 border-purple-200 text-purple-600',
    vercel: 'bg-slate-900 border-slate-800 text-white',
    supabase: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    discord: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    github: 'bg-slate-900 border-slate-800 text-white',
  };

  let matchedBrandStyle = 'bg-white border-slate-200/90 text-slate-800';
  for (const [key, style] of Object.entries(brandColors)) {
    if (cleanName.includes(key) || (slug && slug.toLowerCase().includes(key))) {
      matchedBrandStyle = style;
      break;
    }
  }

  const initialLetter = (companyName || slug || 'T').charAt(0).toUpperCase();

  return (
    <div
      className={`rounded-2xl border p-2 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden relative transition-transform duration-200 ${matchedBrandStyle} ${className}`}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={`${companyName} icon`}
          className="w-full h-full object-contain rounded-xl select-none"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-black text-base uppercase tracking-tighter">
          {initialLetter}
        </span>
      )}
    </div>
  );
}

export default CompanyLogo;
