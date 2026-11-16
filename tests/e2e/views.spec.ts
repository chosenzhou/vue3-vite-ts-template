import { expect, test } from '@playwright/test';

test('renders the login page without a backend', async ({ page }) => {
  await page.route('**/auth/**', route => route.abort());
  await page.goto('/');
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await expect(page.getByRole('heading', { name: '账号登录' })).toBeVisible();
});

test('renders the not-found page publicly', async ({ page }) => {
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { name: '页面不存在' })).toBeVisible();
  await page.getByRole('button', { name: '返回首页' }).click();
  await expect(page.getByRole('heading', { name: '账号登录' })).toBeVisible();
});
