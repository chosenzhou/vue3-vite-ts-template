<script setup lang="ts">
withDefaults(defineProps<{ loading?: boolean, error?: string, forbidden?: boolean }>(), { error: '' });
defineEmits<{ retry: [] }>();
</script>

<template>
  <QCard flat bordered class="card data-state" role="status" aria-live="polite">
    <template v-if="loading">
      <QSkeleton v-for="width in ['38%', '86%', '72%', '60%']" :key="width" type="text" :width="width" />
      <p class="state-note">
        正在加载数据，通常不超过 1 秒
      </p>
    </template>
    <div v-else class="state-block">
      <QIcon :name="forbidden ? 'lock_outline' : error ? 'warning_amber' : 'inventory_2'" size="28px" color="grey-7" />
      <h2 class="state-title">
        {{ forbidden ? '无权限访问' : error ? '请求失败' : '暂无数据' }}
      </h2>
      <p class="state-desc">
        {{ forbidden ? '如需查看该模块数据，请联系管理员申请数据权限' : error || '当前筛选条件下没有可展示的数据，可调整时间范围后重试' }}
      </p>
      <QBtn v-if="!forbidden" unelevated color="primary" :label="error ? '重新加载' : '重新筛选'" @click="$emit('retry')" />
    </div>
  </QCard>
</template>
