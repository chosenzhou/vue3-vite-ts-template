import { expect, test } from '@playwright/test';
import { compareImages } from '../../scripts/visual-qa-report.mjs';

declare global {
  interface Window {
    customerChartText: string[]
  }
}

for (const width of [390, 430, 1366, 1440]) {
  test(`customer sparkline follows the export across periods and resizing at ${width}px`, async ({ browser, baseURL }, testInfo) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const reference = await context.newPage();
    const actual = await context.newPage();
    await actual.addInitScript(() => {
      window.customerChartText = [];
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (...args: Parameters<typeof fillText>) {
        if (this.canvas.closest('.customer-dialog'))
          window.customerChartText.push(args[0]);
        return fillText.apply(this, args);
      };
    });
    await reference.goto('/design/index.html');
    await reference.locator('#splash').waitFor({ state: 'hidden' });
    await reference.locator('[data-hub="sales"]').click();
    // Start at another width to exercise the mounted chart's resize path too.
    await actual.setViewportSize({
      width: width >= 1024
        ? 1200
        : 360,
      height: 900,
    });
    await actual.goto('/__preview/sales');
    for (const [period, title] of [
      ['today', '今日'],
      ['week', '本周'],
      ['month', '本月'],
    ] as const) {
      await reference.locator(`[data-p="${period}"]`).click();
      await reference.locator('#rankList .rank-row').first().click();
      const lastValue = await reference.locator('#sparkSvg text').textContent();
      await actual.evaluate(() => {
        window.customerChartText = [];
      });
      await actual.getByRole('button', { name: title, exact: true }).click();
      await actual.locator('.rank-row').first().click();
      await actual.locator('.customer-dialog .echarts canvas').waitFor();
      await actual.setViewportSize({ width, height: 900 });
      await Promise.all([reference, actual].map(page => page.evaluate(() => document.fonts.ready)));
      await actual.waitForTimeout(300);
      expect(await actual.evaluate(() => window.customerChartText)).toContain(lastValue);
      const referenceImage = testInfo.outputPath(`${period}-reference.png`);
      const actualImage = testInfo.outputPath(`${period}-actual.png`);
      await Promise.all([
        reference.locator('#sparkSvg').screenshot({ path: referenceImage }),
        actual.locator('.customer-dialog .echarts').screenshot({ path: actualImage }),
      ]);
      const difference = await compareImages(actual, referenceImage, actualImage);
      expect(difference.changedPercent, `${period}: rendered sparkline differs from the exported SVG`).toBeLessThan(3);
      await reference.locator('#sheetClose').click();
      await actual.keyboard.press('Escape');
    }
    await context.close();
  });
}
