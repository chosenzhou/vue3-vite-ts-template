import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    preview?: boolean
    workbench?: boolean
    requiresAuth?: boolean
    title?: string
  }
}
