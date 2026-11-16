export function safeRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')
    || value.includes('\\') || [...value].some(character => character.charCodeAt(0) <= 32)) {
    return '/';
  }

  try {
    const target = new URL(value, window.location.origin);
    const path = decodeURIComponent(target.pathname).replace(/\/+$/, '').toLowerCase();
    if (target.origin !== window.location.origin || path === '/login') {
      return '/';
    }
    return `${target.pathname}${target.search}${target.hash}`;
  }
  catch {
    return '/';
  }
}
