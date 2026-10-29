#!/usr/bin/env node
/**
 * Render the IMMCA mark (three routes converging on one station) into the
 * favicon and the app icons in public/. Run after changing the mark:
 *   node scripts/build-icons.mjs        (needs Playwright)
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const NAVY = '#0e1c38';

/** The mark on a navy tile, scaled by `k` around the centre (smaller k = more padding). */
const tile = (k, radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" rx="${radius}" fill="${NAVY}"/>
<g transform="translate(16 16) scale(${k}) translate(-14.75 -16)">
<g fill="none" stroke-linecap="round" stroke-width="3.6">
<path d="M4 7.5H9.5C14.5 7.5 15.5 16 21 16" stroke="#FF5A4E"/>
<path d="M4 24.5H9.5C14.5 24.5 15.5 16 21 16" stroke="#FF9A3D"/>
<path d="M4 16H21" stroke="#6E9BFF"/>
</g>
<circle cx="25" cy="16" r="5" fill="#fff"/><circle cx="25" cy="16" r="2" fill="${NAVY}"/>
</g></svg>`;

writeFileSync(join(PUBLIC, 'favicon.svg'), tile(0.8, 8).replace(/\n/g, ''));

async function loadPlaywright() {
  try { return await import('playwright'); } catch {
    return createRequire(process.env.PLAYWRIGHT_PATH ?? join(ROOT, 'package.json'))('playwright');
  }
}
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage();
const render = async (file, size, svg) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: join(PUBLIC, file), omitBackground: true });
};
// "any" icons keep rounded corners; maskable and Apple icons are full-bleed squares that the OS rounds.
await render('icon-192.png', 192, tile(0.72, 7));
await render('icon-512.png', 512, tile(0.72, 7));
await render('icon-maskable-512.png', 512, tile(0.56, 0));
await render('apple-touch-icon.png', 180, tile(0.66, 0));
await browser.close();
console.log('icons written to public/');
