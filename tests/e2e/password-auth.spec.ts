import { expect, test } from '@playwright/test';

test('signs in with account and password and returns to the original internal address', async ({ page }) => {
  let loginBody: unknown;
  let authorization: string | undefined;
  await page.route('**/auth/login', (route) => {
    loginBody = route.request().postDataJSON();
    authorization = route.request().headers().authorization;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'account-session',
        user: { id: '1', displayName: '测试用户' },
      }),
    });
  });

  await page.goto('/?tab=account#details');
  await expect(page.getByLabel('账号', { exact: true })).toBeVisible({ timeout: 3000 });
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await page.getByLabel('账号', { exact: true }).fill('alice');
  await page.getByLabel('密码', { exact: true }).fill('correct-password');
  await page.getByRole('button', { name: '登录', exact: true }).click();

  await expect(page).toHaveURL('/?tab=account#details');
  await expect(page.getByText('测试用户', { exact: true })).toBeVisible();
  expect(loginBody).toEqual({ username: 'alice', password: 'correct-password' });
  expect(authorization).toBeUndefined();
  const stored = await page.evaluate(() => Object.values(localStorage));
  expect(stored).toContain('account-session');
  expect(stored).not.toContain('correct-password');
  expect(stored).not.toContain('测试用户');
});

test('falls back to home when the requested return route does not exist', async ({ page }) => {
  await page.route('**/auth/login', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      token: 'account-session',
      user: { id: '1', displayName: '测试用户' },
    }),
  }));

  await page.goto(`/login?redirect=${encodeURIComponent('/unknown-route')}`);
  await page.getByLabel('账号', { exact: true }).fill('alice');
  await page.getByLabel('密码', { exact: true }).fill('correct-password');
  await page.getByRole('button', { name: '登录', exact: true }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('测试用户', { exact: true })).toBeVisible();
});
