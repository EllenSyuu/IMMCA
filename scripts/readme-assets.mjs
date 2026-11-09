#!/usr/bin/env node
/**
 * Regenerate every image in the README from the real app:
 *   docs/brand/cover-light.png, cover-dark.png   cover (also the GitHub social preview)
 *   docs/images/showcase.png                     desktop + phone composite
 *   docs/images/anatomy-{en,zh,fr}.png           annotated results page
 *   docs/images/demo.gif                         short walkthrough
 *
 *   npm run build && npx vite preview --port 4174 &
 *   node scripts/readme-assets.mjs [http://localhost:4174/]
 *
 * Needs Playwright (`npm i -D playwright`) and ffmpeg. If Google Fonts is not
 * reachable, set FONT_DIR to a folder with @fontsource/figtree and
 * @fontsource/noto-sans-sc installed and fonts are served from there instead.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = process.argv[2] ?? 'http://localhost:4174/';
const BRAND = join(ROOT, 'docs/brand');
const IMAGES = join(ROOT, 'docs/images');
const TMP = join(ROOT, 'node_modules/.tmp/readme-assets');
for (const d of [BRAND, IMAGES, TMP]) mkdirSync(d, { recursive: true });

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const require = createRequire(process.env.PLAYWRIGHT_PATH ?? join(ROOT, 'package.json'));
    return require('playwright');
  }
}
const { chromium } = await loadPlaywright();

// ---------------------------------------------------------------- fonts
const FONT_DIR = process.env.FONT_DIR;
function fontCss() {
  const css = [];
  const add = (pkg, weights) => {
    for (const w of weights) {
      const file = join(FONT_DIR, 'node_modules/@fontsource', pkg, `${w}.css`);
      css.push(readFileSync(file, 'utf8').replace(/url\(\.\/files\//g, `url(https://fonts.gstatic.com/local/${pkg}/`));
    }
  };
  add('figtree', [400, 500, 600, 700]);
  add('noto-sans-sc', [400, 500, 700]);
  return css.join('\n').replace(/font-family: '([^']+)'/g, (_, f) => `font-family: '${f === 'Figtree' ? 'Figtree' : 'Noto Sans SC'}'`);
}
async function routeFonts(ctx) {
  if (!FONT_DIR) return;
  const css = fontCss();
  await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
  await ctx.route('https://fonts.gstatic.com/local/**', (r) => {
    const [, pkg, file] = new URL(r.request().url()).pathname.match(/\/local\/([^/]+)\/(.+)$/);
    r.fulfill({ contentType: 'font/woff2', body: readFileSync(join(FONT_DIR, 'node_modules/@fontsource', pkg, 'files', file)) });
  });
}

const browser = await chromium.launch();
async function context(opts = {}) {
  const ctx = await browser.newContext({ deviceScaleFactor: 2, ...opts });
  await routeFonts(ctx);
  return ctx;
}
async function appPage(ctx, locale, width = 1440, height = 900) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width, height });
  await page.addInitScript((l) => {
    localStorage.clear();
    localStorage.setItem('immca.locale', l);
  }, locale);
  await page.goto(SITE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.topbar{background:#fff!important}' });
  await page.waitForTimeout(600);
  return page;
}
const html = (body, extraCss = '') => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap">
<style>*{box-sizing:border-box}html,body{margin:0}body{font-family:'Figtree','Noto Sans SC',system-ui,sans-serif;-webkit-font-smoothing:antialiased}${extraCss}</style>
</head><body>${body}</body></html>`;
const b64 = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
const MARK = (size) => `<svg viewBox="0 0 32 32" width="${size}" height="${size}"><rect width="32" height="32" rx="9" fill="#0B57D0"/><path d="M11 21 21 11M13.5 11H21v7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------------------------------------------------------------- 1. cover
{
  // The product itself is the picture: the "Where to focus" card from the real app.
  const ctx = await context();
  const app = await appPage(ctx, 'en', 1280, 900);
  const focusShot = join(TMP, 'focus.png');
  await app.locator('.decision').screenshot({ path: focusShot });
  const cover = (dark) => {
    const c = dark
      ? { bg: '#131314', ink: '#e3e3e3', sub: '#c4c7c5', chip: '#2a2a2c', chipInk: '#e3e3e3', card: '0 0 0 1px #3c4043' }
      : { bg: '#f8fafd', ink: '#1f1f1f', sub: '#444746', chip: '#ffffff', chipInk: '#1f1f1f', card: '0 1px 3px rgba(60,64,67,.16), 0 12px 32px rgba(60,64,67,.14)' };
    return html(`
    <div class="cover">
      <div class="text">
        <div class="brand">${MARK(52)}<span class="name">IMMCA</span></div>
        <h1>Find the routes to Canadian permanent residence that are open to you.</h1>
        <p>57 federal, Québec and provincial programs, checked every day against official sources. Free, open source and private.</p>
        <div class="chips"><span>English</span><span>Français</span><span>中文</span></div>
      </div>
      <div class="shot"><img src="${b64(focusShot)}"></div>
    </div>`, `
    .cover{width:1280px;height:640px;background:${c.bg};display:grid;grid-template-columns:590px 1fr;align-items:center;gap:56px;padding:0 0 0 80px;overflow:hidden}
    .brand{display:flex;align-items:center;gap:14px;margin-bottom:30px}
    .name{font-size:34px;font-weight:700;letter-spacing:.01em;color:${c.ink}}
    h1{font-size:48px;line-height:1.1;letter-spacing:-.03em;font-weight:600;color:${c.ink};margin:0 0 20px}
    p{font-size:20px;line-height:1.5;color:${c.sub};margin:0 0 26px}
    .chips{display:flex;gap:10px}.chips span{background:${c.chip};color:${c.chipInk};border-radius:999px;padding:7px 16px;font-size:16px;font-weight:500;box-shadow:0 0 0 1px ${dark ? '#3c4043' : '#e1e3e6'}}
    .shot{align-self:center}
    .shot img{display:block;width:640px;border-radius:20px;box-shadow:${c.card}}`);
  };
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 640 });
  for (const dark of [false, true]) {
    await page.setContent(cover(dark), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(BRAND, `cover-${dark ? 'dark' : 'light'}.png`), clip: { x: 0, y: 0, width: 1280, height: 640 } });
  }
  await ctx.close();
  console.log('cover ✓');
}

// ---------------------------------------------------------------- 2. showcase
{
  const ctx = await context();
  const desk = await appPage(ctx, 'en', 1360, 860);
  const deskShot = join(TMP, 'desk.png');
  await desk.screenshot({ path: deskShot });

  const phone = await appPage(ctx, 'zh', 390, 844);
  await phone.evaluate(() => window.scrollTo(0, document.querySelector('#results').getBoundingClientRect().top + window.scrollY - 64 - 8));
  await phone.waitForTimeout(300);
  const phoneShot = join(TMP, 'phone.png');
  await phone.screenshot({ path: phoneShot });

  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.setContent(html(`
    <div class="stage">
      <div class="window">
        <div class="bar"><i></i><i></i><i></i><span>ellensyuu.github.io/IMMCA</span></div>
        <img src="${b64(deskShot)}">
      </div>
      <div class="phone"><img src="${b64(phoneShot)}"></div>
    </div>`, `
    .stage{position:relative;width:1600px;height:1000px;background:#f0f4f9;overflow:hidden}
    .window{position:absolute;left:70px;top:64px;width:1180px;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(60,64,67,.16),0 24px 64px rgba(60,64,67,.16)}
    .bar{height:42px;background:#f8fafd;border-bottom:1px solid #e1e3e6;display:flex;align-items:center;gap:8px;padding:0 16px}
    .bar i{width:12px;height:12px;border-radius:50%;background:#dadce0}
    .bar span{margin-left:18px;background:#fff;border-radius:999px;padding:4px 16px;font-size:14px;color:#5f6368;box-shadow:0 0 0 1px #e1e3e6}
    .window img{display:block;width:100%}
    .phone{position:absolute;right:90px;top:170px;width:330px;border-radius:48px;padding:10px;background:#1f1f1f;box-shadow:0 30px 80px rgba(60,64,67,.32)}
    .phone img{display:block;width:100%;border-radius:39px}`), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(IMAGES, 'showcase.png'), clip: { x: 0, y: 0, width: 1600, height: 1000 } });
  await ctx.close();
  console.log('showcase ✓');
}

// ---------------------------------------------------------------- 3. anatomy
// Numbered markers on the real results page; the numbered list in the README explains them.
for (const locale of ['en', 'zh', 'fr']) {
  const ctx = await context();
  const page = await appPage(ctx, locale, 1280, 900);
  await page.addStyleTag({ content: '.topbar{position:static!important}.results-aside{position:static!important;max-height:none!important;overflow:visible!important}' });
  await page.locator('.route__head').first().click();
  await page.waitForTimeout(300);
  const box = await page.evaluate(() => {
    const r = (sel) => document.querySelector(sel).getBoundingClientRect();
    const targets = [r('.decision'), r('.results-aside .scenarios'), r('.results-aside .score'), r('.route'), r('.route__checks .checklist')];
    const layout = r('.results-layout');
    const layer = document.createElement('div');
    layer.style.cssText = `position:absolute;left:0;top:0;width:100%;height:${document.body.scrollHeight}px;pointer-events:none;z-index:50`;
    targets.forEach((t, i) => {
      const pin = document.createElement('div');
      pin.textContent = String(i + 1);
      pin.style.cssText = `position:absolute;left:${t.left - 14}px;top:${t.top + window.scrollY - 14}px;width:30px;height:30px;border-radius:50%;background:#0B57D0;color:#fff;font:700 15px 'Figtree',sans-serif;display:grid;place-items:center;box-shadow:0 0 0 4px #fff,0 2px 6px rgba(60,64,67,.3)`;
      layer.append(pin);
    });
    document.body.append(layer);
    const top = r('.results__head').top + window.scrollY - 24;
    const bottom = Math.max(targets[4].bottom, r('.results-aside .scenarios').bottom) + window.scrollY + 24;
    return { x: layout.left + 8, y: top, width: layout.width - 16, height: bottom - top };
  });
  await page.screenshot({ path: join(IMAGES, `anatomy-${locale}.png`), fullPage: true, clip: box });
  await ctx.close();
  console.log(`anatomy ${locale} ✓`);
}

// ---------------------------------------------------------------- 4. demo gif
{
  const videoDir = join(TMP, 'video');
  rmSync(videoDir, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } } });
  await routeFonts(ctx);
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('immca.locale', 'en');
    // A visible cursor, since recordings don't show the system pointer.
    addEventListener('DOMContentLoaded', () => {
      const c = document.createElement('div');
      c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;border-radius:50%;background:rgba(11,87,208,.2);border:2px solid #0B57D0;z-index:99999;pointer-events:none;transform:translate(-50%,-50%);transition:width .12s,height .12s';
      document.body.append(c);
      addEventListener('mousemove', (e) => { c.style.left = `${e.clientX}px`; c.style.top = `${e.clientY}px`; });
      addEventListener('mousedown', () => { c.style.width = '14px'; c.style.height = '14px'; });
      addEventListener('mouseup', () => { c.style.width = '22px'; c.style.height = '22px'; });
    });
  });
  const start = Date.now();
  await page.goto(SITE, { waitUntil: 'networkidle' });
  await page.mouse.move(640, 400);
  await page.waitForTimeout(2600);
  const glide = async (locator) => {
    await locator.scrollIntoViewIfNeeded();
    const b = await locator.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 18 });
    await page.waitForTimeout(250);
  };
  const click = async (locator, pause = 1400) => {
    await glide(locator);
    await page.mouse.down();
    await page.mouse.up();
    await locator.click();
    await page.waitForTimeout(pause);
  };
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('.planner').getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }));
  await page.waitForTimeout(1200);
  await click(page.locator('.choice', { hasText: 'NCLC 7' }), 900);
  await click(page.locator('.choice', { hasText: '2 years' }), 900);
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('#results').getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' }));
  await page.waitForTimeout(1800);
  await click(page.locator('.lead__route'), 1800);
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(900);
  await click(page.locator('.langs button').nth(2), 1600);
  await click(page.locator('.langs button').nth(1), 1600);
  await click(page.locator('.langs button').nth(0), 600);
  await click(page.locator('.topbar__link'), 2400);
  const durationS = (Date.now() - start) / 1000;
  await ctx.close();
  const webm = join(videoDir, readdirSync(videoDir).find((f) => f.endsWith('.webm')));
  const palette = join(TMP, 'palette.png');
  const skip = 1.2; // the blank frames before the first paint
  const filters = 'fps=8,scale=820:-1:flags=lanczos';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(skip), '-i', webm, '-vf', `${filters},palettegen=max_colors=64:stats_mode=diff`, palette]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(skip), '-i', webm, '-i', palette, '-lavfi', `${filters} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, join(IMAGES, 'demo.gif')]);
  console.log(`demo ✓ (${durationS.toFixed(1)} s)`);
}

await browser.close();
if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
