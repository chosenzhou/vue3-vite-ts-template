import 'alova';

declare module 'alova' {
  interface AlovaCustomTypes {
    meta: {
      auth?: boolean
      authVersion?: number
    }
  }
}
