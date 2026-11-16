import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '../..');
const require = createRequire(import.meta.url);
const cli = join(root, 'node_modules/@playwright/test/cli.js');

async function runPlaywright(config, port, env = {}) {
  const child = spawn(process.execPath, [
    cli,
    'test',
    '--config',
    config,
    '--workers=1',
  ], {
    cwd: root,
    env: {
      ...process.env,
      CI: '',
      E2E_REUSE_SERVER: '',
      E2E_PORT: String(port),
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', chunk => output += chunk);
  child.stderr.on('data', chunk => output += chunk);
  const timeout = setTimeout(() => child.kill(), 30000);
  try {
    const [code] = await once(child, 'exit');
    return { code, output };
  }
  finally {
    clearTimeout(timeout);
  }
}

test('occupied E2E servers are preserved and reused only by explicit local opt-in', { timeout: 100000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'h5-e2e-isolation-'));
  const server = createServer((_request, response) => response.end('fixture-server'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}`;
  try {
    await mkdir(join(directory, 'fixtures'));
    const config = join(directory, 'playwright.config.ts');
    await writeFile(config, `
import base from ${JSON.stringify(join(root, 'playwright.config.ts'))};
export default {
  ...base,
  testDir: './fixtures',
  outputDir: ${JSON.stringify(join(directory, 'results'))},
  reporter: 'list',
  retries: 0,
  webServer: { ...base.webServer, cwd: ${JSON.stringify(root)} },
};
`);
    await writeFile(join(directory, 'fixtures/reuse.spec.ts'), `
import { expect, test } from ${JSON.stringify(require.resolve('@playwright/test'))};
test('uses the explicitly selected server', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('fixture-server', { exact: true })).toBeVisible();
});
`);

    const rejected = await runPlaywright(config, port);
    assert.notEqual(rejected.code, 0, rejected.output);
    assert.match(rejected.output, /already used|already in use/, rejected.output);
    assert.equal(await (await fetch(url)).text(), 'fixture-server');

    const reused = await runPlaywright(config, port, { E2E_REUSE_SERVER: '1' });
    assert.equal(reused.code, 0, reused.output);
    assert.equal(await (await fetch(url)).text(), 'fixture-server');

    const ci = await runPlaywright(config, port, { CI: 'true', E2E_REUSE_SERVER: '1' });
    assert.notEqual(ci.code, 0, ci.output);
    assert.match(ci.output, /already used|already in use/, ci.output);
    assert.equal(await (await fetch(url)).text(), 'fixture-server');
  }
  finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
