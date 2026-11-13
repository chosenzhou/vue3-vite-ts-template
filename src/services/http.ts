import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import vueHook from 'alova/vue';

interface HttpAuthOptions {
  getToken: () => string | null
  onUnauthorized: () => void | Promise<void>
}

let authOptions: HttpAuthOptions | undefined;

export function configureHttpAuth(options: HttpAuthOptions) {
  authOptions = options;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    const message = body && typeof body === 'object' && 'message' in body
      && typeof body.message === 'string'
      ? body.message
      : `HTTP ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export const request = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  statesHook: vueHook,
  requestAdapter: adapterFetch(),
  timeout: 10000,
  cacheFor: { GET: 0 },
  shareRequest: false,
  beforeRequest(method) {
    if (method.meta?.auth === false) {
      return;
    }
    const token = authOptions?.getToken();
    if (token) {
      method.config.headers.Authorization = `Bearer ${token}`;
    }
  },
  async responded(response, method) {
    const payload: unknown = response.status === 204
      ? undefined
      : await response.json().catch(() => undefined);

    if (response.status === 401 && method.meta?.auth !== false) {
      await authOptions?.onUnauthorized();
    }

    if (!response.ok) {
      throw new ApiError(response.status, payload);
    }
    return payload;
  },
});
