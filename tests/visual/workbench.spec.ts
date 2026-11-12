import { execFile } from 'node:child_process';
import process from 'node:process';
import { promisify } from 'node:util';
import { test } from '@playwright/test';

const execute = promisify(execFile);

test('four pages and customer dialog satisfy the approved visual contract', async ({ baseURL }) => {
  try {
    const result = await execute(process.execPath, ['scripts/visual-qa.mjs', 'check'], {
      env: { ...process.env, VISUAL_QA_URL: baseURL },
      timeout: 110000,
      maxBuffer: 1024 * 1024,
    });
    process.stdout.write(result.stdout);
  }
  catch (error) {
    if (error && typeof error === 'object' && 'stdout' in error)
      process.stdout.write(String(error.stdout));
    throw error;
  }
});
