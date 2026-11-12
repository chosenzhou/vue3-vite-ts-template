import type { PlaywrightTestConfig } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import e2e from '../../playwright.config';
import visual from '../../playwright.visual.config';

const execute = promisify(execFile);
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const runner = join(projectRoot, 'node_modules/@playwright/test/cli.js');
const testPackage = join(projectRoot, 'node_modules/@playwright/test');

function outputPaths(config: PlaywrightTestConfig) {
  if (!Array.isArray(config.reporter))
    throw new TypeError('Expected a JSON reporter');
  const reporter = config.reporter.find(([name]) => name === 'json');
  const json = (reporter?.[1] as { outputFile?: string } | undefined)?.outputFile;
  if (!json)
    throw new Error('Missing JSON report path');
  return {
    output: relative(projectRoot, resolve(projectRoot, config.outputDir ?? 'test-results')),
    json: relative(projectRoot, resolve(projectRoot, json)),
  };
}

function contains(parent: string, child: string) {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith('..') && !isAbsolute(path));
}

test('report directories preserve JSON and traces in both execution orders', async () => {
  const suites = {
    e2e: outputPaths(e2e),
    visual: outputPaths(visual),
  };
  // Fail before starting any subprocess if the real configs could clean each other's results.
  for (const paths of Object.values(suites)) {
    expect(paths.output.startsWith('..') || isAbsolute(paths.output)).toBeFalsy();
    for (const other of Object.values(suites))
      expect(contains(paths.output, other.json), `${paths.output} would clean ${other.json}`).toBeFalsy();
  }
  expect(contains(suites.e2e.output, suites.visual.output)).toBeFalsy();
  expect(contains(suites.visual.output, suites.e2e.output)).toBeFalsy();

  const sandbox = await mkdtemp(join(tmpdir(), 'workbench-report-isolation-'));
  try {
    for (const order of [
      ['e2e', 'visual'],
      ['visual', 'e2e'],
    ] as const) {
      const root = join(sandbox, order.join('-'));
      const tests = join(root, 'fixtures');
      await mkdir(tests, { recursive: true });
      await writeFile(join(tests, 'probe.spec.cjs'), `const { test } = require(${JSON.stringify(testPackage)});
const { writeFile } = require('node:fs/promises');
test('writes trace', async ({}, info) => {
  const path = info.outputPath('trace.zip');
  await writeFile(path, 'retained evidence');
  await info.attach('trace', { path, contentType: 'application/zip' });
});\n`);
      let retained: { json: string, contents: string, trace: string, bytes: Uint8Array } | undefined;
      for (const name of order) {
        const paths = suites[name];
        const config = join(root, `${name}.config.cjs`);
        const json = join(root, paths.json);
        await writeFile(config, `module.exports = ${JSON.stringify({
          testDir: tests,
          outputDir: join(root, paths.output),
          workers: 1,
          reporter: [
            [
              'json',
              { outputFile: json },
            ],
          ],
        })};\n`);
        // cwd and every output path are inside the sandbox, never the project's test-results.
        await execute(process.execPath, [runner, 'test', '--config', config], { cwd: root, timeout: 15000 });
        if (retained) {
          expect(await readFile(retained.json, 'utf8')).toBe(retained.contents);
          expect(await readFile(retained.trace)).toEqual(retained.bytes);
        }
        else {
          const contents = await readFile(json, 'utf8');
          const report = JSON.parse(contents);
          const trace = report.suites[0].specs[0].tests[0].results[0].attachments[0].path as string;
          retained = {
            json,
            contents,
            trace,
            bytes: await readFile(trace),
          };
        }
      }
    }
  }
  finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});
