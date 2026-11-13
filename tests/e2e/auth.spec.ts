import { expect, test } from '@playwright/test';

test.describe('WeCom authentication boundary', () => {
  test('shows an authorization-entry failure without retrying authentication recursively', async ({ page }) => {
    let entryRequests = 0;
    await page.route('**/auth/entry', (route) => {
      entryRequests += 1;
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: '授权服务不可用' }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: '进入应用' }).click();

    await expect(page.getByText('授权服务不可用')).toBeVisible();
    await expect(page.getByRole('button', { name: '进入应用' })).toBeEnabled();
    expect(entryRequests).toBe(1);
    await expect(page).toHaveURL('/');
  });

  test('shows the HTTP status when an authorization service returns a non-JSON error', async ({ page }) => {
    await page.route('**/auth/entry', route => route.fulfill({
      status: 503,
      contentType: 'text/plain',
      body: 'service unavailable',
    }));

    await page.goto('/');
    await page.getByRole('button', { name: '进入应用' }).click();

    await expect(page.getByText('HTTP 503')).toBeVisible();
    await expect(page.getByRole('button', { name: '进入应用' })).toBeEnabled();
  });

  test('uses the current credential for protected requests and exits after an empty logout response', async ({ page }) => {
    const state = btoa(JSON.stringify({ redirect: '/profile', nonce: 'test' }));
    const user = { id: '1', displayName: '已登录用户', provider: 'wecom' };
    let userAuthorization: string | undefined;
    let logoutAuthorization: string | undefined;

    await page.route('**/auth/wecom', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'example-token', user }),
    }));
    await page.route('**/users/me', (route) => {
      userAuthorization = route.request().headers().authorization;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user),
      });
    });
    await page.route('**/auth/logout', (route) => {
      logoutAuthorization = route.request().headers().authorization;
      return route.fulfill({ status: 204 });
    });

    await page.goto(`/auth/callback/wecom?code=oauth-code&state=${encodeURIComponent(state)}`);
    await expect(page.getByText('已登录用户')).toBeVisible();
    expect(userAuthorization).toBe('Bearer example-token');

    await page.getByRole('button', { name: '退出登录' }).click();

    await expect(page).toHaveURL('/');
    expect(logoutAuthorization).toBe('Bearer example-token');
    expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('example-token');
  });

  test('redirects an unauthenticated profile visit to the authorization entry', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/\?redirect=\/profile&auth=required/);
    await expect(page.getByText('企业微信工作台 H5')).toBeVisible();
  });

  test('starts authorization through the backend-owned entry', async ({ page }) => {
    let entryRequest: unknown;

    await page.route('https://open.weixin.qq.com/connect/oauth2/authorize?**', route => route.fulfill({
      contentType: 'text/html',
      body: '<p>Authorization destination</p>',
    }));
    await page.route('**/auth/entry', (route) => {
      entryRequest = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authorizationUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=corp-id' }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: '进入应用' }).click();

    await expect(page).toHaveURL(/appid=corp-id/);
    expect(entryRequest).toEqual({ redirect: '/profile' });
  });

  test('completes a WeCom OAuth callback and loads the profile', async ({ page }) => {
    const state = btoa(JSON.stringify({ redirect: '/profile', nonce: 'test' }));

    await page.route('**/auth/wecom', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'wecom-session-token',
        user: {
          id: '1',
          displayName: '企业微信用户',
          provider: 'wecom',
        },
      }),
    }));
    await page.route('**/users/me', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        displayName: '企业微信用户',
        provider: 'wecom',
      }),
    }));

    await page.goto(`/auth/callback/wecom?code=oauth-code&state=${encodeURIComponent(state)}`);

    await expect(page).toHaveURL('/profile');
    await expect(page.getByText('企业微信用户')).toBeVisible();
  });

  test('clears the session and restarts authentication when the API returns 401', async ({ page }) => {
    const state = btoa(JSON.stringify({ redirect: '/profile', nonce: 'test' }));

    await page.route('https://example.com/oauth?**', route => route.fulfill({
      contentType: 'text/html',
      body: '<p>Authorization destination</p>',
    }));
    await page.route('**/auth/wecom', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'expired-token',
        user: {
          id: '1',
          displayName: '企业微信用户',
          provider: 'wecom',
        },
      }),
    }));
    await page.route('**/users/me', route => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'session expired' }),
    }));
    await page.route('**/auth/entry', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authorizationUrl: 'https://example.com/oauth?appid=corp-id' }),
    }));

    await page.goto(`/auth/callback/wecom?code=oauth-code&state=${encodeURIComponent(state)}`);

    await expect(page).toHaveURL(/appid=corp-id/);
  });
});
