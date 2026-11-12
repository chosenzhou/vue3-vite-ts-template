function safeRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }
  return value;
}

export function buildState(redirect: string) {
  return btoa(JSON.stringify({
    redirect: safeRedirect(redirect),
    nonce: crypto.randomUUID(),
  }));
}

export function readState(state: string | null | undefined) {
  const fallback = { redirect: '/', nonce: '' };
  if (!state) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(atob(state)) as typeof fallback;
    return {
      redirect: safeRedirect(parsed.redirect),
      nonce: parsed.nonce || '',
    };
  }
  catch {
    return fallback;
  }
}
