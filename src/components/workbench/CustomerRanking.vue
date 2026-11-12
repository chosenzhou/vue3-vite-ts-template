<script setup lang="ts">
import type { CustomerSales } from '@/services/workbench/types';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { formatAmount, formatInteger } from '@/services/workbench';
import AppIcon from './AppIcon.vue';
import { lineOption } from './chartOptions';
import WorkbenchChart from './WorkbenchChart.vue';

const props = defineProps<{ rank: CustomerSales[] }>();
const expanded = ref(false);
const selected = ref<number | null>(null);
const quasar = useQuasar();
const detail = computed(() => selected.value === null
  ? null
  : { customer: props.rank[selected.value]?.customer, sales: props.rank[selected.value] });
const dialogOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value)
      selected.value = null;
  },
});
watch(() => props.rank, () => {
  expanded.value = false;
  selected.value = null;
});
</script>

<template>
  <QCard flat bordered class="card ranking-card">
    <div class="card-head">
      <h2 class="card-title">
        重点客户榜
      </h2><span class="card-sub">按销售额 · 点击查看详情</span>
    </div>
    <div class="rank-list">
      <button v-for="(row, index) in expanded ? rank : rank.slice(0, 5)" :key="index" type="button" class="rank-row" :aria-label="`查看${row.customer.name}详情`" @click="selected = index">
        <span class="rank-no num" :class="`r${index + 1}`">{{ index + 1 }}</span>
        <span class="rank-main"><span class="rank-name od-truncate">{{ row.customer.name }}</span><span class="rank-cat">{{ row.customer.cat }}</span></span>
        <span class="rank-side"><span class="rank-amt num">{{ formatAmount(row.amt) }} 万</span><span class="rank-delta num" :class="row.delta >= 0 ? 'up' : 'down'">{{ row.delta >= 0 ? '↑' : '↓' }} {{ Math.abs(row.delta).toFixed(1) }}%</span></span>
        <span class="rank-ord num">{{ formatInteger(row.orders) }} 单</span><span class="rank-rate num">{{ row.rate }}%</span><AppIcon class="rank-chev" name="chevron" />
      </button>
    </div>
    <button v-if="rank.length > 5" class="rank-more" type="button" :aria-expanded="expanded" @click="expanded = !expanded">
      {{ expanded ? '收起' : `查看全部 ${rank.length} 家客户` }}
    </button>
    <QDialog v-model="dialogOpen" :position="quasar.screen.width >= 1024 ? 'standard' : 'bottom'" aria-labelledby="customer-title">
      <QCard v-if="detail?.customer && detail.sales" flat class="customer-dialog">
        <div class="sheet-grip" />
        <div class="sheet-head">
          <div class="sheet-title-row">
            <h2 id="customer-title" class="sheet-title">
              {{ detail.customer.name }}
            </h2><span class="sheet-chip">{{ detail.customer.cat }}</span>
          </div>
          <button class="sheet-close" type="button" aria-label="关闭" autofocus @click="dialogOpen = false">
            <AppIcon name="close" />
          </button>
        </div>
        <p class="sheet-sec-label">
          近7日销售走势（万元）
        </p>
        <WorkbenchChart class="chart" :option="width => lineOption(detail!.customer!.spark.map(v => v * detail!.sales!.amt), ['1', '2', '3', '4', '5', '6', '7'], true, width)" label="近7日客户销售走势" />
        <div class="sheet-stats">
          <div class="hs">
            <span class="hs-label">本期销售额</span><span class="hs-value num">{{ formatAmount(detail.sales.amt) }} 万元</span>
          </div>
          <div class="hs">
            <span class="hs-label">订单量</span><span class="hs-value num">{{ formatInteger(detail.sales.orders) }} 单</span>
          </div>
          <div class="hs">
            <span class="hs-label">客单价</span><span class="hs-value num">¥{{ formatInteger(detail.sales.amt * 10000 / detail.sales.orders) }}</span>
          </div>
          <div class="hs">
            <span class="hs-label">目标完成率</span><span class="hs-value num">{{ detail.sales.rate }}%</span>
          </div>
        </div>
        <p class="sheet-note">
          演示数据，用于原型交互展示
        </p>
      </QCard>
    </QDialog>
  </QCard>
</template>
