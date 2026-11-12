<script setup lang="ts">
import { Notify } from 'quasar';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '@/components/workbench/AppIcon.vue';
import DataState from '@/components/workbench/DataState.vue';
import PageHeader from '@/components/workbench/PageHeader.vue';
import { useWorkbenchData } from '@/composables/useWorkbenchData';
import { useWorkbenchNavigation } from '@/composables/useWorkbenchNavigation';
import { formatAmount, formatInteger, workbenchRepository } from '@/services/workbench';

const router = useRouter();
const { path } = useWorkbenchNavigation();
const { data, loading, error, forbidden, load } = useWorkbenchData(() => workbenchRepository.getSales('month'));
onMounted(() => {
  void load();
  if (history.state.salesReturn)
    document.getElementById('sales-entry')?.focus();
});
const modules = [
  {
    key: 'sales',
    name: '销售数据',
    desc: '销售额 · 订单 · 完成率',
    state: '',
  },
  {
    key: 'stock',
    name: '库存数据',
    desc: '库存量 · 周转 · 效期',
    state: 'building',
  },
  {
    key: 'purchase',
    name: '采购数据',
    desc: '采购单 · 供应商 · 到货',
    state: 'building',
  },
  {
    key: 'customer',
    name: '客户数据',
    desc: '客户分布 · 新增 · 活跃',
    state: 'building',
  },
  {
    key: 'payment',
    name: '回款数据',
    desc: '应收 · 回款率 · 账期',
    state: 'locked',
  },
  {
    key: 'category',
    name: '品类分析',
    desc: '品类结构 · 动销对比',
    state: 'building',
  },
];
function openModule(item: typeof modules[number]) {
  if (item.key === 'sales') {
    void router.push(path('sales'));
    return;
  }
  Notify.create({
    message: item.state === 'locked'
      ? `「${item.name}」暂无访问权限，请联系管理员开通`
      : `「${item.name}」建设中，当前演示开放销售数据`,
    position: 'bottom',
    timeout: 1600,
  });
}
</script>

<template>
  <section class="screen enter" aria-label="工作台">
    <PageHeader title="工作台" subtitle="2026年11月12日 · 周四" />
    <div class="page-body">
      <DataState v-if="loading || error || !data" :loading="loading" :error="error" :forbidden="forbidden" @retry="load" />
      <button v-else class="card overview-strip" type="button" aria-label="本月概览，进入销售数据" @click="router.push({ path: path('sales'), query: { period: 'month' } })">
        <span class="ov-main"><span class="ov-label">本月概览</span><span class="ov-stats">
          <span class="ov-stat"><span class="ov-k">销售额</span><span class="ov-v num">{{ formatAmount(data.sales) }}<i class="ov-u">万</i></span></span>
          <span class="ov-stat"><span class="ov-k">订单量</span><span class="ov-v num">{{ formatInteger(data.orders) }}<i class="ov-u">单</i></span></span>
          <span class="ov-stat"><span class="ov-k">完成率</span><span class="ov-v num">{{ data.rate }}<i class="ov-u">%</i></span></span>
        </span></span><AppIcon class="ov-chev" name="chevron" />
      </button>
      <h2 id="modules-label" class="section-label">
        数据模块
      </h2>
      <div class="hub-grid" role="group" aria-labelledby="modules-label">
        <button v-for="item in modules" :id="item.key === 'sales' ? 'sales-entry' : undefined" :key="item.key" type="button" class="hub-card" :class="{ 'is-lock': item.state === 'locked' }" @click="openModule(item)">
          <span v-if="item.state" class="hub-badge" :class="{ 'is-lock': item.state === 'locked' }"><AppIcon v-if="item.state === 'locked'" name="lock" />{{ item.state === 'locked' ? '无权限' : '建设中' }}</span>
          <span class="hub-ico"><AppIcon :name="item.key" /></span><span class="hub-name">{{ item.name }}</span><span class="hub-desc">{{ item.desc }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
