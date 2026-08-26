# @reposell/sell

Canonical sell page template for [RepoSell](https://github.com/EnzoVezzaro/reposell). Provides the HTML, CSS, JS, and storefront schema used by the CLI and other RepoSell products to generate consistent sell pages.

## Install

```bash
npm install @reposell/sell
```

## Usage

```ts
import {
  renderSellPage,
  buildStorefrontDocument,
  STYLES_CSS,
  SCRIPTS_JS,
  DEFAULT_THEME,
} from '@reposell/sell';

// Render a full sell page with release data
const html = renderSellPage({
  productName: 'My Project',
  description: 'Buy directly from the source.',
  repository: 'owner/repo',
  releases: [
    {
      version: 'v1.0.0',
      status: 'available',
      offers: [
        {
          scheme: 'standard',
          name: 'Standard License',
          billing: 'one-time',
          price: 29,
          currency: 'USD',
          status: 'available',
          paymentLink: 'https://buy.stripe.com/...',
        },
      ],
    },
  ],
});

// Generate a storefront.json document
const doc = buildStorefrontDocument('My Project', 'Description');

// Use raw CSS/JS for custom HTML
const css = STYLES_CSS;
const js = SCRIPTS_JS;
```

## Exports

| Export | Description |
|--------|-------------|
| `renderSellPage(options)` | Render the full sell page HTML |
| `buildStorefrontDocument(name, desc?)` | Generate a storefront.json document |
| `STYLES_CSS` | The canonical CSS stylesheet |
| `SCRIPTS_JS` | The reveal-on-scroll JS runtime |
| `DEFAULT_THEME` | Default theme colors, fonts, and radii |
| `STOREFRONT_VERSION` | Current storefront schema version |

## Standalone files

The package also ships the raw files for direct use:

- `styles.css` — the canonical stylesheet
- `scripts.js` — the reveal-on-scroll runtime
- `storefront.json` — default storefront config

```html
<link rel="stylesheet" href="node_modules/@reposell/sell/styles.css">
<script src="node_modules/@reposell/sell/scripts.js" defer></script>
```

## Development

```bash
npm run build    # compile TypeScript
npm test         # (no tests yet)
```

## License

MIT
