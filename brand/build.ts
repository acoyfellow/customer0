import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { num, orbit, pair, notch, type Shape, UNIT } from './geometry';
import { page } from './page';

export const COLOR = {
  ink: '#141416',
  paper: '#ffffff',
  accent: '#F38020',
  text: '#ececee',
  inkText: '#18181b',
} as const;

const out = join(import.meta.dir, '..', 'public', 'brand');
mkdirSync(join(out, 'png'), { recursive: true });

const svg = (width: number, height: number, body: string, label: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(width)} ${num(height)}" role="img" aria-label="${label}">${body}</svg>\n`;

const markSvg = (shape: Shape, fill: string, label: string) =>
  svg(shape.width, shape.height, `<path fill="${fill}" fill-rule="evenodd" d="${shape.d}"/>`, label);

const orbitTwoTone = (ring: string, satellite: string) => {
  const shape = orbit();
  const [ringPath, dotPath] = splitOrbit(shape.d);

  return svg(
    shape.width,
    shape.height,
    `<path fill="${ring}" d="${ringPath}"/><path fill="${satellite}" d="${dotPath}"/>`,
    'customer0',
  );
};

const splitOrbit = (d: string): readonly [string, string] => {
  const at = d.lastIndexOf('M');

  return [d.slice(0, at).trim(), d.slice(at)];
};

const tile = (shape: Shape, share: number, corner: number, background: string, ring: string, satellite: string) => {
  const size = 512;
  const scale = (size * share) / Math.max(shape.width, shape.height);
  const x = (size - shape.width * scale) / 2;
  const y = (size - shape.height * scale) / 2;
  const [ringPath, dotPath] = splitOrbit(shape.d);
  const rect =
    corner > 0
      ? `<rect width="${size}" height="${size}" rx="${num(size * corner)}" fill="${background}"/>`
      : `<rect width="${size}" height="${size}" fill="${background}"/>`;
  const transform = `translate(${num(x)} ${num(y)}) scale(${num(scale)})`;

  return svg(
    size,
    size,
    `${rect}<g transform="${transform}"><path fill="${ring}" d="${ringPath}"/><path fill="${satellite}" d="${dotPath}"/></g>`,
    'customer0',
  );
};

const wordmark = (ring: string, satellite: string, text: string) => {
  const shape = orbit();
  const [ringPath, dotPath] = splitOrbit(shape.d);
  const gap = UNIT.stroke * 1.5;
  const size = shape.height * 0.62;
  const width = shape.width + gap + size * 5.6;

  return svg(
    width,
    shape.height,
    `<path fill="${ring}" d="${ringPath}"/><path fill="${satellite}" d="${dotPath}"/>` +
      `<text x="${num(shape.width + gap)}" y="${num(shape.height / 2 + size * 0.36)}" fill="${text}" font-family="Google Sans Flex, Google Sans, system-ui, sans-serif" font-size="${num(size)}" font-weight="500" letter-spacing="-1">customer0</text>`,
    'customer0',
  );
};

const social = () => {
  const width = 1200;
  const height = 630;
  const shape = orbit();
  const [ringPath, dotPath] = splitOrbit(shape.d);
  const scale = 220 / shape.height;

  return svg(
    width,
    height,
    `<rect width="${width}" height="${height}" fill="${COLOR.ink}"/>` +
      `<g transform="translate(${num(96)} ${num(150)}) scale(${num(scale)})"><path fill="${COLOR.text}" d="${ringPath}"/><path fill="${COLOR.accent}" d="${dotPath}"/></g>` +
      `<text x="96" y="470" fill="${COLOR.text}" font-family="Google Sans Flex, Google Sans, system-ui, sans-serif" font-size="64" font-weight="600" letter-spacing="-1.5">customer0</text>` +
      `<text x="96" y="524" fill="#9b9ba3" font-family="Google Sans Flex, Google Sans, system-ui, sans-serif" font-size="30">Small public experiments on Cloudflare. Each one says if it worked.</text>`,
    'customer0',
  );
};

const files: Record<string, string> = {
  'mark.svg': orbitTwoTone(COLOR.inkText, COLOR.accent),
  'mark-dark.svg': orbitTwoTone(COLOR.text, COLOR.accent),
  'mark-mono.svg': markSvg(orbit(), 'currentColor', 'customer0'),
  'wordmark-light.svg': wordmark(COLOR.inkText, COLOR.accent, COLOR.inkText),
  'wordmark-dark.svg': wordmark(COLOR.text, COLOR.accent, COLOR.text),
  'icon.svg': tile(orbit(), 0.62, 0.22, COLOR.ink, COLOR.text, COLOR.accent),
  'icon-light.svg': tile(orbit(), 0.62, 0.22, COLOR.paper, COLOR.inkText, COLOR.accent),
  'icon-maskable.svg': tile(orbit(), 0.48, 0, COLOR.ink, COLOR.text, COLOR.accent),
  'icon-apple.svg': tile(orbit(), 0.6, 0, COLOR.ink, COLOR.text, COLOR.accent),
  'favicon.svg': tile(orbit(), 0.9, 0, 'none', COLOR.accent, COLOR.accent).replace('<rect width="512" height="512" fill="none"/>', ''),
  'social.svg': social(),
  'alt-pair.svg': markSvg(pair(), COLOR.accent, 'customer0 alternative: c and 0'),
  'alt-notch.svg': markSvg(notch(), COLOR.accent, 'customer0 alternative: notched zero'),
  'alt-orbit.svg': orbitTwoTone(COLOR.text, COLOR.accent),
};

for (const [name, text] of Object.entries(files)) writeFileSync(join(out, name), text);

const RASTERS: readonly (readonly [string, string, number])[] = [
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  ['icon-maskable.svg', 'maskable-192.png', 192],
  ['icon-maskable.svg', 'maskable-512.png', 512],
  ['icon-apple.svg', 'apple-touch-icon.png', 180],
  ['favicon.svg', 'favicon-32.png', 32],
  ['favicon.svg', 'favicon-16.png', 16],
];

for (const [source, target, size] of RASTERS)
  await sharp(Buffer.from(files[source] ?? ''), { density: (72 * size * 4) / 512 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(out, 'png', target));

await sharp(Buffer.from(files['social.svg'] ?? ''), { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(join(out, 'social.png'));

writeFileSync(join(out, 'index.html'), page(Object.keys(files)));
writeFileSync(
  join(out, 'tokens.json'),
  `${JSON.stringify(
    {
      family: 'customer0',
      geometry: { radius: UNIT.radius, stroke: UNIT.stroke, ends: 'round' },
      color: { ...COLOR, productAccentOverrides: 'each product sets accent; ink and paper stay' },
      font: {
        sans: 'Google Sans Flex',
        mono: 'Google Sans Code',
        load: 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,300..700&family=Google+Sans+Code:wght@400;500&display=swap',
      },
    },
    null,
    2,
  )}\n`,
);

console.log(`brand: ${Object.keys(files).length} SVGs, ${RASTERS.length} PNGs, social card, page`);
