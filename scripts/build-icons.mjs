#!/usr/bin/env node
/**
 * Render the IMMCA mark (a forward arrow on a blue tile) into the
 * favicon and the app icons in public/. Run after changing the mark:
 *   node scripts/build-icons.mjs        (needs Playwright)
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'public');

/** The mark: a forward arrow on a blue tile, scaled by `k` around the centre (smaller k = more padding). */
const BLUE = '#0B57D0';
const tile = (k, radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" rx="${radius}" fill="${BLUE}"/>
<g transform="translate(16 16) scale(${k}) translate(-16 -16)">
<path d="M11 21 21 11M13.5 11H21v7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</g></svg>`;

writeFileSync(join(PUBLIC, 'favicon.svg'), tile(1, 9).replace(/\n/g, ''));

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
await render('icon-192.png', 192, tile(1.1, 7));
await render('icon-512.png', 512, tile(1.1, 7));
await render('icon-maskable-512.png', 512, tile(0.85, 0));
await render('apple-touch-icon.png', 180, tile(1, 0));
await browser.close();
console.log('icons written to public/');
