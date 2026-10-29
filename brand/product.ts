import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { num, orbit } from './geometry';

const [slug = '', accent = '', outDir = ''] = process.argv.slice(2);

if (slug === '' || !/^#[0-9a-fA-F]{6}$/u.test(accent) || outDir === '') {
  console.error('usage: bun brand/product.ts <slug> <#rrggbb> <out-dir>');
  process.exit(2);
}

const INK = '#141416';
const TEXT = '#ececee';
const shape = orbit();
const at = shape.d.lastIndexOf('M');
const ringPath = shape.d.slice(0, at).trim();
const dotPath = shape.d.slice(at);

const tile = (share: number, corner: number) => {
  const size = 512;
  const scale = (size * share) / Math.max(shape.width, shape.height);
  const x = (size - shape.width * scale) / 2;
  const y = (size - shape.height * scale) / 2;
  const rect = corner > 0 ? `<rect width="512" height="512" rx="${num(512 * corner)}" fill="${INK}"/>` : `<rect width="512" height="512" fill="${INK}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${slug}">${rect}<g transform="translate(${num(x)} ${num(y)}) scale(${num(scale)})"><path fill="${TEXT}" d="${ringPath}"/><path fill="${accent}" d="${dotPath}"/></g></svg>\n`;
};

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(shape.width)} ${num(shape.height)}" role="img" aria-label="${slug}"><path fill="${accent}" d="${ringPath}"/><path fill="${accent}" d="${dotPath}"/></svg>\n`;

mkdirSync(outDir, { recursive: true });
const icon = tile(0.62, 0.22);
const maskable = tile(0.48, 0);
writeFileSync(join(outDir, 'icon.svg'), icon);
writeFileSync(join(outDir, 'favicon.svg'), favicon);

const render = (svg: string, size: number, name: string) =>
  sharp(Buffer.from(svg), { density: (72 * size * 4) / 512 }).resize(size, size).png({ compressionLevel: 9 }).toFile(join(outDir, name));

await render(icon, 512, 'icon-512.png');
await render(icon, 192, 'icon-192.png');
await render(icon, 180, 'apple-touch-icon.png');
await render(maskable, 512, 'maskable-512.png');
await render(maskable, 192, 'maskable-192.png');
console.log(`${slug}: icons in ${outDir}`);
