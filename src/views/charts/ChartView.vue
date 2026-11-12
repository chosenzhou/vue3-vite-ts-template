<script setup lang="ts">
import { onMounted, ref } from 'vue';
import VChart from 'vue-echarts';

const chartReady = ref(false);

onMounted(async () => {
  await import('./echarts').then(({ setupEcharts }) => setupEcharts());
  chartReady.value = true;
});

const option = {
  tooltip: {},
  xAxis: {
    type: 'category',
    data: [
      '周一',
      '周二',
      '周三',
      '周四',
      '周五',
      '周六',
      '周日',
    ],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '访问量',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110, 130],
    },
  ],
};
</script>

<template>
  <QPage class="page-content">
    <QCard>
      <QCardSection>
        <div class="text-h6">
          访问量
        </div>
      </QCardSection>
      <QSeparator />
      <QCardSection>
        <VChart
          v-if="chartReady"
          class="chart"
          :option="option"
          autoresize
        />
      </QCardSection>
    </QCard>
  </QPage>
</template>

<style scoped lang="scss">
.chart {
  width: 100%;
  height: clamp(280px, 45vw, 480px);
}
</style>
