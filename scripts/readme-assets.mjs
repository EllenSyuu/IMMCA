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
 * reachable, set FONT_DIR to a folder with @fontsource/schibsted-grotesk and
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
  add('schibsted-grotesk', [400, 500, 600, 700, 800]);
  add('noto-sans-sc', [400, 500, 700]);
  return css.join('\n').replace(/font-family: '([^']+)'/g, (_, f) => `font-family: '${f === 'Schibsted Grotesk' ? 'Schibsted Grotesk' : 'Noto Sans SC'}'`);
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
  await page.waitForTimeout(2200); // let the hero lines finish drawing
  return page;
}
const html = (body, extraCss = '') => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap">
<style>*{box-sizing:border-box}html,body{margin:0}body{font-family:'Schibsted Grotesk','Noto Sans SC',system-ui,sans-serif;-webkit-font-smoothing:antialiased}${extraCss}</style>
</head><body>${body}</body></html>`;

// ---------------------------------------------------------------- 1. cover
const LINES = [
  { label: 'Federal', color: '#D52B1E', d: 'M40 90 H330 Q385 90 418 145 L470 235 Q486 262 518 262 H590' },
  { label: 'Québec', color: '#2F6BFF', d: 'M40 160 H280 Q322 160 352 192 L404 240 Q428 262 460 262 H590' },
  { label: 'Ontario', color: '#E8710A', d: 'M40 230 H260 Q298 230 330 248 Q350 262 382 262 H590' },
  { label: 'British Columbia', color: '#0891B2', d: 'M40 300 H262 Q300 300 332 280 Q354 262 386 262 H590' },
  { label: 'Alberta', color: '#7C3AED', d: 'M40 370 H300 Q344 370 374 326 L410 286 Q428 262 460 262 H590' },
  { label: 'Atlantic', color: '#4F86B5', d: 'M40 440 H330 Q384 440 416 384 L466 296 Q486 262 518 262 H590' },
];
function coverHtml(dark) {
  const c = dark
    ? { bg: '#0f1b33', ink: '#ffffff', sub: '#b9c3d6', chip: 'rgba(255,255,255,.08)', chipInk: '#e6ebf4', station: '#0f1b33', terminus: '#ffffff', terminusInk: '#0f1b33', label: '#9aa6bd' }
    : { bg: '#f6f7f9', ink: '#12213d', sub: '#3c4860', chip: '#ffffff', chipInk: '#12213d', station: '#ffffff', terminus: '#12213d', terminusInk: '#ffffff', label: '#5d6779' };
  const lines = LINES.map((l, i) => `
    <path d="${l.d}" stroke="${l.color}" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="40" y="${[90, 160, 230, 300, 370, 440][i] - 20}" fill="${c.label}" font-size="15" font-weight="600">${l.label}</text>
    ${[110 + (i % 2) * 40, 200 + (i % 3) * 20].map((x) => `<circle cx="${x}" cy="${[90, 160, 230, 300, 370, 440][i]}" r="10" fill="${c.station}" stroke="${l.color}" stroke-width="6"/>`).join('')}`).join('');
  return html(`
  <div class="cover">
    <div class="text">
      <div class="brand">
        <svg class="mark" viewBox="0 0 32 32" width="64" height="64"><g fill="none" stroke-linecap="round" stroke-width="3.6"><path d="M4 7.5H9.5C14.5 7.5 15.5 16 21 16" stroke="#D52B1E"/><path d="M4 24.5H9.5C14.5 24.5 15.5 16 21 16" stroke="#E8710A"/><path d="M4 16H21" stroke="#2F6BFF"/></g><circle cx="25" cy="16" r="5" fill="${c.ink}"/><circle cx="25" cy="16" r="2" fill="${c.bg}"/></svg>
        <span class="name">IMMCA</span>
      </div>
      <h1>Every route to Canadian permanent residence, on one map.</h1>
      <p>56 federal, Québec and provincial programs, checked every day against official sources. Free, open source, and private by design.</p>
      <div class="chips"><span>English</span><span>Français</span><span>中文</span></div>
    </div>
    <svg viewBox="0 0 700 520" class="map">
      ${lines}
      <rect x="575" y="226" width="110" height="72" rx="36" fill="${c.terminus}"/>
      <text x="630" y="272" text-anchor="middle" fill="${c.terminusInk}" font-size="30" font-weight="800" letter-spacing="1">PR</text>
    </svg>
  </div>`, `
  .cover{width:1280px;height:640px;background:${c.bg};display:grid;grid-template-columns:600px 1fr;align-items:center;padding:0 40px 0 84px;gap:8px}
  .brand{display:flex;align-items:center;gap:16px;margin-bottom:34px}
  .mark{display:block}
  .name{font-size:40px;font-weight:800;letter-spacing:.04em;color:${c.ink}}
  h1{font-size:50px;line-height:1.08;letter-spacing:-.025em;font-weight:800;color:${c.ink};margin:0 0 22px}
  p{font-size:21px;line-height:1.5;color:${c.sub};margin:0 0 28px;max-width:30em}
  .chips{display:flex;gap:10px}.chips span{background:${c.chip};color:${c.chipInk};border-radius:999px;padding:8px 18px;font-size:17px;font-weight:600;box-shadow:${dark ? 'none' : '0 0 0 1px #dfe3ea'}}
  .map{width:100%;height:auto}`);
}
{
  const ctx = await context({ viewport: { width: 1280, height: 640 } });
  const page = await ctx.newPage();
  for (const dark of [false, true]) {
    await page.setContent(coverHtml(dark), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(BRAND, `cover-${dark ? 'dark' : 'light'}.png`) });
  }
  await ctx.close();
  console.log('cover ✓');
}

// ---------------------------------------------------------------- 2. showcase
{
  const ctx = await context();
  const desk = await appPage(ctx, 'en', 1360, 860);
  await desk.locator('#results').scrollIntoViewIfNeeded();
  await desk.evaluate(() => window.scrollTo(0, document.querySelector('.workspace').getBoundingClientRect().top + window.scrollY - 16));
  await desk.waitForTimeout(300);
  const deskShot = join(TMP, 'desk.png');
  await desk.screenshot({ path: deskShot });

  const phone = await appPage(ctx, 'zh', 390, 844);
  await phone.evaluate(() => {
    const t = document.querySelector('.topbar'); const bar = getComputedStyle(t).position === 'sticky' ? t.getBoundingClientRect().height : 0;
    window.scrollTo(0, document.querySelector('.results__head').getBoundingClientRect().top + window.scrollY - bar - 12);
  });
  await phone.waitForTimeout(300);
  const phoneShot = join(TMP, 'phone.png');
  await phone.screenshot({ path: phoneShot });

  const b64 = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
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
    .stage{position:relative;width:1600px;height:1000px;background:#eef1f5;overflow:hidden}
    .window{position:absolute;left:70px;top:70px;width:1180px;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 30px 80px rgba(18,33,61,.18),0 0 0 1px rgba(18,33,61,.08)}
    .bar{height:42px;background:#f3f4f6;border-bottom:1px solid #e4e7ec;display:flex;align-items:center;gap:8px;padding:0 16px}
    .bar i{width:12px;height:12px;border-radius:50%;background:#d6dae1}
    .bar span{margin-left:18px;background:#fff;border-radius:8px;padding:4px 16px;font-size:14px;color:#5d6779;box-shadow:0 0 0 1px #e4e7ec}
    .window img{display:block;width:100%}
    .phone{position:absolute;right:90px;top:190px;width:330px;border-radius:48px;padding:12px;background:#12213d;box-shadow:0 40px 90px rgba(18,33,61,.32)}
    .phone img{display:block;width:100%;border-radius:37px}`), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(IMAGES, 'showcase.png'), clip: { x: 0, y: 0, width: 1600, height: 1000 } });
  await ctx.close();
  console.log('showcase ✓');
}

// ---------------------------------------------------------------- 3. anatomy
const ANATOMY = {
  en: ['Where to focus: your strongest route and its next step', 'What would change things: one change at a time', 'Your score, placed in the real Express Entry pool', 'Four answers per route: rules, openness, competitiveness, evidence', 'Every requirement, and the official page it comes from'],
  zh: ['重点关注：最值得先走的路线和下一步', '怎样会改变结果：一次只改变一项', '你的分数在真实候选池中的位置', '每条路线四个维度：资格、开放、竞争力、证据', '每一项要求，以及它出自哪个官方页面'],
  fr: ['Où concentrer vos efforts : la meilleure voie et la prochaine étape', 'Ce qui changerait la donne : un changement à la fois', 'Votre score, placé dans le vrai bassin d’Entrée express', 'Quatre réponses par voie : règles, ouverture, compétitivité, preuves', 'Chaque exigence, avec la page officielle d’où elle vient'],
};
for (const [locale, labels] of Object.entries(ANATOMY)) {
  const ctx = await context();
  const page = await appPage(ctx, locale, 1180, 900);
  await page.addStyleTag({ content: '.topbar{position:static!important}' });
  await page.locator('.route__head').first().click();
  await page.waitForTimeout(300);
  const box = await page.evaluate((labels) => {
    const r = (sel) => document.querySelector(sel).getBoundingClientRect();
    const col = r('.workspace__results');
    const targets = [r('.decision'), r('.scenarios'), r('.score'), r('.route .route__meta'), r('.route__sources')];
    const top = r('.results__head').top + window.scrollY - 20;
    const bottom = targets[4].bottom + window.scrollY + 24;
    // Overlay pins and labels in a gutter to the left of the results column.
    const layer = document.createElement('div');
    layer.style.cssText = `position:absolute;left:0;top:0;width:100%;height:${document.body.scrollHeight}px;pointer-events:none;z-index:50`;
    targets.forEach((t, i) => {
      const y = t.top + window.scrollY + Math.min(28, t.height / 2);
      const pin = document.createElement('div');
      pin.textContent = String(i + 1);
      pin.style.cssText = `position:absolute;left:${col.left - 52}px;top:${y - 17}px;width:34px;height:34px;border-radius:50%;background:#12213d;color:#fff;font:800 16px 'Schibsted Grotesk',sans-serif;display:grid;place-items:center;box-shadow:0 0 0 4px #fff`;
      const label = document.createElement('div');
      label.textContent = labels[i];
      label.style.cssText = `position:absolute;left:16px;top:${y - 22}px;width:${col.left - 100}px;font:600 15px/1.35 'Schibsted Grotesk','Noto Sans SC',sans-serif;color:#12213d;text-align:right`;
      const rule = document.createElement('div');
      rule.style.cssText = `position:absolute;left:${col.left - 78}px;top:${y}px;width:24px;height:2px;background:#12213d`;
      layer.append(label, rule, pin);
    });
    // Hide the profile form so the gutter holds only the explanations.
    document.querySelector('.workspace__form').style.visibility = 'hidden';
    document.body.append(layer);
    return { x: 0, y: top, width: col.right + 24, height: bottom - top };
  }, labels);
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
      c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;border-radius:50%;background:rgba(18,33,61,.25);border:2px solid #12213d;z-index:99999;pointer-events:none;transform:translate(-50%,-50%);transition:width .12s,height .12s';
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
  await click(page.locator('.hero__samples .chip').nth(1), 900);
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('.workspace').getBoundingClientRect().top + window.scrollY - 12, behavior: 'smooth' }));
  await page.waitForTimeout(1800);
  await click(page.locator('.decision__route').first(), 1800);
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
