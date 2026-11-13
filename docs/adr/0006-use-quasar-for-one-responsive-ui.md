The client scope and default chart dependency below are superseded by [ADR-0008](./0008-generic-h5-starter-scope.md); the Quasar and SCSS choice remains in effect.

The template will use the Quasar Vite plugin with Quasar components and SCSS for one responsive UI across phone and desktop WeCom browsers. Quasar replaces Vant and UnoCSS because the template's interface needs broad form, table, layout, and feedback coverage rather than a mobile-only component set plus a second desktop implementation. ECharts remains the charting library.
