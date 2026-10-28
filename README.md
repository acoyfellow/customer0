# customer0

Text-only index of spikes at [customer0.dev](https://customer0.dev). Installable as a PWA, works offline.

Add a spike: append it to `spikes.json`, then:

```sh
bun build.ts
npx wrangler deploy
```

Output: `index.html`, `llms.txt`, `spikes.json`, `manifest.webmanifest`, `sw.js`, `icon.svg` in `public/`.
