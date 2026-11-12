import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

async function signIn(page: Page, redirect = '/workbench') {
  await page.route('**/auth/wecom', route => route.fulfill({
    json: {
      token: 'test-workbench-session',
      user: { id: 'test', displayName: '陈志远', provider: 'wecom' },
    },
  }));
  await page.route('**/users/me', route => route.fulfill({
    json: { id: 'test', displayName: '陈志远', provider: 'wecom' },
  }));
  const state = btoa(JSON.stringify({ redirect, nonce: 'workbench-test' }));
  await page.goto(`/auth/callback/wecom?code=test&state=${encodeURIComponent(state)}`);
  await expect(page).toHaveURL(redirect);
}

for (const width of [390, 1440]) {
  test(`navigation follows the matched route for URL variants at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await signIn(page);
    for (const prefix of ['', '/__preview']) {
      for (const segment of [
        'sales/',
        'SaLeS/',
        'goals/',
        'profile/',
        'workbench/',
      ]) {
        await page.goto(`${prefix}/${segment}`);
        await expect(page.locator('.screen h1')).toBeVisible();
        const sales = segment.toLowerCase().startsWith('sales');
        await expect(page.locator('.frame')).toHaveClass(sales ? /is-sales/ : /^(?!.*is-sales)/);
        await expect(page.locator('.tabbar')).toHaveCount(sales ? 0 : 1);
        const name = sales || segment === 'workbench/'
          ? '工作台'
          : segment === 'goals/'
            ? '目标进度'
            : '我的';
        const nav = page.locator(width >= 1024
          ? '.sb-nav'
          : '.tabbar');
        if (!sales || width >= 1024) {
          await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
          await expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'page');
        }
      }
    }
  });
}

test('protects every business route', async ({ page }) => {
  for (const path of ['/workbench', '/sales', '/goals']) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`redirect=${path}.*auth=required`));
  }
});

test('mobile navigation, periods, ranking, detail and return focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await expect(page.getByRole('navigation', { name: '底部导航' })).toBeVisible();
  await page.getByRole('button', { name: '本月概览，进入销售数据' }).click();
  await expect(page.getByRole('button', { name: '本月', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.kpi').first()).toContainText('5,432.8');
  await expect(page.getByRole('navigation', { name: '底部导航' })).toHaveCount(0);
  await page.getByRole('button', { name: '今日', exact: true }).click();
  await expect(page.locator('.kpi').first()).toContainText('186.5');
  await expect(page.locator('.rank-row')).toHaveCount(5);
  await page.getByRole('button', { name: '查看全部 8 家客户' }).click();
  await expect(page.locator('.rank-row')).toHaveCount(8);
  await page.getByRole('button', { name: '查看康宁大药房连锁详情' }).click();
  await expect(page.getByRole('dialog', { name: '康宁大药房连锁' })).toBeVisible();
  await expect(page.locator('.sheet-stats')).toContainText('23.6');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '查看康宁大药房连锁详情' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/workbench');
  await expect(page.locator('#sales-entry')).toBeFocused();
  await page.getByRole('link', { name: '目标进度', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: '销售团队进度' })).toBeVisible();
  await page.getByRole('link', { name: '我的', exact: true }).last().click();
  await expect(page.locator('.me-name')).toHaveText('陈志远');
  await expect(page.getByText('页面状态设计')).toHaveCount(0);
});

test('desktop sidebar remains usable on sales and collapses', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await signIn(page, '/sales');
  await expect(page.getByRole('complementary', { name: '侧边导航' })).toBeVisible();
  await expect(page.locator('.rank-ord').first()).toBeVisible();
  await page.getByRole('button', { name: '折叠侧边栏' }).click();
  await expect(page.locator('.sidebar')).toHaveCSS('width', '64px');
  await page.getByRole('link', { name: '目标进度', exact: true }).click();
  await expect(page).toHaveURL('/goals');
});

test('module availability produces feedback without creating undesigned pages', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: /库存数据/ }).click();
  await expect(page.locator('.q-notification')).toContainText('建设中');
  await page.getByRole('button', { name: /回款数据/ }).click();
  await expect(page.locator('.q-notification').last()).toContainText('暂无访问权限');
  await expect(page).toHaveURL('/workbench');
});

for (const width of [
  320,
  360,
  390,
  430,
  600,
  820,
  1024,
  1366,
  1440,
  1920,
]) {
  test(`all four pages fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await signIn(page);
    for (const path of [
      '/workbench',
      '/sales?period=month',
      '/goals',
      '/profile',
    ]) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.data-state')).toHaveCount(0);
      if (path.includes('sales'))
        await expect(page.locator('.echarts').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflowing = await page.evaluate(() => [
        ...document.querySelectorAll('.page-body, .main, .frame, .card, .hub-grid'),
      ].filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.className));
      if ([390, 1440].includes(width))
        await page.screenshot({ path: `test-results/workbench-${width}-${path.split('?')[0].slice(1)}.png` });
      expect(overflowing, path).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    }
    expect(errors).toEqual([]);
  });
}

// Regressions found by the independent Standards / Spec review.
test('authorization entry honors a target even when a session is already stored', async ({ page }) => {
  await signIn(page);
  let entryRequest: unknown;
  await page.route('**/auth/entry', (route) => {
    entryRequest = route.request().postDataJSON();
    return route.fulfill({
      json: { authorizationUrl: 'https://example.com/oauth?appid=review' },
    });
  });
  await page.route('https://example.com/oauth**', route => route.fulfill({ body: 'OAuth destination' }));
  const redirect = '/sales?period=week';
  await page.goto(`/?redirect=${encodeURIComponent(redirect)}`);
  await page.getByRole('button', { name: '进入应用', exact: true }).click();
  await expect(page).toHaveURL(/example\.com\/oauth/);
  expect(entryRequest).toEqual({ redirect });
  const state = new URL(page.url()).searchParams.get('state');
  expect(JSON.parse(atob(state!)).redirect).toBe(redirect);
});

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`goal progress recovers after a failed request (${reducedMotion})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion });
    await signIn(page);
    await page.evaluate(async () => {
      const modulePath = '/src/services/workbench/index.ts';
      const { workbenchRepository } = await import(modulePath) as typeof import('../../src/services/workbench');
      const original = workbenchRepository.getGoals;
      let attempts = 0;
      workbenchRepository.getGoals = async () => {
        if (++attempts === 1)
          throw new Error('Temporary goal request failure');
        return original();
      };
    });
    await page.getByRole('navigation', { name: '底部导航' }).getByRole('link', { name: '目标进度', exact: true }).click();
    await page.getByRole('button', { name: '重新加载', exact: true }).click();
    await expect(page.locator('.ring-value')).toHaveText('72.4%');
    await expect(page.locator('.progress-ring')).toHaveAttribute('aria-label', '月度目标完成率 72.4%');
    await expect(page.locator('.hero-stats')).toContainText('5,432.8');
  });
}

test('empty sales snapshots render an empty state and can be retried', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await signIn(page);
  await page.evaluate(async () => {
    const modulePath = '/src/services/workbench/index.ts';
    const { workbenchRepository } = await import(modulePath) as typeof import('../../src/services/workbench');
    const original = workbenchRepository.getSales;
    let attempts = 0;
    workbenchRepository.getSales = async period => ++attempts > 1
      ? original(period)
      : {
        sales: 0,
        orders: 0,
        rate: 0,
        deltas: [],
        trendLabels: [],
        trend: [],
        trendSub: '暂无销售记录',
        cats: [],
        catAmts: [],
        rank: [],
      };
  });
  await page.locator('#sales-entry').click();
  await expect(page.getByRole('heading', { name: '暂无数据', exact: true })).toBeVisible();
  await expect(page.locator('.echarts')).toHaveCount(0);
  await page.getByRole('button', { name: '重新筛选', exact: true }).click();
  await expect(page.locator('.kpi').first()).toContainText('186.5');
  await expect(page.locator('.echarts').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('period changes show loading until the new snapshot is available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await signIn(page);
  await page.evaluate(async () => {
    const modulePath = '/src/services/workbench/index.ts';
    const { workbenchRepository } = await import(modulePath) as typeof import('../../src/services/workbench');
    const original = workbenchRepository.getSales;
    workbenchRepository.getSales = async (period) => {
      if (period === 'week') {
        await new Promise<void>((resolve) => {
          Reflect.set(window, 'finishWeekSalesRequest', resolve);
        });
      }
      return original(period);
    };
  });
  await page.locator('#sales-entry').click();
  await expect(page.locator('.kpi').first()).toContainText('186.5');
  await page.getByRole('button', { name: '本周', exact: true }).click();
  await expect(page.getByRole('button', { name: '本周', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => typeof Reflect.get(window, 'finishWeekSalesRequest'))).toBe('function');
  await expect(page.getByText('正在加载数据，通常不超过 1 秒')).toBeVisible();
  await expect(page.locator('.kpi')).toHaveCount(0);
  await page.evaluate(() => {
    const finish = Reflect.get(window, 'finishWeekSalesRequest') as () => void;
    finish();
  });
  await expect(page.locator('.data-state')).toHaveCount(0);
  await expect(page.locator('.kpi').first()).toContainText('1,286.4');
  await expect(page.locator('.rank-row').first()).toContainText('161.2');
});

test('empty line series produce finite chart bounds', async ({ page }) => {
  await signIn(page);
  const bounds = await page.evaluate(async () => {
    const modulePath = '/src/components/workbench/chartOptions.ts';
    const { lineOption } = await import(modulePath) as typeof import('../../src/components/workbench/chartOptions');
    const { min, max, interval } = lineOption([], []).yAxis as { min: number, max: number, interval: number };
    return {
      finite: [min, max, interval].every(Number.isFinite),
      ordered: min < max,
      positiveInterval: interval > 0,
    };
  });
  expect(bounds).toEqual({ finite: true, ordered: true, positiveInterval: true });
});

test('Quasar and chart options use the shared design palette', async ({ page }) => {
  await signIn(page, '/goals');
  await expect(page.locator('.q-linear-progress').first()).toBeVisible();
  const result = await page.evaluate(async () => {
    const chartModulePath = '/src/components/workbench/chartOptions.ts';
    const { lineOption, categoryOption } = await import(chartModulePath) as typeof import('../../src/components/workbench/chartOptions');
    const styles = getComputedStyle(document.documentElement);
    const sample = document.createElement('span');
    sample.hidden = true;
    document.body.append(sample);
    function normalize(color: string) {
      sample.style.color = color;
      return getComputedStyle(sample).color;
    }
    function lineColor() {
      return (lineOption([1, 2], ['1', '2']).series as { lineStyle: { color: string } }[])[0]!.lineStyle.color;
    }
    const accent = normalize(styles.getPropertyValue('--accent'));
    const progress = document.querySelector('.q-linear-progress')!;
    const consistent = {
      quasar: normalize(styles.getPropertyValue('--q-primary')) === accent,
      progress: getComputedStyle(progress).color === accent,
      line: normalize(lineColor()) === accent,
      categories: (categoryOption([42, 23, 14, 13, 8], 100).color as string[]).every((color, index) => normalize(color) === normalize(styles.getPropertyValue(`--cat-${index + 1}`))),
    };
    document.documentElement.style.setProperty('--accent', '#123456');
    document.documentElement.style.setProperty('--cat-2', '#654321');
    const followsTokens = {
      line: normalize(lineColor()) === normalize('#123456'),
      category: normalize((categoryOption([42, 23, 14, 13, 8], 100).color as string[])[1]!) === normalize('#654321'),
    };
    sample.remove();
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--cat-2');
    return { consistent, followsTokens };
  });
  expect(result).toEqual({
    consistent: {
      quasar: true,
      progress: true,
      line: true,
      categories: true,
    },
    followsTokens: { line: true, category: true },
  });
});
