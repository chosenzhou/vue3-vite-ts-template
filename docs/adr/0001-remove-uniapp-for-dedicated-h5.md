The WeCom-only client scope below is superseded by [ADR-0008](./0008-generic-h5-starter-scope.md); the standard Vue H5 direction remains in effect.

The project is being rebuilt as a dedicated WeCom Workbench H5 template, so we will remove uni-app and use a standard Vite + Vue 3 + TypeScript browser stack. This removes multi-platform abstraction and limits the target to WeCom embedded browsers plus an ordinary development browser, but unlocks current Vue Router, Vite, Pinia, and request tooling without a custom router adapter.
