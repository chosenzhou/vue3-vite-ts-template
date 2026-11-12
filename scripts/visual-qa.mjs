import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from '@playwright/test';
import { pageNames, selectors, validatePair, viewports } from './visual-qa-contract.mjs';
import { writeComparison, writeReport } from './visual-qa-report.mjs';

const phase = process.argv[2] || 'check';
const requested = process.argv.slice(3);
const pages = requested.length ? requested : pageNames;
if (!/^[\w-]+$/.test(phase) || pages.some(name => !pageNames.includes(name)))
  throw new Error('Usage: node scripts/visual-qa.mjs <run-label> [workbench sales goals profile customer]');
if (phase === 'check' && requested.length)
  throw new Error('The check gate always covers all four pages and the customer dialog.');
const base = process.env.VISUAL_QA_URL || 'http://127.0.0.1:5173';
const evidence = new URL('../artifacts/visual-qa/', import.meta.url);
const baseline = JSON.parse(await readFile(new URL('../docs/workbench/visual-baseline.json', import.meta.url), 'utf8'));
const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const root = new URL(`runs/${id}/`, evidence);
await mkdir(new URL('runs/', evidence), { recursive: true });
// Exclusive directory creation: a capture never overwrites an earlier run.
await mkdir(root);
for (const folder of [
  'reference-raw',
  'reference',
  'actual',
  'comparison',
])
  await mkdir(new URL(`${folder}/`, root));
const hash = value => createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const inputs = {};
async function fingerprint(path, target = inputs) {
  const url = new URL(`../${path}`, import.meta.url);
  const entries = await readdir(url, { withFileTypes: true }).catch(() => null);
  if (entries) {
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.name.startsWith('.'))
        await fingerprint(`${path}/${entry.name}`, target);
    }
  }
  else {
    target[path] = hash(await readFile(url));
  }
}
const sourcePaths = [
  'src',
  'design',
  'scripts',
  'tests',
  'docs/workbench',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'vite.config.ts',
  'playwright.config.ts',
  'playwright.visual.config.ts',
  '.node-version',
  '.github/workflows/checks.yml',
  'eslint.config.js',
];
for (const path of sourcePaths)
  await fingerprint(path);
const manifest = {
  schemaVersion: 1,
  id,
  phase,
  startedAt: new Date().toISOString(),
  completedAt: null,
  baseline: baseline.id,
  baseUrl: base,
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
  browser: null,
  viewports,
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
  rasterComparison: 'RGB tolerance 24; symmetric 1px edge matching',
  scroll: 'all containers at 0,0',
  git: {
    head: git('rev-parse', 'HEAD'),
    dirty: Boolean(git('status', '--porcelain')),
  },
  sourceFingerprint: hash(JSON.stringify(inputs)),
  inputs,
  samples: {},
  failures: [],
  passed: false,
};
for (const [path, expected] of Object.entries(baseline.sourceFiles)) {
  if (inputs[path] !== expected)
    manifest.failures.push(`Approved design changed: ${path}. Review the baseline before updating its hash.`);
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    // Reset nested scroll containers after opening the dialog, too.
    for (const element of document.querySelectorAll('*')) {
      if (element instanceof HTMLElement && (element.scrollTop || element.scrollLeft))
        element.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);
}

async function capture(context, viewport, name, reference, key) {
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    if (reference) {
      await page.goto(`${base}/design/index.html`);
      await page.locator('#splash').waitFor({ state: 'hidden' });
      if (['sales', 'customer'].includes(name))
        await page.locator('[data-hub="sales"]').click();
      if (['goals', 'profile'].includes(name)) {
        const nav = page.locator(viewport.width >= 1024
          ? '.sidebar'
          : '.tabbar');
        await nav.locator(`[data-tab="${name === 'goals'
          ? 'target'
          : 'me'}"]`).click();
      }
      if (name === 'customer')
        await page.locator('#rankList .rank-row').first().click();
      await settle(page);
      await page.screenshot({ path: new URL(`reference-raw/${key}.png`, root).pathname });
      if (name === 'profile')
        await page.evaluate(() => document.querySelector('#stateDemo')?.closest('section')?.remove());
      // Normalize only accepted presentation rules; untouched exports remain above.
      if (name === 'sales' || name === 'customer')
        await page.addStyleTag({ content: '.seg-sub .seg-btn { display:flex; align-items:center; justify-content:center; text-align:center; }' });
      if (name === 'goals')
        await page.addStyleTag({ content: '.forecast { max-width:100%; white-space:normal; }' });
    }
    else {
      await page.goto(`${base}/__preview/${name === 'customer'
        ? 'sales'
        : name}`);
      await page.locator('.screen h1').waitFor({ state: 'attached' });
      await page.locator('.data-state').waitFor({ state: 'detached' });
      if (['sales', 'customer'].includes(name))
        await page.locator('.echarts canvas').first().waitFor();
      if (name === 'customer') {
        await page.locator('.rank-row').first().click();
        await page.locator('.customer-dialog .echarts canvas').waitFor();
      }
    }
    await settle(page);
    const sample = await page.evaluate((mapping) => {
      const rects = Object.fromEntries(Object.entries(mapping).map(([key, selector]) => {
        const element = document.querySelector(selector);
        if (!element)
          return [key, null];
        const r = element.getBoundingClientRect();
        const css = getComputedStyle(element);
        return [
          key,
          {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            fontFamily: css.fontFamily,
            fontSize: css.fontSize,
            fontWeight: css.fontWeight,
            lineHeight: css.lineHeight,
            letterSpacing: css.letterSpacing,
            color: css.color,
          },
        ];
      }));
      const periodLabels = [
        ...(mapping.periods
          ? document.querySelectorAll(`${mapping.periods} .seg-btn`)
          : []),
      ].map((button) => {
        const range = document.createRange();
        range.selectNodeContents(button);
        const t = range.getBoundingClientRect();
        const r = button.getBoundingClientRect();
        return {
          text: button.textContent.trim(),
          dx: Math.abs(t.x + t.width / 2 - r.x - r.width / 2),
          dy: Math.abs(t.y + t.height / 2 - r.y - r.height / 2),
        };
      });
      return {
        rects,
        accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
        periodLabels,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        scrollPositions: [
          { element: 'window', x: window.scrollX, y: window.scrollY },
          ...[
            ...document.querySelectorAll('.page-body, .main, .frame, #salesSub'),
          ].map(element => ({ element: element.id || element.className, x: element.scrollLeft, y: element.scrollTop })),
        ],
        fonts: {
          status: document.fonts.status,
          bodyFamily: getComputedStyle(document.body).fontFamily,
          availableFaces: [...document.fonts].map(font => ({ family: font.family, status: font.status })),
        },
      };
    }, selectors(name, reference));
    const label = reference ? 'reference' : 'actual';
    const screenshot = `${label}/${key}.png`;
    await page.screenshot({ path: new URL(screenshot, root).pathname });
    const regions = {};
    for (const region of name === 'customer'
      ? ['dialog', 'sparkline']
      : name === 'sales'
        ? ['trend', 'trendPlot']
        : []) {
      const r = sample.rects[region];
      if (r && r.y >= 0 && r.y + r.height <= page.viewportSize().height) {
        const path = `${label}/${key}-${region}.png`;
        await page.screenshot({
          path: new URL(path, root).pathname,
          clip: {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
          },
        });
        regions[region] = path;
      }
    }
    return {
      ...sample,
      errors,
      screenshot,
      regions,
    };
  }
  finally {
    await page.close();
  }
}

let browser;
try {
  if (manifest.failures.length)
    throw new Error('The design source does not match the approved baseline.');
  browser = await chromium.launch();
  manifest.browser = browser.version();
  const comparisonPage = await browser.newPage();
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    try {
      for (const name of pages) {
        const key = `${viewport.name}-${name}`;
        const sample = {
          failures: [],
          pixels: {},
          limits: {},
          regions: {},
        };
        manifest.samples[key] = sample;
        try {
          sample.reference = await capture(context, viewport, name, true, key);
          sample.actual = await capture(context, viewport, name, false, key);
          sample.failures.push(...validatePair(sample.reference, sample.actual, baseline.geometryTolerancePx));
          sample.regions = sample.reference.regions;
          for (const region of [
            'full',
            ...Object.keys(sample.regions),
          ]) {
            const stem = region === 'full'
              ? key
              : `${key}-${region}`;
            const ref = region === 'full'
              ? sample.reference.screenshot
              : sample.reference.regions[region];
            const actual = region === 'full'
              ? sample.actual.screenshot
              : sample.actual.regions[region];
            if (!actual)
              throw new Error(`Missing actual crop: ${region}`);
            const comparison = await writeComparison(comparisonPage, root, stem, new URL(ref, root), new URL(actual, root), region === 'trendPlot'
              ? sample.reference.accent
              : null);
            sample.pixels[region] = comparison.changedPercent;
            if (region === 'trendPlot') {
              sample.seriesInk = { ...comparison.seriesInk, minimumRatio: baseline.minimumTrendSeriesRatio };
              if (!comparison.seriesInk?.reference || comparison.seriesInk.actual < comparison.seriesInk.reference * baseline.minimumTrendSeriesRatio)
                sample.failures.push(`trendPlot series: insufficient rendered line (${comparison.seriesInk?.actual ?? 0}/${comparison.seriesInk?.reference ?? 0} color pixels)`);
            }
            sample.limits[region] = baseline.pixelThresholdPercent[region];
            if (sample.pixels[region] > sample.limits[region])
              sample.failures.push(`${region} pixels: ${sample.pixels[region].toFixed(3)}% > ${sample.limits[region]}%`);
          }
        }
        catch (error) {
          sample.failures.push(error.message);
        }
        manifest.failures.push(...sample.failures.map(failure => `${key}: ${failure}`));
        process.stdout.write(`${key}: ${sample.failures.length
          ? sample.failures.join(' | ')
          : 'PASS'}\n`);
      }
    }
    finally {
      await context.close();
    }
  }
}
catch (error) {
  manifest.failures.push(error.message);
}
finally {
  await browser?.close();
}
manifest.completedAt = new Date().toISOString();
const endingInputs = {};
for (const path of sourcePaths)
  await fingerprint(path, endingInputs);
if (hash(JSON.stringify(endingInputs)) !== manifest.sourceFingerprint)
  manifest.failures.push('Source files changed during capture; run the check again to obtain consistent evidence.');
manifest.passed = manifest.failures.length === 0 && Object.keys(manifest.samples).length === viewports.length * pages.length;
await writeFile(new URL('manifest.json', root), `${JSON.stringify(manifest, null, 2)}\n`);
await writeReport(root, manifest);
if (phase === 'check') {
  await copyFile(new URL('index.html', evidence), new URL('accepted.html', evidence), constants.COPYFILE_EXCL).catch((error) => {
    if (!['EEXIST', 'ENOENT'].includes(error.code))
      throw error;
  });
  await writeFile(new URL('latest.json', evidence), `${JSON.stringify({ id, path: `runs/${id}/`, passed: manifest.passed }, null, 2)}\n`);
  await writeFile(new URL('index.html', evidence), `<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>视觉验收证据</title><h1>视觉验收证据</h1><p><a href="runs/${id}/index.html">最新检查：${manifest.passed ? '通过' : '失败'} · ${id}</a></p><p><a href="accepted.html">历史人工验收对照</a> · <a href="../../docs/workbench/status.md">当前交付状态</a></p></html>`);
}
process.stdout.write(`Visual evidence: ${root.pathname}index.html\n`);
if (!manifest.passed)
  process.exitCode = 1;
