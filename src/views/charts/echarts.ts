import { use } from 'echarts/core';

let registered: Promise<void> | null = null;

export async function setupEcharts() {
  registered ??= Promise.all([
    import('echarts/renderers'),
    import('echarts/charts'),
    import('echarts/components'),
  ]).then(([
    { CanvasRenderer },
    { BarChart },
    { GridComponent, TooltipComponent },
  ]) => {
    use([
      CanvasRenderer,
      BarChart,
      GridComponent,
      TooltipComponent,
    ]);
  });

  return registered;
}
