<script setup lang="ts">
import { onScopeDispose, ref, watch } from 'vue';
import { formatAmount, formatInteger } from '@/services/workbench';

const props = defineProps<{ label: string, value: number, unit: string, kind?: 'amount' | 'integer' | 'rate', delta?: { dir: string, text: string } }>();
const display = ref(props.value);
let frame = 0;
watch(() => props.value, (value) => {
  cancelAnimationFrame(frame);
  const from = display.value;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    display.value = value;
    return;
  }
  const start = performance.now();
  function step(now: number) {
    const progress = Math.min((now - start) / 380, 1);
    display.value = from + (value - from) * (1 - (1 - progress) ** 3);
    if (progress < 1)
      frame = requestAnimationFrame(step);
  }
  frame = requestAnimationFrame(step);
});
onScopeDispose(() => cancelAnimationFrame(frame));
</script>

<template>
  <QCard flat bordered class="kpi">
    <span class="kpi-label">{{ label }}</span>
    <span class="kpi-value num"><strong>{{ kind === 'integer' ? formatInteger(display) : kind === 'rate' ? display.toFixed(1) : formatAmount(display) }}</strong><small>{{ unit }}</small></span>
    <span v-if="delta" class="delta" :class="delta.dir">{{ delta.text }}</span>
  </QCard>
</template>
