import type { Period } from '@/services/workbench/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSalesStore = defineStore('sales', () => {
  const period = ref<Period>('today');
  const goalAnimationPlayed = ref(false);
  return { period, goalAnimationPlayed };
});
