// ECharts canvas colors are resolved from the same CSS tokens used by the UI.
export function readWorkbenchTheme() {
  const styles = getComputedStyle(document.documentElement);
  const color = (token: string) => styles.getPropertyValue(token).trim();
  return {
    font: color('--font'),
    accent: color('--accent'),
    background: color('--bg'),
    surface: color('--surface'),
    foreground: color('--fg'),
    muted: color('--muted'),
    chartArea: color('--chart-area'),
    chartGrid: color('--chart-grid'),
    categories: [1, 2, 3, 4, 5].map(index => color(`--cat-${index}`)),
  };
}
