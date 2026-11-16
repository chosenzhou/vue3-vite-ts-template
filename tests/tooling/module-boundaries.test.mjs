import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ESLint } from 'eslint';

const eslint = new ESLint();

async function boundaryErrors(filePath, source) {
  const [result] = await eslint.lintText(source, { filePath });
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
  return result.messages.filter(message => message.ruleId === 'template/module-boundaries');
}

test('HTTP rejects router, session and business dependencies through aliases and relative paths', async () => {
  for (const source of [
    'import \'@/router\';',
    'import \'../stores/session\';',
    'import \'./api/user\';',
    'export * from \'@/services/auth\';',
    'void import(\'../services/../router/index.ts\');',
    'import { useRouter } from \'vue-router\';',
  ]) {
    assert.equal((await boundaryErrors('src/services/http.ts', source)).length, 1, source);
  }
});

test('API rejects session, navigation and auth coordination, including nested modules', async () => {
  for (const [filePath, source] of [
    ['src/services/api/user.ts', 'import \'@/stores/session\';'],
    ['src/services/api/user.ts', 'export { signIn } from \'../auth\';'],
    ['src/services/api/user.ts', 'void import(\'../../router\');'],
    ['src/services/api/reports/detail.ts', 'import \'../../../stores/session.ts\';'],
    ['src/services/api/index.ts', 'export * from \'../auth\';'],
  ]) {
    assert.equal((await boundaryErrors(filePath, source)).length, 1, source);
  }
});

test('auth coordination rejects routing dependencies', async () => {
  for (const source of ['import \'@/router\';', 'import \'../router/index\';', 'void import(\'vue-router\');']) {
    assert.equal((await boundaryErrors('src/services/auth.ts', source)).length, 1, source);
  }
});

test('legitimate model, request, store and application wiring imports remain allowed', async () => {
  for (const [filePath, source] of [
    ['src/services/http.ts', 'import adapterFetch from \'alova/fetch\';'],
    ['src/services/http.ts', 'import type { AuthResponse } from \'./model/auth\';'],
    ['src/services/api/auth.ts', 'import { request } from \'../http\';'],
    ['src/services/api/user.ts', 'import type { UserProfile } from \'../model/user\';'],
    ['src/services/auth.ts', 'import { useSessionStore } from \'@/stores/session\';'],
    ['src/main.ts', 'import router from \'./router\';'],
    ['src/main.ts', 'import { useSessionStore } from \'@/stores/session\';'],
  ]) {
    assert.equal((await boundaryErrors(filePath, source)).length, 0, source);
  }
});
