import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const user = { id: '1', displayName: '测试用户' };

async function fillCredentials(page: Page) {
  await page.getByLabel('账号', { exact: true }).fill('alice');
  await page.getByLabel('密码', { exact: true }).fill('correct-password');
}

test('requires account and password before sending a login request', async ({ page }) => {
  let requests = 0;
  await page.route('**/auth/login', (route) => {
    requests += 1;
    return route.abort();
  });
  await page.goto('/login');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByText('请输入账号', { exact: true })).toBeVisible();
  await page.getByLabel('账号', { exact: true }).fill('alice');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByText('请输入密码', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
  await expect(page.getByLabel('密码', { exact: true })).toHaveAttribute('type', 'password');
});

test('shows pending feedback and prevents duplicate login submissions', async ({ page }) => {
  let requests = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/auth/login', async (route) => {
    requests += 1;
    await pending;
    return route.fulfill({
      json: { token: 'account-session', user },
    });
  });
  await page.goto('/login');
  await fillCredentials(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('button', { name: '登录', exact: true })).toBeDisabled();
  await expect(page.getByLabel('账号', { exact: true })).toBeDisabled();
  await page.keyboard.press('Enter');
  release();
  await expect(page.getByText('测试用户', { exact: true })).toBeVisible();
  expect(requests).toBe(1);
});

for (const failure of [
  {
    name: 'incorrect credentials',
    status: 401,
    message: '账号或密码错误',
    json: true,
  },
  {
    name: 'non-JSON server failure',
    status: 503,
    message: 'HTTP 503',
    json: false,
  },
  {
    name: 'network failure',
    status: 0,
    message: '登录失败，请稍后重试。',
    json: false,
  },
]) {
  test(`allows retry after ${failure.name} without automatically logging in again`, async ({ page }) => {
    let requests = 0;
    await page.route('**/auth/login', (route) => {
      requests += 1;
      if (requests > 1) {
        return route.fulfill({
          json: { token: 'account-session', user },
        });
      }
      if (!failure.status) {
        return route.abort('failed');
      }
      return route.fulfill({
        status: failure.status,
        contentType: failure.json ? 'application/json' : 'text/plain',
        body: failure.json
          ? JSON.stringify({ message: failure.message })
          : 'service unavailable',
      });
    });
    await page.goto('/login');
    await fillCredentials(page);
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await expect(page.getByRole('alert')).toHaveText(failure.message);
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('button', { name: '登录', exact: true })).toBeEnabled();
    expect(requests).toBe(1);
    expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('account-session');
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await expect(page.getByText('测试用户', { exact: true })).toBeVisible();
    expect(requests).toBe(2);
  });
}

test('does not attach a stored credential to the password login request', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('h5_session_token', 'previous-session'));
  let authorization: string | undefined;
  await page.route('**/auth/login', (route) => {
    authorization = route.request().headers().authorization;
    return route.fulfill({
      json: { token: 'new-session', user },
    });
  });
  await page.goto('/login');
  await fillCredentials(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByText('测试用户', { exact: true })).toBeVisible();
  expect(authorization).toBeUndefined();
});

for (const redirect of [
  'https://outside.example/path',
  '//outside.example/path',
  '/\\outside.example/path',
  'javascript:alert(1)',
  '/login?redirect=/',
  '/login/',
  '/LOGIN',
  '/LOGIN/',
  '/%6cogin',
  '/%E0%A4%A',
]) {
  test(`uses home instead of an unsafe or looping return address: ${redirect}`, async ({ page }) => {
    await page.route('**/auth/login', route => route.fulfill({
      json: { token: 'account-session', user },
    }));
    await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
    await fillCredentials(page);
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('测试用户', { exact: true })).toBeVisible();
  });
}

test('uses home when the return query is ambiguous', async ({ page }) => {
  await page.route('**/auth/login', route => route.fulfill({
    json: { token: 'account-session', user },
  }));
  await page.goto('/login?redirect=/&redirect=//outside.example');
  await fillCredentials(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page).toHaveURL('/');
});

test('does not establish a session when a successful HTTP response has an invalid token', async ({ page }) => {
  await page.route('**/auth/login', route => route.fulfill({
    json: { token: 123, user },
  }));
  await page.goto('/login');
  await fillCredentials(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 3000 });
  await expect(page).toHaveURL('/login');
  expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('123');
});

for (const response of [
  { user },
  { token: 'account-session' },
]) {
  test(`rejects a successful HTTP response missing ${'token' in response
    ? 'user'
    : 'token'}`, async ({ page }) => {
    await page.route('**/auth/login', route => route.fulfill({ json: response }));
    await page.goto('/login');
    await fillCredentials(page);
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL('/login');
    expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('account-session');
  });
}
