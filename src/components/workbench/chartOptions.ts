import type { EChartsCoreOption } from 'echarts/core';
import { formatAmount, formatInteger } from '@/services/workbench';
import { CATS } from '@/services/workbench/mock';

import { readWorkbenchTheme } from './theme';

export function lineOption(values: number[], labels: string[], mini = false, width = 0): EChartsCoreOption {
  const theme = readWorkbenchTheme();
  const large = width > 640;
  const axisFont = large ? 11 : 10;
  const min = values.length
    ? Math.min(...values)
    : 0;
  const max = values.length
    ? Math.max(...values)
    : 0;
  const span = max - min || 1;
  // The exported customer sparkline scales its entire 335×64 viewBox.
  const scale = mini && width > 0
    ? width / 335
    : 1;
  return {
    animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    animationDuration: 380,
    textStyle: { fontFamily: theme.font },
    grid: mini
      ? {
        left: 6 * scale,
        right: 52 * scale,
        top: 8 * scale,
        bottom: 8 * scale,
      }
      : {
        left: large ? 46 : 38,
        right: 12,
        top: 18,
        bottom: 28,
      },
    tooltip: {
      trigger: 'axis',
      triggerOn: 'click',
      backgroundColor: theme.foreground,
      borderWidth: 0,
      borderRadius: 6,
      textStyle: { color: theme.background, fontSize: 11 },
      valueFormatter: (value: unknown) => `${Number(value).toFixed(1)} 万元`,
    },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      show: !mini,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: theme.muted,
        fontSize: axisFont,
        margin: 11,
        interval: (index: number) => labels.length <= 6 || index % 2 === 0 || index === labels.length - 1,
        hideOverlap: false,
      },
    },
    yAxis: {
      type: 'value',
      show: !mini,
      min: min - span * (mini ? 0.2 : 0.35),
      max: max + span * (mini ? 0.2 : 0.12),
      splitNumber: 2,
      interval: span * 1.47 / 2,
      axisLabel: {
        color: theme.muted,
        fontSize: axisFont,
        margin: 6,
        formatter: (value: number) => formatInteger(value),
      },
      splitLine: {
        lineStyle: { color: theme.chartGrid },
      },
    },
    series: [
      {
        type: 'line',
        data: values.map((value, index) => ({
          value,
          ...(mini
            ? {
              symbol: index === values.length - 1
                ? 'circle'
                : 'none',
              label: {
                show: index === values.length - 1,
                position: 'right' as const,
                distance: 6.5 * scale,
                formatter: formatAmount(value),
                color: theme.foreground,
                fontSize: 12 * scale,
                fontWeight: 600,
              },
            }
            : {}),
          itemStyle: {
            color: index === values.length - 1
              ? theme.accent
              : theme.background,
          },
        })),
        smooth: false,
        symbol: 'circle',
        symbolSize: (_value: unknown, params: { dataIndex: number }) => mini
          ? 7 * scale
          : params.dataIndex === values.length - 1
            ? 8
            : 6,
        itemStyle: {
          color: theme.background,
          borderColor: theme.accent,
          borderWidth: mini ? 0 : 1.6,
        },
        lineStyle: {
          color: theme.accent,
          width: 2 * scale,
          ...(mini
            ? { cap: 'round' as const, join: 'round' as const }
            : {}),
        },
        areaStyle: { color: theme.chartArea, opacity: 1 },
      },
    ],
  };
}
export function categoryOption(percentages: number[], total: number, width = 108): EChartsCoreOption {
  const scale = width > 0
    ? width / 108
    : 1;
  const theme = readWorkbenchTheme();
  return {
    animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    color: theme.categories,
    textStyle: { fontFamily: theme.font },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
      backgroundColor: theme.foreground,
      textStyle: { color: theme.background, fontSize: 11 },
      borderWidth: 0,
    },
    series: [
      {
        type: 'pie',
        radius: ['62.037%', '86.111%'],
        padAngle: 5.04,
        center: ['50%', '50%'],
        startAngle: 90,
        clockwise: true,
        label: { show: false },
        itemStyle: { borderWidth: 0 },
        data: percentages.map((value, i) => ({ value, name: CATS[i]?.name })),
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '35%',
        style: { text: '本期销售额', fill: theme.muted, fontSize: 9.5 * scale },
      },
      {
        type: 'text',
        left: 'center',
        top: '52%',
        style: {
          text: `${formatInteger(total)}万`,
          fill: theme.foreground,
          fontSize: 15 * scale,
          fontWeight: 700,
        },
      },
    ],
  };
}
