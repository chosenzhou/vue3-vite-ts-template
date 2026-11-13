export function resolveApiBaseURL(value?: string) {
  const baseURL = value?.trim() || '/api';
  if (/^https?:\/\//i.test(baseURL)) {
    const url = new URL(baseURL);
    if (url.username || url.password || url.search || url.hash) {
      throw new Error('VITE_API_BASE_URL 不能包含凭证、查询参数或 hash。');
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  }
  if (!baseURL.startsWith('/') || baseURL.startsWith('//') || /[\\\s?#]/.test(baseURL)) {
    throw new Error('VITE_API_BASE_URL 必须是以 / 开头的路径或 HTTP(S) 地址。');
  }
  const prefix = baseURL.replace(/\/+$/, '');
  if (!prefix) {
    throw new Error('VITE_API_BASE_URL 不能使用根路径，请设置 API 前缀。');
  }
  return prefix;
}
