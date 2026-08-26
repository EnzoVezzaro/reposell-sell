/**
 * @reposell/sell — Canonical sell page template.
 *
 * Exports the storefront schema, CSS, JS, and a render function so the CLI
 * and other RepoSell products can generate consistent sell pages without
 * hardcoding template strings.
 *
 * Usage:
 *   import { renderSellPage, STYLES_CSS, SCRIPTS_JS } from '@reposell/sell';
 *   const html = renderSellPage({ productName: 'My App', ... });
 */

// ── Storefront schema ────────────────────────────────────────────────

export const STOREFRONT_VERSION = 1;

export interface StorefrontTheme {
  colors: {
    background: string;
    surface: string;
    ink: string;
    muted: string;
    accent: string;
    accentInk: string;
    line: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  radiusCard: string;
  radiusButton: string;
  maxWidth: string;
}

export interface StorefrontCta {
  label: string;
  action: { kind: 'purchase' | 'fork'; url?: string };
  variant?: 'primary' | 'ghost';
}

export interface StorefrontSection {
  id: string;
  type: 'hero' | 'features' | 'releases' | 'faq' | 'footer';
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  text?: string;
  ctas?: StorefrontCta[];
  items?: Array<Record<string, string>>;
  emptyMessage?: string;
  links?: Array<{ label: string; url: string }>;
}

export interface StorefrontDocument {
  schema: 'reposell-storefront';
  version: number;
  product: { name: string; description: string };
  theme: StorefrontTheme;
  sections: StorefrontSection[];
}

/** Default storefront theme — yellow accent, dark background. */
export const DEFAULT_THEME: StorefrontTheme = {
  colors: {
    background: '#0b0c10',
    surface: '#14161d',
    ink: '#e8eaf0',
    muted: '#9aa1b2',
    accent: '#f5d90a',
    accentInk: '#111111',
    line: '#262a35',
  },
  fonts: {
    heading: 'Syne, sans-serif',
    body: 'Outfit, sans-serif',
    mono: '"Geist Mono", monospace',
  },
  radiusCard: '14px',
  radiusButton: '10px',
  maxWidth: '920px',
};

/** Build a default storefront document for a product. */
export function buildStorefrontDocument(productName: string, description?: string): StorefrontDocument {
  return {
    schema: 'reposell-storefront',
    version: STOREFRONT_VERSION,
    product: {
      name: productName,
      description: description ?? 'Buy directly from the source repository.',
    },
    theme: DEFAULT_THEME,
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: productName,
        eyebrow: 'Direct sale',
        subtitle: 'One-time purchase · instant fork delivery · your repo, your keys.',
        ctas: [
          { label: 'Buy latest release', action: { kind: 'purchase' } },
          { label: 'View repository', action: { kind: 'fork' }, variant: 'ghost' },
        ],
      },
      {
        id: 'features',
        type: 'features',
        title: 'What you get',
        items: [
          { title: 'Source access', body: 'Fork the exact tagged release you purchased.', icon: '◆' },
          { title: 'Per-release licensing', body: 'Every release is an immutable commercial record.', icon: '◇' },
          { title: 'Verified payments', body: 'Stripe Payment Links validated against manifest pricing.', icon: '◈' },
        ],
      },
      {
        id: 'releases',
        type: 'releases',
        title: 'Releases',
        subtitle: 'Each release carries its own price and verified payment link.',
        emptyMessage: 'No releases are currently available for purchase.',
      },
      {
        id: 'faq',
        type: 'faq',
        title: 'Questions',
        items: [
          { question: 'How is it delivered?', answer: 'Instantly — you fork the signed release from the source repository.' },
          { question: 'What about updates?', answer: 'Each release is a separate purchase; new releases appear here as they publish.' },
        ],
      },
      {
        id: 'footer',
        type: 'footer',
        text: 'Powered by RepoSell — sell software from your own repository.',
        links: [],
      },
    ],
  };
}

// ── CSS ──────────────────────────────────────────────────────────────

export const STYLES_CSS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300..800&family=Syne:wght@400..800&family=Geist+Mono:wght@300..700&display=swap');
:root{
  --rs-bg:#0b0c10;
  --rs-surface:#14161d;
  --rs-ink:#e8eaf0;
  --rs-muted:#9aa1b2;
  --rs-accent:#f5d90a;
  --rs-accent-ink:#111111;
  --rs-line:#262a35;
  --rs-font-heading:Syne, sans-serif;
  --rs-font-body:Outfit, sans-serif;
  --rs-font-mono:"Geist Mono", monospace;
  --rs-radius-card:14px;
  --rs-radius-button:10px;
  --rs-max-width:920px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--rs-font-body);background:var(--rs-bg);color:var(--rs-ink);line-height:1.6;-webkit-font-smoothing:antialiased}
.rs-shell{width:min(var(--rs-max-width),92vw);margin:0 auto;padding:3rem 0 4rem}
.rs-section{padding:2rem 0}
.rs-eyebrow{display:inline-block;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--rs-accent);border:1px solid var(--rs-line);border-radius:999px;padding:.25rem .8rem;background:var(--rs-surface)}
.rs-title{font-family:var(--rs-font-heading);font-size:clamp(2rem,5vw,3.2rem);line-height:1.1;margin:.9rem 0 .5rem;letter-spacing:-.02em}
.rs-subtitle{color:var(--rs-muted);font-size:1.05rem;max-width:56ch}
.rs-ctas{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.4rem}
.rs-btn{display:inline-block;background:var(--rs-accent);color:var(--rs-accent-ink);font-weight:700;text-decoration:none;border-radius:var(--rs-radius-button);padding:.65rem 1.4rem;transition:transform .15s ease,box-shadow .15s ease}
.rs-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--rs-accent) 30%,transparent)}
.rs-btn--ghost{background:transparent;color:var(--rs-ink);border:1px solid var(--rs-line)}
.rs-btn--disabled{background:var(--rs-line);color:var(--rs-muted);pointer-events:none}
.rs-h2{font-family:var(--rs-font-heading);font-size:clamp(1.4rem,3vw,2rem);margin-bottom:1.2rem;letter-spacing:-.01em}
.rs-grid{display:grid;gap:1rem}
.rs-grid--features{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.rs-grid--releases{grid-template-columns:1fr}
.rs-card{background:var(--rs-surface);border:1px solid var(--rs-line);border-radius:var(--rs-radius-card);padding:1.3rem 1.4rem}
.rs-feature-title{font-size:1.02rem;font-weight:600;margin-bottom:.35rem}
.rs-feature-body{color:var(--rs-muted);font-size:.92rem}
.rs-release{display:flex;flex-direction:column;gap:.9rem}
.rs-release-head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem}
.rs-release-version{font-weight:600}
.rs-meta{color:var(--rs-muted);font-size:.85rem}
.rs-offers{display:grid;gap:.7rem}
.rs-offer{display:flex;align-items:center;justify-content:space-between;gap:1rem;border-top:1px solid var(--rs-line);padding-top:.7rem}
.rs-offer-name{font-weight:600;font-size:.98rem;display:block}
.rs-release-side{display:flex;align-items:center;gap:1rem;text-align:right}
.rs-price{font-weight:700;font-size:1.2rem;white-space:nowrap}
.rs-pill{font-size:.72rem;border-radius:999px;padding:.15rem .6rem;border:1px solid var(--rs-line)}
.rs-pill--bad{color:#f87171;border-color:#f8717155}
.rs-empty{color:var(--rs-muted)}
.rs-faq{display:grid;gap:.7rem}
.rs-faq-item summary{cursor:pointer;font-weight:600;list-style:none}
.rs-faq-item summary::-webkit-details-marker{display:none}
.rs-faq-item[open] summary{margin-bottom:.5rem;color:var(--rs-accent)}
.rs-faq-item p{color:var(--rs-muted);font-size:.95rem}
.rs-reveal{opacity:0;transform:translateY(10px);transition:opacity .45s ease,transform .45s ease}
.rs-reveal--in{opacity:1;transform:none}
footer.rs-footer{border-top:1px solid var(--rs-line);padding:1.6rem 0;color:var(--rs-muted);font-size:.88rem;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.rs-footer-links{display:flex;gap:1rem;flex-wrap:wrap}
.rs-footer-links a,.rs-footer a{color:var(--rs-accent)}
@media (max-width:640px){.rs-offer{flex-direction:column;align-items:flex-start}.rs-release-side{text-align:left}}
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto}
  .rs-reveal{opacity:1;transform:none;transition:none}
  .rs-btn{transition:none}
}`;

// ── JS ───────────────────────────────────────────────────────────────

export const SCRIPTS_JS = `(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.rs-card, .rs-hero');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('rs-reveal--in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('rs-reveal--in');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  targets.forEach((el) => { el.classList.add('rs-reveal'); observer.observe(el); });
})();`;

// ── HTML render ──────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export interface ReleaseOffer {
  scheme: string;
  name: string;
  billing: 'one-time' | 'recurring';
  interval?: string;
  seats?: number;
  price: number;
  currency: string;
  status: 'available' | 'blocked';
  paymentLink?: string;
}

export interface ReleaseEntry {
  version: string;
  status: 'available' | 'blocked';
  offers: ReleaseOffer[];
}

export interface SellPageOptions {
  productName: string;
  description?: string;
  repository?: string;
  releases?: ReleaseEntry[];
  /** If true, show the disabled buy CTA (no release yet). */
  awaitingRelease?: boolean;
  /** Seller's Stripe Payment Link (used when there's a single offer). */
  paymentLink?: string;
}

function money(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

/**
 * Render the full sell page HTML.
 *
 * This is the canonical renderer — the CLI's `pages.ts` and `sell.ts` should
 * converge on this function for consistent output.
 */
export function renderSellPage(options: SellPageOptions): string {
  const name = escapeHtml(options.productName);
  const desc = escapeHtml(options.description ?? 'Buy directly from the source repository.');
  const releases = options.releases ?? [];
  const available = releases.filter((r) => r.status === 'available');
  const blocked = releases.filter((r) => r.status !== 'available');

  // ── Hero section ──
  const heroCta = options.awaitingRelease === true
    ? `<span class="rs-btn rs-btn--disabled" data-rs-available="false">Buy latest release</span>`
    : `<a class="rs-btn" href="${escapeHtml(options.paymentLink ?? '#')}" rel="nofollow">Buy latest release</a>`;
  const heroNote = options.awaitingRelease === true
    ? `\n      <p class="rs-meta" style="margin-top:.8rem">Checkout activates when your first release is available — run <code style="color:var(--rs-accent)">reposell publish v0.1.0</code> and push.</p>`
    : '';

  // ── Releases section ──
  const releaseCards = available.map((release) => {
    const offerRows = release.offers
      .filter((o) => o.status === 'available' && o.paymentLink)
      .map((offer) => {
        const cadence = offer.billing === 'recurring'
          ? `per ${offer.interval ?? 'month'}`
          : 'one-time';
        const seats = offer.seats !== undefined ? ` · ${offer.seats} seats` : '';
        return `<div class="rs-offer" data-rs-offer="${escapeHtml(offer.scheme)}">
      <div><span class="rs-offer-name">${escapeHtml(offer.name)}</span><span class="rs-meta">${cadence}${seats}</span></div>
      <div class="rs-release-side"><span class="rs-price">${escapeHtml(money(offer.price, offer.currency))}</span><a class="rs-btn" href="${escapeHtml(offer.paymentLink ?? '#')}" rel="nofollow">Buy</a></div>
    </div>`;
      })
      .join('\n');

    return `<article class="rs-card rs-release" data-rs-release="${escapeHtml(release.version)}">
    <div class="rs-release-head"><span class="rs-release-version">Release ${escapeHtml(release.version)}</span><span class="rs-meta">instant fork delivery</span></div>
    <div class="rs-offers">
      ${offerRows || '<div class="rs-meta">no verified payment links</div>'}
    </div>
  </article>`;
  }).join('\n');

  const blockedCards = blocked.map((release) => {
    return `<article class="rs-card rs-release" data-rs-release="${escapeHtml(release.version)}">
    <div><div class="rs-release-version">Release ${escapeHtml(release.version)}</div><div class="rs-meta">not currently purchasable</div></div>
    <span class="rs-pill rs-pill--bad" data-rs-status>blocked</span>
  </article>`;
  }).join('\n');

  const releasesBody = (releaseCards || blockedCards)
    ? `\n<div class="rs-grid rs-grid--releases">\n${releaseCards}\n${blockedCards}\n</div>`
    : `\n<p class="rs-empty">No releases are currently available for purchase.</p>`;

  // ── Features section ──
  const features = [
    { icon: '◆', title: 'Source access', body: 'Fork the exact tagged release you purchased.' },
    { icon: '◇', title: 'Per-release licensing', body: 'Every release is an immutable commercial record.' },
    { icon: '◈', title: 'Verified payments', body: 'Stripe Payment Links validated against manifest pricing.' },
  ];
  const featureCards = features.map((f) => `  <article class="rs-card rs-feature" data-rs-item>
    <div class="rs-feature-icon" data-rs-field="icon">${f.icon}</div>
    <h3 class="rs-feature-title" data-rs-field="title">${f.title}</h3>
    <p class="rs-feature-body" data-rs-field="body">${f.body}</p>
  </article>`).join('\n');

  // ── FAQ section ──
  const faqItems = [
    { q: 'How is it delivered?', a: 'Instantly — you fork the signed release from the source repository.' },
    { q: 'What about updates?', a: 'Each release is a separate purchase; new releases appear here as they publish.' },
  ];
  const faqCards = faqItems.map((f) => `  <details class="rs-card rs-faq-item" data-rs-item>
    <summary data-rs-field="question">${f.q}</summary>
    <p data-rs-field="answer">${f.a}</p>
  </details>`).join('\n');

  // ── JSON-LD ──
  const jsonLdOffers = available.flatMap((release) =>
    release.offers
      .filter((o) => o.status === 'available' && o.paymentLink)
      .map((offer) => ({
        '@type': 'Offer',
        name: `${offer.name} — Release ${release.version}`,
        price: offer.price.toFixed(2),
        priceCurrency: offer.currency,
        availability: 'https://schema.org/InStock',
        url: offer.paymentLink,
      })),
  );

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.productName,
    description: options.description ?? 'Buy directly from the source repository.',
    ...(jsonLdOffers.length > 0 ? { offers: jsonLdOffers } : {}),
  });

  // ── Embedded data ──
  const embeddedData = JSON.stringify({
    schema: 'reposell/sell-page/v1',
    product: { name: options.productName, description: options.description ?? '' },
    ...(options.repository ? { repository: options.repository } : {}),
    releases,
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — Buy</title>
<meta name="description" content="Buy directly from the source repository.">
<script type="application/ld+json">${jsonLd}</script>
<link rel="stylesheet" href="./styles.css">
</head>
<body>
<main class="rs-shell">
<section class="rs-section rs-block-hero" data-rs-section-id="hero" data-rs-section-type="hero">
  <div class="rs-hero">
  <span class="rs-eyebrow" data-rs-field="eyebrow">Direct sale</span>
  <h1 class="rs-title" data-rs-field="title">${name}</h1>
  <p class="rs-subtitle" data-rs-field="subtitle">One-time purchase · instant fork delivery · your repo, your keys.</p>
  <div class="rs-ctas">
  ${heroCta}
  </div>${heroNote}
</div>
</section>
<section class="rs-section rs-block-features" data-rs-section-id="features" data-rs-section-type="features">
  <h2 class="rs-h2" data-rs-field="title">What you get</h2>
<div class="rs-grid rs-grid--features">
${featureCards}
</div>
</section>
<section class="rs-section rs-block-releases" data-rs-section-id="releases" data-rs-section-type="releases" data-rs-protected="true">
  <h2 class="rs-h2" data-rs-field="title">Releases</h2>
<p class="rs-subtitle" data-rs-field="subtitle">Each release carries its own price and verified payment link.</p>
${releasesBody}
</section>
<section class="rs-section rs-block-faq" data-rs-section-id="faq" data-rs-section-type="faq">
  <div class="rs-faq">
${faqCards}
</div>
</section>
<section class="rs-section rs-block-footer" data-rs-section-id="footer" data-rs-section-type="footer">
  <footer class="rs-footer">
  <p data-rs-field="text">Powered by RepoSell — sell software from your own repository.</p>
  <nav class="rs-footer-links">
  </nav>
</footer>
</section>
</main>
<script type="application/json" id="reposell-data">${embeddedData}</script>
<script src="./scripts.js" defer></script>
</body>
</html>
`;
}
