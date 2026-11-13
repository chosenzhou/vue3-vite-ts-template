import type { LoginRequest } from '@/services/model/auth';
import type { UserProfile } from '@/services/model/user';
import { loginWithPassword, logout } from '@/services/api/auth';
import { getCurrentUser } from '@/services/api/user';
import { useSessionStore } from '@/stores/session';

let pendingRestore: { version: number, promise: Promise<boolean> } | undefined;

function validUser(user: UserProfile | undefined): user is UserProfile {
  return typeof user?.id === 'string' && Boolean(user.id.trim())
    && typeof user.displayName === 'string' && Boolean(user.displayName.trim());
}

export async function signIn(credentials: LoginRequest) {
  const response = await loginWithPassword(credentials);
  if (typeof response?.token !== 'string' || !response.token.trim()
    || !validUser(response.user)) {
    throw new Error('登录响应无效，请重试。');
  }
  useSessionStore().setSession(response.token, response.user);
}

export function restoreSession(): Promise<boolean> {
  const session = useSessionStore();
  if (session.loggedIn) {
    return Promise.resolve(true);
  }
  if (!session.token) {
    return Promise.resolve(false);
  }
  if (pendingRestore?.version === session.version) {
    return pendingRestore.promise;
  }

  const version = session.version;
  session.beginRestore();
  const promise = (async () => {
    try {
      const user = await getCurrentUser();
      if (session.version !== version) {
        return session.loggedIn;
      }
      if (!validUser(user)) {
        throw new Error('用户响应无效，请重试。');
      }
      session.completeRestore(user);
      return true;
    }
    catch (error) {
      if (session.version !== version) {
        return session.loggedIn;
      }
      session.failRestore('恢复会话失败，请重试。');
      throw error;
    }
    finally {
      if (pendingRestore?.version === version) {
        pendingRestore = undefined;
      }
    }
  })();
  pendingRestore = { version, promise };
  return promise;
}

export async function signOut() {
  const session = useSessionStore();
  const token = session.token;
  session.clearSession();
  if (token) {
    await logout(token).catch(() => undefined);
  }
}

export function invalidateSession(version: number) {
  const session = useSessionStore();
  if (!session.token || session.version !== version) {
    return false;
  }
  session.clearSession();
  return true;
}
