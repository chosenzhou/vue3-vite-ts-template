import { use } from 'echarts/core';

let registered: Promise<void> | null = null;

export async function setupEcharts() {
  registered ??= Promise.all([
    import('echarts/renderers'),
    import('echarts/charts'),
    import('echarts/components'),
  ]).then(([
    { CanvasRenderer },
    { BarChart, LineChart, PieChart },
    { GridComponent, TooltipComponent, GraphicComponent },
  ]) => {
    use([
      CanvasRenderer,
      BarChart,
      LineChart,
      PieChart,
      GridComponent,
      GraphicComponent,
      TooltipComponent,
    ]);
  });

  return registered;
}
