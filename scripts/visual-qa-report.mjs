import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  })[char]);
}

export async function compareImages(page, referencePath, actualPath, seriesColor = null) {
  const sources = await Promise.all([referencePath, actualPath].map(async path => (await readFile(path)).toString('base64')));
  return page.evaluate(async ({ sources, seriesColor }) => {
    const images = await Promise.all(sources.map(src => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = `data:image/png;base64,${src}`;
    })));
    const [ref, actual] = images;
    const width = ref.width;
    const height = ref.height;
    if (actual.width !== width || actual.height !== height)
      throw new Error(`Image dimensions differ: ${width}×${height} / ${actual.width}×${actual.height}`);
    const pixels = images.map((img) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, width, height).data;
    });
    const heat = document.createElement('canvas');
    heat.width = width;
    heat.height = height;
    const hctx = heat.getContext('2d');
    const data = hctx.createImageData(width, height);
    let accent;
    if (seriesColor) {
      const probe = document.createElement('canvas').getContext('2d');
      probe.fillStyle = seriesColor;
      probe.fillRect(0, 0, 1, 1);
      accent = probe.getImageData(0, 0, 1, 1).data;
    }
    const ink = [0, 0];
    let changed = 0;
    for (let i = 0; i < pixels[0].length; i += 4) {
      const different = [0, 1, 2].some(channel => Math.abs(pixels[0][i + channel] - pixels[1][i + channel]) > 24);
      changed += Number(different);
      if (accent) {
        for (const [index, image] of pixels.entries()) {
          // Count the rendered series core, allowing its antialiased edge pixels.
          if ([0, 1, 2].every(channel => Math.abs(image[i + channel] - accent[channel]) <= 32))
            ink[index]++;
        }
      }
      data.data.set(different
        ? [239, 68, 68, 255]
        : [248, 248, 250, 255], i);
    }
    hctx.putImageData(data, 0, 0);
    const comparison = document.createElement('canvas');
    comparison.width = width * 2 + 16;
    comparison.height = height + 36;
    const ctx = comparison.getContext('2d');
    ctx.fillStyle = '#eef1f5';
    ctx.fillRect(0, 0, comparison.width, comparison.height);
    images.forEach((img, index) => {
      const x = index * (width + 16);
      ctx.fillStyle = '#111';
      ctx.font = 'bold 16px system-ui';
      ctx.fillText(index ? '当前实现' : '设计原稿', x + 8, 24);
      ctx.drawImage(img, x, 36);
    });
    return {
      changedPercent: changed / (width * height) * 100,
      seriesInk: seriesColor
        ? { color: seriesColor, reference: ink[0], actual: ink[1] }
        : null,
      comparison: comparison.toDataURL().split(',')[1],
      heatmap: heat.toDataURL().split(',')[1],
    };
  }, { sources, seriesColor });
}

export async function writeComparison(page, root, key, reference, actual, seriesColor = null) {
  const result = await compareImages(page, reference, actual, seriesColor);
  await writeFile(new URL(`comparison/${key}.png`, root), Buffer.from(result.comparison, 'base64'));
  await writeFile(new URL(`comparison/${key}-diff.png`, root), Buffer.from(result.heatmap, 'base64'));
  return { changedPercent: result.changedPercent, seriesInk: result.seriesInk };
}

export async function writeReport(root, manifest) {
  const cards = Object.entries(manifest.samples).map(([key, sample]) => {
    const regions = [
      'full',
      ...Object.keys(sample.regions ?? {}),
    ];
    const images = regions.filter(region => sample.pixels?.[region] !== undefined).map((region) => {
      const stem = region === 'full'
        ? key
        : `${key}-${region}`;
      return `<p>${escapeHtml(region)}：${sample.pixels[region].toFixed(3)}%（阈值 ${sample.limits[region]}%） · <a href="comparison/${stem}-diff.png">差异图</a></p><a href="comparison/${stem}.png"><img src="comparison/${stem}.png" alt="${escapeHtml(stem)} 原稿与实现"></a>`;
    }).join('');
    return `<section><h2>${escapeHtml(key)}</h2><p>${sample.failures.length
      ? escapeHtml(sample.failures.join('\n'))
      : '通过'}</p>${sample.seriesInk
      ? `<p>趋势线颜色像素：原稿 ${sample.seriesInk.reference}，实现 ${sample.seriesInk.actual}；最小比例 ${sample.seriesInk.minimumRatio}</p>`
      : ''}${images}</section>`;
  }).join('');
  await writeFile(new URL('index.html', root), `<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>视觉检查 ${escapeHtml(manifest.id)}</title><style>body{margin:24px auto;padding:0 20px;max-width:1400px;font:14px/1.6 system-ui;color:#172033;background:#f5f7fb}section{background:white;border:1px solid #d9dee7;padding:16px;margin:20px 0;border-radius:8px}img{display:block;max-width:100%;height:auto}p{white-space:pre-wrap}a{color:#1677ff}code{overflow-wrap:anywhere}</style><h1>视觉检查：${manifest.passed ? '通过' : '失败'}</h1><p>采集 ${escapeHtml(manifest.startedAt)}；完成 ${escapeHtml(manifest.completedAt)}</p><p>代码 <code>${escapeHtml(manifest.git.head)}</code>；工作区${manifest.git.dirty ? '有改动' : '干净'}；指纹 <code>${manifest.sourceFingerprint}</code></p><p>Chromium ${escapeHtml(manifest.browser)}；${escapeHtml(manifest.platform)}；DPR 1；已加载字体；减少动效；滚动归零。全页比例以完整视口为分母，弹层和迷你图另有局部阈值。</p><p><a href="manifest.json">完整元数据与结果</a> · <a href="../../../../docs/workbench/status.md">已确认基线与交付状态</a> · <a href="../../accepted.html">历史验收对照</a></p><p>认可的差异：我的页排除原型状态演示卡；周期文字居中；图表保留ECharts。原稿文件不修改。自动检查通过后仍需人工确认视觉效果。</p><p>${escapeHtml(manifest.failures.join('\n'))}</p>${cards}</html>`);
}
