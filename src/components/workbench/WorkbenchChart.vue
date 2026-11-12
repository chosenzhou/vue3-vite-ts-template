<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core';
import { computed, nextTick, onMounted, onScopeDispose, ref } from 'vue';
import VChart from 'vue-echarts';
import { setupEcharts } from '@/views/charts/echarts';

const props = defineProps<{ option: EChartsCoreOption | ((width: number) => EChartsCoreOption), label: string, adaptiveHeight?: boolean }>();
const chart = ref<InstanceType<typeof VChart>>();
const width = ref(0);
const ready = ref(false);
const error = ref('');
const resolvedOption = computed(() => typeof props.option === 'function'
  ? props.option(width.value)
  : props.option);
const style = computed(() => {
  if (!props.adaptiveHeight)
    return undefined;
  const viewBoxWidth = Math.max(300, Math.min(880, Math.round(width.value || 300)));
  const height = viewBoxWidth > 640
    ? 210
    : 172;
  return { height: `${width.value > 0
    ? height * width.value / viewBoxWidth
    : height}px` };
});
let observer: ResizeObserver | undefined;
let disposed = false;
onScopeDispose(() => {
  disposed = true;
  observer?.disconnect();
});
onMounted(async () => {
  try {
    await setupEcharts();
    if (disposed)
      return;
    ready.value = true;
    await nextTick();
    const element = chart.value?.$el as HTMLElement | undefined;
    if (!element || disposed)
      return;
    width.value = element.clientWidth;
    observer = new ResizeObserver(([entry]) => {
      if (entry)
        width.value = entry.contentRect.width;
    });
    observer.observe(element);
  }
  catch {
    error.value = '图表加载失败，请刷新页面重试';
  }
});
</script>

<template>
  <VChart v-if="ready" ref="chart" :option="resolvedOption" :style="style" :autoresize="{ throttle: 140 }" :init-options="{ renderer: 'canvas' }" role="img" :aria-label="label" />
  <div v-else class="chart" :style="style" role="status">
    <span v-if="error">{{ error }}</span><QSkeleton v-else height="100%" />
  </div>
</template>
