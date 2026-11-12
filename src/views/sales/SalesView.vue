<script setup lang="ts">
import type { Period } from '@/services/workbench/types';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppIcon from '@/components/workbench/AppIcon.vue';
import { categoryOption, lineOption } from '@/components/workbench/chartOptions';
import CustomerRanking from '@/components/workbench/CustomerRanking.vue';
import DataState from '@/components/workbench/DataState.vue';
import MetricCard from '@/components/workbench/MetricCard.vue';
import { readWorkbenchTheme } from '@/components/workbench/theme';
import WorkbenchChart from '@/components/workbench/WorkbenchChart.vue';
import { useWorkbenchData } from '@/composables/useWorkbenchData';
import { useWorkbenchNavigation } from '@/composables/useWorkbenchNavigation';
import { formatAmount, workbenchRepository } from '@/services/workbench';
import { CATS } from '@/services/workbench/mock';
import { useSalesStore } from '@/stores/sales';

const theme = readWorkbenchTheme();
const route = useRoute();
const router = useRouter();
const { path } = useWorkbenchNavigation();
const sales = useSalesStore();
const periods: { value: Period, label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
];
const backButton = ref<HTMLButtonElement>();
const { data, loading, error, forbidden, load } = useWorkbenchData(() => workbenchRepository.getSales(sales.period));
const empty = computed(() => data.value !== undefined
  && data.value.sales === 0 && data.value.orders === 0
  && data.value.trend.length === 0 && data.value.rank.length === 0
  && data.value.cats.length === 0 && data.value.catAmts.length === 0);
const trend = computed(() => {
  const snapshot = data.value;
  return (width: number) => lineOption(snapshot?.trend ?? [], snapshot?.trendLabels ?? [], false, width);
});
const category = computed(() => {
  const snapshot = data.value;
  return (width: number) => categoryOption(snapshot?.cats ?? [], snapshot?.sales ?? 0, width);
});
watch(() => route.query.period, (value) => {
  if (periods.some(item => item.value === value))
    sales.period = value as Period;
  void load();
}, { immediate: true });
function setPeriod(period: Period) {
  sales.period = period;
  void router.replace({
    query: { period },
  });
}
function back() {
  void router.push({
    path: path('workbench'),
    state: { salesReturn: true },
  });
}
function escape(event: KeyboardEvent) {
  if (event.key === 'Escape' && !document.querySelector('.q-dialog'))
    back();
}
onMounted(() => {
  backButton.value?.focus();
  document.addEventListener('keydown', escape);
});
onUnmounted(() => document.removeEventListener('keydown', escape));
</script>

<template>
  <section class="screen sales-screen enter" aria-label="销售数据看板">
    <header class="sub-head">
      <nav class="crumbs" aria-label="所在位置">
        <RouterLink :to="path('workbench')">工作台</RouterLink><span class="crumb-sep">/</span><span aria-current="page">销售数据</span>
      </nav>
      <div class="head-row">
        <button ref="backButton" class="back-btn" type="button" aria-label="返回工作台" @click="back">
          <AppIcon name="back" />
        </button>
        <h1 class="page-title">
          销售数据
        </h1>
        <div class="seg seg-sub" role="group" aria-label="统计周期">
          <button v-for="item in periods" :key="item.value" class="seg-btn" type="button" :aria-pressed="sales.period === item.value" @click="setPeriod(item.value)">
            {{ item.label }}
          </button>
        </div>
      </div>
    </header>
    <div class="page-body">
      <DataState v-if="loading || error || !data || empty" :loading="loading" :error="error" :forbidden="forbidden" @retry="load" />
      <template v-else>
        <div class="kpi-grid">
          <MetricCard label="销售额" :value="data.sales" unit="万元" :delta="data.deltas[0]" />
          <MetricCard label="订单量" :value="data.orders" unit="单" kind="integer" :delta="data.deltas[1]" />
          <MetricCard label="目标完成率" :value="data.rate" unit="%" kind="rate" :delta="data.deltas[2]" />
        </div>
        <QCard flat bordered class="card trend-card">
          <div class="card-head">
            <h2 class="card-title">
              销售趋势
            </h2><span class="card-sub">{{ data.trendSub }}</span>
          </div><WorkbenchChart class="chart" adaptive-height :option="trend" :label="`${data.trendSub}，${data.trend.join('、')}万元`" />
        </QCard>
        <QCard flat bordered class="card category-card">
          <div class="card-head">
            <h2 class="card-title">
              品类销售结构
            </h2><span class="card-sub">按销售额占比</span>
          </div>
          <div class="donut-row">
            <WorkbenchChart class="donut-chart" :option="category" label="品类销售占比环形图" /><div class="legend">
              <div v-for="(cat, index) in CATS" :key="cat.name" class="legend-item">
                <span class="legend-dot" :style="{ background: theme.categories[index] }" /><span class="legend-name">{{ cat.name }}</span><span class="legend-val num"><strong>{{ data.cats[index] }}%</strong><small>{{ formatAmount(data.catAmts[index] ?? 0) }}万</small></span>
              </div>
            </div>
          </div>
        </QCard>
        <CustomerRanking :rank="data.rank" />
      </template>
    </div>
  </section>
</template>
