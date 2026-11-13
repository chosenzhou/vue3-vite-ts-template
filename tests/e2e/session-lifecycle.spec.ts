import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const user = { id: '1', displayName: '测试用户' };

async function signIn(page: Page, token = 'account-session', displayName = user.displayName) {
  await page.route('**/auth/login', route => route.fulfill({
    json: {
      token,
      user: { ...user, displayName },
    },
  }));
  await page.goto('/login');
  await page.getByLabel('账号', { exact: true }).fill('alice');
  await page.getByLabel('密码', { exact: true }).fill('correct-password');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByText(displayName, { exact: true })).toBeVisible();
}

test('validates the stored credential before revealing the protected page after reload', async ({ page }) => {
  await signIn(page);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let authorization: string | undefined;
  await page.route('**/users/me', async (route) => {
    authorization = route.request().headers().authorization;
    await pending;
    await route.fulfill({ json: user });
  });
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('正在恢复会话…', { timeout: 3000 });
  await expect(page.getByRole('heading', { name: '首页', exact: true })).toHaveCount(0);
  release();
  await expect(page.getByText(user.displayName, { exact: true })).toBeVisible();
  await expect(page).toHaveURL('/');
  expect(authorization).toBe('Bearer account-session');
});

test('clears an expired credential while preserving the original address on reload', async ({ page }) => {
  await signIn(page);
  await page.route('**/users/me', route => route.fulfill({
    status: 401,
    json: { message: 'session expired' },
  }));
  await page.goto('/?tab=account#details');
  await expect(page.getByLabel('账号', { exact: true })).toBeVisible();
  const redirect = new URL(page.url()).searchParams.get('redirect');
  expect(redirect).toBe('/?tab=account#details');
  expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('account-session');
  await expect(page.getByText(user.displayName, { exact: true })).toHaveCount(0);
});

for (const failure of ['network', 'server', 'invalid-user']) {
  test(`keeps the pending credential and original target retryable after a ${failure} restore failure`, async ({ page }) => {
    await signIn(page);
    let requests = 0;
    await page.route('**/users/me', (route) => {
      requests += 1;
      if (requests > 1) {
        return route.fulfill({ json: user });
      }
      if (failure === 'network') {
        return route.abort('failed');
      }
      return route.fulfill({
        status: failure === 'server'
          ? 503
          : 200,
        json: failure === 'server'
          ? { message: 'unavailable' }
          : { id: '1' },
      });
    });
    await page.goto('/?section=profile#email');
    await expect(page.getByRole('alert')).toContainText('恢复会话失败');
    await expect(page.getByRole('heading', { name: '首页', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => Object.values(localStorage))).toContain('account-session');
    await page.getByRole('button', { name: '重试', exact: true }).click();
    await expect(page.getByText(user.displayName, { exact: true })).toBeVisible();
    await expect(page).toHaveURL('/?section=profile#email');
    expect(requests).toBe(2);
  });
}

test('ends the local session after a successful logout with no response body', async ({ page }) => {
  await signIn(page);
  let authorization: string | undefined;
  await page.route('**/auth/logout', (route) => {
    authorization = route.request().headers().authorization;
    return route.fulfill({ status: 204 });
  });
  await page.getByRole('button', { name: '退出登录', exact: true }).click({ timeout: 3000 });
  await expect(page.getByLabel('账号', { exact: true })).toBeVisible();
  expect(authorization).toBe('Bearer account-session');
  expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('account-session');
  await page.goto('/');
  await expect(page.getByLabel('账号', { exact: true })).toBeVisible();
});

test('does not let an old 401 clear a newer session even when the backend reuses the same token', async ({ page }) => {
  await signIn(page);
  let release!: () => void;
  let started!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requested = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route('**/protected/slow', async (route) => {
    started();
    await pending;
    await route.fulfill({
      status: 401,
      json: { message: 'old session expired' },
    });
  });
  const response = page.evaluate(async () => {
    const path = '/src/services/http.ts';
    const { request } = await import(path);
    try {
      await request.Get('/protected/slow').send();
      return 'success';
    }
    catch {
      return 'failed';
    }
  });
  await requested;
  await page.route('**/auth/logout', route => route.fulfill({ status: 204 }));
  await page.getByRole('button', { name: '退出登录', exact: true }).click();
  await page.route('**/auth/login', route => route.fulfill({
    json: {
      token: 'account-session',
      user: { id: '2', displayName: '新用户' },
    },
  }));
  await page.getByLabel('账号', { exact: true }).fill('bob');
  await page.getByLabel('密码', { exact: true }).fill('new-password');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByText('新用户', { exact: true })).toBeVisible();
  release();
  expect(await response).toBe('failed');
  await expect(page.getByText('新用户', { exact: true })).toBeVisible({ timeout: 3000 });
  await expect(page).toHaveURL('/');
  expect(await page.evaluate(() => Object.values(localStorage))).toContain('account-session');
});

test('validates the credential again when the page is closed and reopened', async ({ page, context }) => {
  await signIn(page);
  await page.close();
  const reopened = await context.newPage();
  let requests = 0;
  await reopened.route('**/users/me', (route) => {
    requests += 1;
    return route.fulfill({ json: user });
  });
  await reopened.goto('/');
  await expect(reopened.getByText(user.displayName, { exact: true })).toBeVisible();
  expect(requests).toBe(1);
});

for (const failure of ['network', 'server', 'unauthorized']) {
  test(`clears the local session immediately even when logout has a ${failure} failure`, async ({ page }) => {
    await signIn(page);
    let release!: () => void;
    let finished!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const completed = new Promise<void>((resolve) => {
      finished = resolve;
    });
    await page.route('**/auth/logout', async (route) => {
      await pending;
      if (failure === 'network') {
        await route.abort('failed');
      }
      else {
        await route.fulfill({
          status: failure === 'server'
            ? 503
            : 401,
        });
      }
      finished();
    });
    await page.getByRole('button', { name: '退出登录', exact: true }).click();
    await expect(page.getByLabel('账号', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('account-session');
    release();
    await completed;
    await page.goto('/');
    await expect(page.getByLabel('账号', { exact: true })).toBeVisible();
  });
}

test('coalesces concurrent validation of the same stored credential', async ({ page }) => {
  await signIn(page);
  await page.goto('/login');
  let release!: () => void;
  let started!: () => void;
  let requests = 0;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requested = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route('**/users/me', async (route) => {
    requests += 1;
    started();
    await pending;
    await route.fulfill({ json: user });
  });
  const restoration = page.evaluate(async () => {
    const path = '/src/services/auth.ts';
    const { restoreSession } = await import(path);
    const results = await Promise.all([
      restoreSession(),
      restoreSession(),
      restoreSession(),
    ]);
    const routerPath = '/src/router/index.ts';
    const { default: router } = await import(routerPath);
    await router.replace('/');
    return results;
  });
  await requested;
  release();
  expect(await restoration).toEqual([true, true, true]);
  expect(requests).toBe(1);
  await expect(page.getByText(user.displayName, { exact: true })).toBeVisible();
});

test('handles simultaneous protected 401 responses as one expired session', async ({ page }) => {
  await signIn(page);
  let release!: () => void;
  let requests = 0;
  let loginRequests = 0;
  let loginNavigations = 0;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('/auth/login')) {
      loginRequests += 1;
    }
  });
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame() && new URL(frame.url()).pathname === '/login') {
      loginNavigations += 1;
    }
  });
  await page.route('**/protected/*', async (route) => {
    requests += 1;
    await pending;
    await route.fulfill({
      status: 401,
      json: { message: 'expired' },
    });
  });
  const responses = page.evaluate(async () => {
    const path = '/src/services/http.ts';
    const { request } = await import(path);
    return (await Promise.allSettled([
      request.Get('/protected/first').send(),
      request.Get('/protected/second').send(),
    ])).map(result => result.status);
  });
  await expect.poll(() => requests).toBe(2);
  release();
  expect(await responses).toEqual(['rejected', 'rejected']);
  await expect(page.getByLabel('账号', { exact: true })).toBeVisible();
  expect(loginRequests).toBe(0);
  expect(loginNavigations).toBe(1);
  expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('account-session');
});

for (const loginAgain of [false, true]) {
  test(`does not restore an old user response after logout${loginAgain ? ' and a new login' : ''}`, async ({ page }) => {
    await signIn(page);
    await page.goto('/login');
    let release!: () => void;
    let started!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const requested = new Promise<void>((resolve) => {
      started = resolve;
    });
    await page.route('**/users/me', async (route) => {
      started();
      await pending;
      await route.fulfill({ json: user });
    });
    await page.route('**/auth/logout', route => route.fulfill({ status: 204 }));
    const restoration = page.evaluate(async () => {
      const path = '/src/services/auth.ts';
      const { restoreSession } = await import(path);
      return restoreSession();
    });
    await requested;
    await page.evaluate(async () => {
      const path = '/src/services/auth.ts';
      const { signOut } = await import(path);
      await signOut();
    });
    if (loginAgain) {
      await page.route('**/auth/login', route => route.fulfill({
        json: {
          token: 'new-session',
          user: { id: '2', displayName: '新用户' },
        },
      }));
      await page.getByLabel('账号', { exact: true }).fill('bob');
      await page.getByLabel('密码', { exact: true }).fill('example-credential');
      await page.getByRole('button', { name: '登录', exact: true }).click();
      await expect(page.getByText('新用户', { exact: true })).toBeVisible();
    }
    release();
    expect(await restoration).toBe(loginAgain);
    if (loginAgain) {
      await expect(page.getByText('新用户', { exact: true })).toBeVisible();
      await expect(page.getByText(user.displayName, { exact: true })).toHaveCount(0);
    }
    else {
      await expect(page.getByLabel('账号', { exact: true })).toBeVisible();
      expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('account-session');
    }
  });
}

test('does not reuse an old Authorization header when the same request is sent after logout', async ({ page }) => {
  await signIn(page);
  const authorizations: (string | undefined)[] = [];
  await page.route('**/protected/reused', (route) => {
    authorizations.push(route.request().headers().authorization);
    return route.fulfill({
      json: { ok: true },
    });
  });
  await page.route('**/auth/logout', route => route.fulfill({ status: 204 }));
  await page.evaluate(async () => {
    const httpPath = '/src/services/http.ts';
    const authPath = '/src/services/auth.ts';
    const { request } = await import(httpPath);
    const { signOut } = await import(authPath);
    const method = request.Get('/protected/reused');
    await method.send();
    await signOut();
    await method.send();
  });
  expect(authorizations).toEqual(['Bearer account-session', undefined]);
});

test('ignores a pending login after sign-out and does not resume its old navigation', async ({ page }) => {
  let release!: () => void;
  let started!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requested = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route('**/auth/login', async (route) => {
    started();
    await pending;
    await route.fulfill({
      json: { token: 'late-login-session', user },
    });
  });
  await page.goto('/login?redirect=/?old=1');
  await page.getByLabel('账号', { exact: true }).fill('alice');
  await page.getByLabel('密码', { exact: true }).fill('example-credential');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await requested;
  await page.evaluate(async () => {
    const path = '/src/services/auth.ts';
    const { signOut } = await import(path);
    await signOut();
  });
  release();
  await expect(page.getByRole('button', { name: '登录', exact: true })).toBeEnabled({ timeout: 3000 });
  await expect(page).toHaveURL('/login?redirect=/?old=1');
  expect(await page.evaluate(() => Object.values(localStorage))).not.toContain('late-login-session');
  await page.goto('/');
  await expect(page.getByLabel('账号', { exact: true })).toBeVisible();
});

test('does not overwrite a newer session when an earlier login returns last with the same token', async ({ page }) => {
  let release!: () => void;
  let started!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requested = new Promise<void>((resolve) => {
    started = resolve;
  });
  await page.route('**/auth/login', async (route) => {
    if (route.request().postDataJSON().username === 'alice') {
      started();
      await pending;
      await route.fulfill({
        json: { token: 'shared-session', user },
      });
      return;
    }
    await route.fulfill({
      json: {
        token: 'shared-session',
        user: { id: '2', displayName: '新用户' },
      },
    });
  });
  await page.goto('/login?redirect=/?old=1');
  const earlierLogin = page.evaluate(async () => {
    const path = '/src/services/auth.ts';
    const { signIn } = await import(path);
    return signIn({ username: 'alice', password: 'example-credential' });
  });
  await requested;
  const signedIn = await page.evaluate(async () => {
    const authPath = '/src/services/auth.ts';
    const routerPath = '/src/router/index.ts';
    const { signIn } = await import(authPath);
    const { default: router } = await import(routerPath);
    const result = await signIn({ username: 'bob', password: 'example-credential' });
    await router.replace('/?new=1');
    return result;
  });
  expect(signedIn).toBe(true);
  await expect(page.getByText('新用户', { exact: true })).toBeVisible();
  release();
  expect(await earlierLogin).toBe(false);
  await expect(page).toHaveURL('/?new=1');
  await expect(page.getByText('新用户', { exact: true })).toBeVisible();
  await expect(page.getByText(user.displayName, { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => Object.values(localStorage))).toContain('shared-session');
});
