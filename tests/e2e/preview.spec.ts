import { expect, test } from '@playwright/test';

test('development preview opens all real pages without backend requests or a session', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const backendCalls: string[] = [];
  page.on('request', (request) => {
    if (/\/(?:auth\/(?:entry|wecom|logout)|users\/me)(?:\?|$)/.test(request.url()))
      backendCalls.push(new URL(request.url()).pathname);
  });
  await page.goto('/');
  await page.getByRole('button', { name: '预览工作台', exact: true }).click();
  await expect(page).toHaveURL('/__preview/workbench');
  await page.locator('#sales-entry').click();
  await expect(page).toHaveURL('/__preview/sales');
  await expect(page.locator('.kpi').first()).toContainText('186.5');
  await expect(page.getByRole('navigation', { name: '底部导航' })).toHaveCount(0);
  await page.getByRole('button', { name: '返回工作台' }).click();
  const nav = page.getByRole('navigation', { name: '底部导航' });
  await nav.getByRole('link', { name: '目标进度', exact: true }).click();
  await expect(page).toHaveURL('/__preview/goals');
  await expect(page.locator('.progress-ring .q-circular-progress__track')).toHaveCount(1);
  await expect(page.locator('.ring-value')).toHaveText('72.4%');
  await nav.getByRole('link', { name: '我的', exact: true }).click();
  await expect(page).toHaveURL('/__preview/profile');
  await expect(page.locator('.me-name')).toHaveText('陈志远');
  await expect(page.getByRole('button', { name: '退出登录' })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(backendCalls).toEqual([]);
  await page.goto('/profile?preview=true');
  await expect(page).toHaveURL(/\/\?redirect=.*profile.*auth=required/);
});

test('preview does not overwrite an existing authenticated profile', async ({ page }) => {
  await page.route('**/auth/wecom', route => route.fulfill({
    json: {
      token: 'preview-boundary-test',
      user: { id: 'real', displayName: '真实会话用户', provider: 'wecom' },
    },
  }));
  await page.route('**/users/me', route => route.fulfill({
    json: { id: 'real', displayName: '真实会话用户', provider: 'wecom' },
  }));
  const state = btoa(JSON.stringify({ redirect: '/profile', nonce: 'preview-boundary' }));
  await page.goto(`/auth/callback/wecom?code=test&state=${encodeURIComponent(state)}`);
  await expect(page.locator('.me-name')).toHaveText('真实会话用户');
  const session = await page.evaluate(() => ({ ...localStorage }));
  await page.goto('/__preview/profile');
  await expect(page.locator('.me-name')).toHaveText('陈志远');
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(session);
  await page.goto('/profile');
  await expect(page.locator('.me-name')).toHaveText('真实会话用户');
});

for (const width of [390, 1440]) {
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    test(`customer dialog preserves exported typography outside the page root at ${width}px (${reducedMotion})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion });
      const typography = () => page.evaluate(() => {
        const style = getComputedStyle(document.querySelector('.sheet-title')!);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
        };
      });
      await page.goto('/design/index.html');
      await page.locator('#splash').waitFor({ state: 'hidden' });
      await page.locator('[data-hub="sales"]').click();
      await page.locator('#rankList .rank-row').first().click();
      await page.locator('#sheet').evaluate(async (sheet) => {
        await document.fonts.ready;
        await Promise.all(sheet.getAnimations({ subtree: true }).map(animation => animation.finished));
      });
      await expect(page.locator('#sheet')).toHaveCSS('transform', 'none');
      const reference = await typography();
      const referenceBounds = await page.locator('#sheet').boundingBox();
      await page.goto('/__preview/sales');
      const trigger = page.locator('.rank-row').first();
      await trigger.click();
      await expect(page.getByRole('dialog', { name: '康宁大药房连锁' })).toBeVisible();
      expect(await typography()).toEqual(reference);
      await expect.poll(async () => {
        const actual = await page.locator('.customer-dialog').boundingBox();
        return Math.abs(actual!.height - referenceBounds!.height);
      }).toBeLessThan(1);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }

  test(`navigation colors and profile typography follow the export at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/design/index.html');
    await page.locator('#splash').waitFor({ state: 'hidden' });
    const nav = page.locator(width >= 1024
      ? '.sidebar'
      : '.tabbar');
    await nav.locator('[data-tab="me"]').click();
    const reference = await page.evaluate(() => {
      const css = (selector: string) => {
        const style = getComputedStyle(document.querySelector(selector)!);
        return { color: style.color, fontSize: style.fontSize };
      };
      return {
        avatar: css('.avatar'),
        label: css('.set-label'),
        value: css('.set-value'),
        inactive: css(window.innerWidth >= 1024
          ? '.sb-item[data-tab="target"]'
          : '.tab[data-tab="target"]'),
      };
    });
    await page.goto('/__preview/profile');
    await expect(page.locator('.me-name')).toHaveText('陈志远');
    const actual = await page.evaluate(() => {
      const css = (selector: string) => {
        const style = getComputedStyle(document.querySelector(selector)!);
        return { color: style.color, fontSize: style.fontSize };
      };
      return {
        avatar: css('.q-avatar__content'),
        label: css('.set-label'),
        value: css('.set-value'),
        inactive: css(window.innerWidth >= 1024
          ? '.sb-item[href="/__preview/goals"]'
          : '.tab[href="/__preview/goals"]'),
      };
    });
    expect(actual).toEqual(reference);
  });
}
