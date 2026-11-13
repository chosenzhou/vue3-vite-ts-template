<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <QLayout view="hHh lpR fFf">
    <QHeader elevated class="glossy">
      <QToolbar>
        <QToolbarTitle>
          {{ route.meta.title || 'H5' }}
        </QToolbarTitle>
      </QToolbar>
    </QHeader>

    <QPageContainer>
      <RouterView />
    </QPageContainer>
  </QLayout>
</template>
