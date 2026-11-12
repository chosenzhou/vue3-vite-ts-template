import { Buffer } from 'node:buffer';
import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { compareImages } from '../../scripts/visual-qa-report.mjs';

for (const scenario of [
  { name: 'one pixel raster edge', actualX: 11, expectedDifference: false },
  { name: 'missing stroke', actualX: null, expectedDifference: true },
  { name: 'two pixel displacement', actualX: 12, expectedDifference: true },
]) {
  test(`raster comparison distinguishes ${scenario.name}`, async ({ page }, info) => {
    const images = await page.evaluate((actualX) => {
      return [10, actualX].map((x) => {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 40, 40);
        if (x !== null) {
          ctx.fillStyle = '#0066cc';
          ctx.fillRect(x, 8, 1, 24);
        }
        return canvas.toDataURL().split(',')[1]!;
      });
    }, scenario.actualX);
    const paths = [
      info.outputPath('reference.png'),
      info.outputPath('actual.png'),
    ];
    await Promise.all(paths.map((path, index) => writeFile(path, Buffer.from(images[index]!, 'base64'))));
    const comparison = await compareImages(page, paths[0]!, paths[1]!, '#0066cc');
    expect(comparison.changedPercent > 0).toBe(scenario.expectedDifference);
    if (scenario.actualX === null) {
      expect(comparison.seriesInk!.reference).toBeGreaterThan(0);
      expect(comparison.seriesInk!.actual).toBe(0);
    }
  });
}
