import type { AddressInfo } from 'node:net';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import process from 'node:process';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

const execute = promisify(execFile);
const faults = [
  { name: 'runtime', script: 'throw new Error("visual-gate-negative-probe")', signal: 'visual-gate-negative-probe' },
  { name: 'missing', css: '.sales-screen .page-title{display:none!important}', signal: 'missing or empty element' },
  { name: 'layout', css: '.sales-screen .page-title{line-height:60px!important}', signal: 'title.lineHeight' },
  { name: 'blank-trend', css: '.trend-card .echarts canvas{opacity:0!important}', signal: 'trendPlot series' },
];

for (const fault of faults) {
  test(`visual command exits nonzero for a real ${fault.name} regression`, async ({ baseURL }) => {
    // Mutate only the proxy response. Application and design files remain untouched.
    const proxy = createServer(async (request, response) => {
      try {
        const upstream = await fetch(new URL(request.url!, baseURL), {
          signal: AbortSignal.timeout(10000),
        });
        const type = upstream.headers.get('content-type') || 'application/octet-stream';
        let body: string | Uint8Array = new Uint8Array(await upstream.arrayBuffer());
        if (type.includes('text/html') && request.url?.startsWith('/__preview/')) {
          const extra = fault.script
            ? `<script>${fault.script}</script>`
            : `<style>${fault.css}</style>`;
          body = new TextDecoder().decode(body).replace('</head>', `${extra}</head>`);
        }
        response.writeHead(upstream.status, { 'Content-Type': type });
        response.end(body);
      }
      catch {
        response.writeHead(502);
        response.end('Visual test proxy failed');
      }
    });
    await new Promise<void>(resolve => proxy.listen(0, '127.0.0.1', resolve));
    try {
      const { port } = proxy.address() as AddressInfo;
      const result = await execute(process.execPath, ['scripts/visual-qa.mjs', `probe-${fault.name}`, 'sales'], {
        env: { ...process.env, VISUAL_QA_URL: `http://127.0.0.1:${port}` },
        timeout: 60000,
        maxBuffer: 1024 * 1024,
      }).then(value => ({ code: 0, stdout: value.stdout }), (error: { code: number, stdout: string }) => error);
      expect(result.code).toBe(1);
      expect(result.stdout).toContain(fault.signal);
    }
    finally {
      proxy.closeAllConnections();
      await new Promise<void>((resolve, reject) => proxy.close(error => error
        ? reject(error)
        : resolve()));
    }
  });
}
