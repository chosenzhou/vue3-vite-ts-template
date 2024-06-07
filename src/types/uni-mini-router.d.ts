declare module 'uni-mini-router' {
  interface Route {
    meta?: {
      ignoreAuth?: boolean
      tabBar?: boolean
    }
  }
}
