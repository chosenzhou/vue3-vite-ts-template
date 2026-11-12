<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import DataState from '@/components/workbench/DataState.vue';
import GoalProgressList from '@/components/workbench/GoalProgressList.vue';
import PageHeader from '@/components/workbench/PageHeader.vue';
import { useWorkbenchData } from '@/composables/useWorkbenchData';
import { formatAmount, formatInteger, workbenchRepository } from '@/services/workbench';
import { useSalesStore } from '@/stores/sales';

const { data, loading, error, forbidden, load } = useWorkbenchData(() => workbenchRepository.getGoals());
const state = useSalesStore();
const ringValue = ref(0);
onMounted(load);
watch(() => data.value?.rate, (rate, _previousRate, onCleanup) => {
  if (rate === undefined)
    return;
  if (state.goalAnimationPlayed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ringValue.value = rate;
    return;
  }
  state.goalAnimationPlayed = true;
  let frame = 0;
  onCleanup(() => cancelAnimationFrame(frame));
  const targetRate = rate;
  const start = performance.now();
  function step(now: number) {
    const progress = Math.min((now - start) / 900, 1);
    ringValue.value = targetRate * (1 - (1 - progress) ** 3);
    if (progress < 1)
      frame = requestAnimationFrame(step);
  }
  frame = requestAnimationFrame(step);
});
</script>

<template>
  <section class="screen enter" aria-label="目标进度">
    <PageHeader title="目标进度" subtitle="2026年11月 · 月度目标" />
    <div class="page-body target-layout">
      <DataState v-if="loading || error || !data" :loading="loading" :error="error" :forbidden="forbidden" @retry="load" />
      <template v-else>
        <QCard flat bordered class="card hero-card" aria-label="月度目标总览">
          <div class="ring-wrap">
            <QCircularProgress show-value :value="ringValue" size="132px" :thickness="0.185" color="primary" track-color="workbench-border" rounded class="progress-ring" :aria-label="`月度目标完成率 ${data.rate}%`">
              <svg class="ring-caption" viewBox="0 0 132 132" aria-hidden="true">
                <text class="ring-value" x="66" y="62" text-anchor="middle" font-size="26" font-weight="700" fill="var(--fg)">{{ ringValue.toFixed(1) }}%</text>
                <text x="66" y="84" text-anchor="middle" font-size="11" fill="var(--muted)">目标完成率</text>
              </svg>
            </QCircularProgress>
            <div class="ring-side">
              <span class="forecast num">预测达成 {{ data.forecastRate }}% · 可按时达成</span><span class="hero-note">按当前日均 {{ data.daily }} 万元推算，11 月预计完成 <strong class="num">{{ formatInteger(data.forecast) }} 万</strong></span>
            </div>
          </div>
          <div class="hero-stats">
            <div class="hs">
              <span class="hs-label">月度目标</span><span class="hs-value num">{{ formatInteger(data.target) }} 万元</span>
            </div>
            <div class="hs">
              <span class="hs-label">已完成</span><span class="hs-value num">{{ formatAmount(data.done) }} 万元</span>
            </div>
            <div class="hs">
              <span class="hs-label">剩余目标</span><span class="hs-value num">{{ formatAmount(data.remaining) }} 万元</span>
            </div>
            <div class="hs">
              <span class="hs-label">剩余 {{ data.days }} 天 · 日均需完成</span><span class="hs-value num">{{ formatAmount(data.dailyRequired) }} 万元</span>
            </div>
          </div>
        </QCard>
        <div class="target-side">
          <GoalProgressList title="销售团队进度" :items="data.teams" /><GoalProgressList title="品类进度" :items="data.categories" />
        </div>
      </template>
    </div>
  </section>
</template>
