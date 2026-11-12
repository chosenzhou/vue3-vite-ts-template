<script setup lang="ts">
import type { WorkbenchPage } from '@/composables/useWorkbenchNavigation';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import AppIcon from '@/components/workbench/AppIcon.vue';
import { useWorkbenchNavigation } from '@/composables/useWorkbenchNavigation';
import '@/assets/styles/workbench.scss';

const route = useRoute();
const { path, sales, active } = useWorkbenchNavigation();
const collapsed = ref(false);
const entries: { page: WorkbenchPage, title: string, icon: string }[] = [
  { page: 'workbench', title: '工作台', icon: 'dash' },
  { page: 'goals', title: '目标进度', icon: 'target' },
  { page: 'profile', title: '我的', icon: 'me' },
];
</script>

<template>
  <div class="app workbench" :class="{ 'sb-collapsed': collapsed }">
    <aside class="sidebar" aria-label="侧边导航">
      <div class="sb-brand">
        <span class="sb-logo"><AppIcon name="shield" /></span>
        <span class="sb-brand-text"><strong>华康医药</strong><small>销售数据平台</small></span>
      </div>
      <nav class="sb-nav" aria-label="页面导航">
        <RouterLink v-for="item in entries" :key="item.page" :to="path(item.page)" class="sb-item" :aria-current="active(item.page) ? 'page' : undefined" :title="item.title">
          <AppIcon :name="item.icon" /><span class="sb-label">{{ item.title }}</span>
        </RouterLink>
      </nav>
      <button class="sb-collapse" type="button" :aria-label="collapsed ? '展开侧边栏' : '折叠侧边栏'" :aria-expanded="!collapsed" @click="collapsed = !collapsed">
        <AppIcon name="back" /><span class="sb-collapse-text">折叠导航</span>
      </button>
    </aside>
    <div class="frame" :class="{ 'is-sales': sales }">
      <main class="main">
        <RouterView v-slot="{ Component }">
          <component :is="Component" :key="route.path" />
        </RouterView>
      </main>
      <nav v-if="!sales" class="tabbar" aria-label="底部导航">
        <RouterLink v-for="item in entries" :key="item.page" :to="path(item.page)" class="tab" :aria-current="active(item.page) ? 'page' : undefined">
          <AppIcon :name="item.icon" />{{ item.title }}
        </RouterLink>
      </nav>
    </div>
  </div>
</template>
