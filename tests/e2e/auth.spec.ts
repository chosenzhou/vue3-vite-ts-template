import { expect, test } from '@playwright/test';

test.describe('WeCom authentication boundary', () => {
  test('redirects an unauthenticated profile visit to the authorization entry', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/\?redirect=\/profile&auth=required/);
    await expect(page.getByText('企业微信工作台 H5')).toBeVisible();
  });

  test('starts authorization through the backend-owned entry', async ({ page }) => {
    let entryRequest: unknown;

    await page.route('**/auth/entry', (route) => {
      entryRequest = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authorizationUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=corp-id' }),
      });
    });

    await page.route('https://open.weixin.qq.com/**', route => route.fulfill({ body: 'OAuth destination' }));
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

    await page.route('https://example.com/oauth**', route => route.fulfill({ body: 'OAuth destination' }));
    await page.goto(`/auth/callback/wecom?code=oauth-code&state=${encodeURIComponent(state)}`);

    await expect(page).toHaveURL(/appid=corp-id/);
  });
});
