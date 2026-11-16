import { expect, test } from '@playwright/test';
import { resolveApiBaseURL } from '../../src/config';

test('accepts a custom API prefix or origin and rejects invalid configuration', () => {
  expect(resolveApiBaseURL('/backend.v1/')).toBe('/backend.v1');
  expect(resolveApiBaseURL('https://api.example.test/v1/')).toBe('https://api.example.test/v1');
  expect(() => resolveApiBaseURL('backend')).toThrow('VITE_API_BASE_URL');
  expect(() => resolveApiBaseURL('//outside.example')).toThrow('VITE_API_BASE_URL');
  expect(() => resolveApiBaseURL('https://username@example.test')).toThrow('VITE_API_BASE_URL');
});

test('uses the default API prefix without a local environment file', async ({ page }) => {
  let loginPath = '';
  await page.route('**/auth/login', (route) => {
    loginPath = new URL(route.request().url()).pathname;
    return route.fulfill({
      json: {
        token: 'starter-session',
        user: { id: '1', displayName: '模板用户' },
      },
    });
  });
  await page.goto('/login');
  await page.getByLabel('账号', { exact: true }).fill('alice');
  await page.getByLabel('密码', { exact: true }).fill('password');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByText('模板用户', { exact: true })).toBeVisible();
  expect(loginPath).toBe('/api/auth/login');
});

test('keeps a long user email within the mobile content width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/auth/login', route => route.fulfill({
    json: {
      token: 'starter-session',
      user: {
        id: '1',
        displayName: '模板用户',
        email: 'long.account.name.for.mobile.layout@example.enterprise-company.com',
      },
    },
  }));
  await page.goto('/login');
  await page.getByLabel('账号', { exact: true }).fill('alice');
  await page.getByLabel('密码', { exact: true }).fill('password');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByText('模板用户', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

for (const width of [390, 1440]) {
  test(`keeps login feedback and public 404 usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/auth/login', route => route.fulfill({
      status: 401,
      json: { message: '账号或密码错误，请重试。' },
    }));
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '账号登录' })).toBeVisible();
    await page.getByLabel('账号', { exact: true }).fill('alice');
    await page.getByLabel('密码', { exact: true }).fill('password');
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await expect(page.getByRole('alert')).toHaveText('账号或密码错误，请重试。');
    await expect(page.getByRole('button', { name: '登录', exact: true })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.goto('/missing-page');
    await expect(page.getByRole('heading', { name: '页面不存在' })).toBeVisible();
    await page.getByRole('button', { name: '返回首页' }).click();
    await expect(page.getByRole('heading', { name: '账号登录' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
