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
<p><b>${spike.n}. <a href="${escape(spike.url)}">${escape(spike.name)}</a></b> — ${escape(spike.line)}</p>
<p>Verdict: <b>${escape(spike.verdict)}</b>. ${escape(spike.evidence)}</p>
<p><a href="${escape(spike.repo)}">source</a> · <a href="${escape(spike.url)}/llms.txt">llms.txt</a> · ${escape(spike.shipped)}</p>
</li>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>customer0 · spikes</title>
<meta name="description" content="Index of customer0 spikes: small public experiments, each with a frozen eval and an honest verdict.">
<link rel="canonical" href="${site}/">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/json" href="/spikes.json">
<meta name="theme-color" content="#ffffff">
<style>
body{max-width:40rem;margin:2rem auto;padding:0 1rem;font:16px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;color:#111;background:#fff}
a{color:#111}h1{font-size:1rem}ol{list-style:none;padding:0}li{margin:0 0 1.5rem}p{margin:.25rem 0}
@media (prefers-color-scheme:dark){body{color:#eee;background:#111}a{color:#eee}}
</style>
</head>
<body>
<h1>customer0 · spikes</h1>
<p>Small public experiments. Each one ships with a frozen eval and says plainly whether it worked.</p>
<ol>
${spikes.map(item).join("\n")}
</ol>
<p><a href="/spikes.json">spikes.json</a> · <a href="/llms.txt">llms.txt</a></p>
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
  background_color: "#ffffff",
  theme_color: "#ffffff",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
};

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111"/><text x="32" y="42" font-family="monospace" font-size="30" fill="#fff" text-anchor="middle">c0</text></svg>
`;

const files = { "index.html": html, "llms.txt": llms, "spikes.json": `${JSON.stringify(spikes, null, 1)}\n`, "manifest.webmanifest": `${JSON.stringify(manifest, null, 1)}\n`, "icon.svg": icon };
const version = createHash("sha256").update(Object.values(files).join("")).digest("hex").slice(0, 12);

const worker = `const CACHE = "c0-${version}";
const FILES = ["/", "/llms.txt", "/spikes.json", "/manifest.webmanifest", "/icon.svg"];
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
