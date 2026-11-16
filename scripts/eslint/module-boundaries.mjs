import { dirname, relative, resolve, sep } from 'node:path';

const sourceRoot = resolve(import.meta.dirname, '../../src');

function sourcePath(filename) {
  return relative(sourceRoot, filename).split(sep).join('/').replace(/\.(?:[cm]?[jt]sx?|vue)$/, '').replace(/\/index$/, '');
}

export default {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      boundary: '{{layer}} 不应依赖 {{source}}；通过应用初始化连接会话和导航，API 仅描述接口。',
    },
  },
  create(context) {
    const importer = sourcePath(context.physicalFilename);
    const http = importer === 'services/http';
    const api = importer === 'services/api' || importer.startsWith('services/api/');
    const auth = importer === 'services/auth';
    if (!http && !api && !auth) {
      return {};
    }

    function check(node) {
      const source = node?.value;
      if (typeof source !== 'string') {
        return;
      }
      const local = source.startsWith('@/')
        ? resolve(sourceRoot, source.slice(2))
        : source.startsWith('.')
          ? resolve(dirname(context.physicalFilename), source)
          : undefined;
      const target = local
        ? sourcePath(local.split(/[?#]/)[0])
        : '';
      const routing = /^vue-router(?:\/|$)/.test(source)
        || target === 'router' || target.startsWith('router/');
      const store = /^pinia(?:\/|$)/.test(source)
        || target === 'stores' || target.startsWith('stores/');
      const service = target === 'services' || target.startsWith('services/');
      const model = target === 'services/model' || target.startsWith('services/model/');
      const forbidden = routing || ((http || api) && store)
        || (http && service && !model && target !== 'services/http')
        || (api && (target === 'services/auth' || target === 'services'));
      if (forbidden) {
        context.report({
          node,
          messageId: 'boundary',
          data: {
            layer: http
              ? 'HTTP 客户端'
              : api ? 'API 模块' : '认证协调层',
            source,
          },
        });
      }
    }

    return {
      ImportDeclaration: node => check(node.source),
      ExportAllDeclaration: node => check(node.source),
      ExportNamedDeclaration: node => check(node.source),
      ImportExpression: node => check(node.source),
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          check(node.arguments[0]);
        }
      },
    };
  },
};
