# BuildspaceLabs — Product Landing Pages

A set of standalone, hand-built marketing landing pages for products in the portfolio. Each page is a self-contained SaaS product site — plain HTML, CSS and vanilla JavaScript, no build step, no framework.

Every landing page is deliberately its **own** design world (palette, type, layout, motion) so the set reads as a range of work, not one template recoloured. Each page is fully SEO-optimised and credits **[BuildspaceLabs](https://buildspacelabs.com)** as the studio that designed and engineered the product.

## Pages

| Product | Industry | Design direction | Folder |
| --- | --- | --- | --- |
| **AP Copilot** | Fintech / finance ops | Precision-light (Ramp/Mercury) | [`/ap-copilot`](./ap-copilot/) |
| **Charge Pulse** | EV / energy / mobility | Dark-electric, kinetic | [`/charge-pulse`](./charge-pulse/) |
| **Brief Forge** | Legal tech | Editorial, warm serif | [`/brief-forge`](./brief-forge/) |

Each folder contains:

```
<product>/
  index.html      # the landing page
  styles.css      # all styles
  script.js       # scroll reveals, count-ups, interactions (vanilla JS)
  contact.html    # dedicated contact page (shares styles.css)
  assets/         # real product screenshots
```

## Preview locally

No server required — open any `index.html` in a browser. For a clean local server (nicer for testing routes and Open Graph):

```bash
cd buildspace-landings
python3 -m http.server 8080
# then open http://localhost:8080/ap-copilot/
```

## Deploy (GitHub Pages)

The pages are written to be served as static files under a common base path. Canonical URLs and sitemap assume:

```
https://buildpacelabs.github.io/buildspace-landings/<product>/
```

Enable **Settings → Pages → Deploy from branch → `main` / root**. To serve from a custom domain (e.g. a `buildspacelabs.com` subpath or subdomain), search-and-replace that base URL in each page's `<link rel="canonical">`, Open Graph tags, and `sitemap.xml`.

## Contact form

The contact forms have no backend. On submit they open a pre-filled email to **hello@buildspacelabs.com** (a `mailto:` fallback) and link through to the full funnel at [buildspacelabs.com/contact](https://buildspacelabs.com/contact). Swapping in a hosted form endpoint (Formspree, or the BuildspaceLabs contact API) is a one-line change in each `script.js` — see the comment there. Ensure the `hello@buildspacelabs.com` alias exists before publishing.

## SEO

Every page ships: a keyword-rich `<title>` and meta description, canonical URL, Open Graph + Twitter Card tags (product screenshot as the share image), `SoftwareApplication` JSON-LD crediting BuildspaceLabs, semantic landmarks, descriptive alt text, and a shared `robots.txt` + `sitemap.xml` at the repo root.

---

Designed & engineered by [BuildspaceLabs](https://buildspacelabs.com).
