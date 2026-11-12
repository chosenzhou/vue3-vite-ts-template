import { computed } from 'vue';
import { useRoute } from 'vue-router';

export type WorkbenchPage = 'workbench' | 'sales' | 'goals' | 'profile';

export function useWorkbenchNavigation() {
  const route = useRoute();
  const preview = computed(() => import.meta.env.DEV && route.meta.preview === true);
  const path = (page: WorkbenchPage) => import.meta.env.DEV && preview.value
    ? `/__preview/${page}`
    : `/${page}`;
  const matches = (page: WorkbenchPage) => route.name === page || route.name === `preview-${page}`;
  const sales = computed(() => matches('sales'));
  const active = (page: WorkbenchPage) => matches(page) || (page === 'workbench' && sales.value);
  return { preview, path, sales, active };
}
