<script setup lang="ts">
import { useRoute } from 'vue-router';
import WorkbenchLayout from '@/layouts/WorkbenchLayout.vue';

const route = useRoute();
</script>

<template>
  <WorkbenchLayout v-if="route.meta.workbench" />
  <QLayout v-else view="hHh lpR fFf">
    <QHeader elevated class="glossy">
      <QToolbar>
        <QToolbarTitle>
          {{ route.meta.title || 'WeCom H5' }}
        </QToolbarTitle>
      </QToolbar>
    </QHeader>

    <QPageContainer>
      <RouterView />
    </QPageContainer>
  </QLayout>
</template>
