import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Spike = { n: number; name: string; line: string; url: string; repo: string; verdict: string; evidence: string; shipped: string };

const root = import.meta.dir;
const out = join(root, "public");
const spikes: Spike[] = JSON.parse(readFileSync(join(root, "spikes.json"), "utf8"));
const site = ["https:", "", "customer0.dev"].join("/");

const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const item = (spike: Spike) => `<li>
<h2><span class="n">${String(spike.n).padStart(2, "0")}</span><a href="${escape(spike.url)}">${escape(spike.name)}</a></h2>
<p>${escape(spike.line)}</p>
<p><span class="verdict ${escape(spike.verdict)}">${escape(spike.verdict)}</span> ${escape(spike.evidence)}</p>
<p class="links"><a href="${escape(spike.repo)}">source</a> · <a href="${escape(spike.url)}/llms.txt">llms.txt</a> · ${escape(spike.shipped)}</p>
</li>`;

const FONTS = "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,300..700&family=Google+Sans+Code:wght@400;500&display=swap";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>customer0 · spikes</title>
<meta name="description" content="Small public experiments on Cloudflare. Each one ships with a frozen eval and says plainly whether it worked.">
<link rel="canonical" href="${site}/">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/json" href="/spikes.json">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/brand/png/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/brand/png/apple-touch-icon.png">
<meta name="theme-color" content="#141416" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta property="og:title" content="customer0">
<meta property="og:description" content="Small public experiments on Cloudflare. Each one says if it worked.">
<meta property="og:image" content="${site}/brand/social.png">
<meta property="og:url" content="${site}/">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
:root{--bg:#fff;--raise:#f4f4f2;--line:#ebebe8;--text:#18181b;--dim:#6b6b70;--faint:#a1a1a6;--accent:#F38020;
--sans:"Google Sans Flex","Google Sans",system-ui,sans-serif;--mono:"Google Sans Code",ui-monospace,monospace}
@media (prefers-color-scheme:dark){:root{--bg:#141416;--raise:#1f1f23;--line:#26262b;--text:#ececee;--dim:#9b9ba3;--faint:#62626a}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:400 15px/1.6 var(--sans);-webkit-font-smoothing:antialiased}
.wrap{max-width:44rem;margin:0 auto;padding:max(2.5rem,env(safe-area-inset-top)) 1.25rem 4rem}
header{display:flex;align-items:center;gap:.75rem;padding-bottom:2rem;border-bottom:1px solid var(--line)}
header img{width:40px;height:40px}
header h1{font-size:1.25rem;font-weight:600;letter-spacing:-.01em;margin:0}
header p{margin:0;color:var(--dim);font-size:.9rem}
.mark-light{display:none}@media (prefers-color-scheme:light){.mark-dark{display:none}.mark-light{display:block}}
ol{list-style:none;padding:0;margin:0}
li{padding:1.5rem 0;border-bottom:1px solid var(--line)}
li h2{font-size:1rem;font-weight:600;margin:0 0 .25rem}
li h2 a{color:var(--text);text-decoration:none}li h2 a:hover{text-decoration:underline}
li p{margin:.25rem 0;color:var(--dim)}
.n{font:400 .8rem var(--mono);color:var(--faint);margin-right:.5rem}
.verdict{display:inline-block;font:500 .75rem var(--mono);padding:.1rem .45rem;border-radius:999px;border:1px solid var(--line);color:var(--text)}
.verdict.disproven{border-color:#c42b1c55;color:#e5564a}.verdict.proven{border-color:#1a7f4b55;color:#2ea56b}
.links{font:400 .8rem var(--mono)}.links a{color:var(--dim)}
footer{padding-top:2rem;font:400 .8rem var(--mono);color:var(--faint)}footer a{color:var(--dim)}
a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
</style>
</head>
<body>
<div class="wrap">
<header>
<img class="mark-dark" src="/brand/mark-dark.svg" alt="">
<img class="mark-light" src="/brand/mark.svg" alt="">
<div><h1>customer0</h1><p>Small public experiments on Cloudflare. Each one says plainly whether it worked.</p></div>
</header>
<ol>
${spikes.map(item).join("\n")}
</ol>
<footer><a href="/spikes.json">spikes.json</a> · <a href="/llms.txt">llms.txt</a> · <a href="/brand/">brand</a></footer>
</div>
<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js")</script>
</body>
</html>
`;

const llms = `# customer0

> Index of customer0 spikes. Each spike has its own site, source, llms.txt and eval verdict.

## Spikes

${spikes.map((spike) => `- [${spike.name}](${spike.url}/llms.txt): ${spike.line} Verdict: ${spike.verdict}.`).join("\n")}

## Data

- [spikes.json](${site}/spikes.json)
`;

const manifest = {
  name: "customer0 spikes",
  short_name: "customer0",
  start_url: "/",
  display: "standalone",
  description: "Small public experiments on Cloudflare. Each one says if it worked.",
  background_color: "#141416",
  theme_color: "#141416",
  icons: [
    { src: "/brand/png/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/brand/png/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/brand/png/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: "/brand/png/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    { src: "/brand/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
  ],
};


const files = { "index.html": html, "llms.txt": llms, "spikes.json": `${JSON.stringify(spikes, null, 1)}\n`, "manifest.webmanifest": `${JSON.stringify(manifest, null, 1)}\n` };
const version = createHash("sha256").update(Object.values(files).join("")).digest("hex").slice(0, 12);

const worker = `const CACHE = "c0-${version}";
const FILES = ["/", "/llms.txt", "/spikes.json", "/manifest.webmanifest", "/brand/mark.svg", "/brand/mark-dark.svg", "/brand/favicon.svg", "/brand/png/icon-192.png"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then((hit) => hit ?? caches.match("/"))));
});
`;

mkdirSync(out, { recursive: true });
for (const [name, body] of Object.entries({ ...files, "sw.js": worker })) writeFileSync(join(out, name), body);
console.log(`built ${spikes.length} spikes, cache ${version}`);
