<script setup lang="ts">
import type { GoalItem } from '@/services/workbench/types';
import { formatAmount, formatInteger } from '@/services/workbench';

defineProps<{ title: string, items: GoalItem[] }>();
</script>

<template>
  <QCard flat bordered class="card">
    <div class="card-head">
      <h2 class="card-title">
        {{ title }}
      </h2><span class="card-sub">月度目标完成率</span>
    </div>
    <div v-for="item in items" :key="item.name" class="prog-item">
      <div class="prog-top">
        <span class="prog-name"><span v-if="item.color" class="dot-mark" :style="{ background: item.color }" />{{ item.name }}</span><span class="prog-pct num">{{ item.pct.toFixed(1) }}%</span>
      </div>
      <QLinearProgress rounded size="6px" :value="item.pct / 100" color="primary" :aria-label="`${item.name}目标完成率 ${item.pct}%`" />
      <span class="prog-sub num">已完成 {{ formatAmount(item.done) }} 万 / 目标 {{ formatInteger(item.target) }} 万</span>
    </div>
  </QCard>
</template>
