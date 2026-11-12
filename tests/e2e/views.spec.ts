import { expect, test } from '@playwright/test';

test('renders the ECharts example', async ({ page }) => {
  await page.goto('/charts');

  await expect(page.getByText('访问量', { exact: true })).toBeVisible();
  await expect(page.locator('.echarts')).toBeVisible();
});

test('renders the not-found page', async ({ page }) => {
  await page.goto('/missing-page');

  await expect(page.getByRole('heading', { name: '页面不存在' })).toBeVisible();
});

test('shows an expired-session notice before entering OAuth', async ({ page }) => {
  await page.goto('/');

  await page.goto('/?auth=expired&redirect=/profile');

  await expect(page.getByText('登录状态已失效，请重新进入应用。')).toBeVisible();
});
