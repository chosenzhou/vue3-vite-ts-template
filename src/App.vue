<script setup lang="ts">
import { useRoute } from 'vue-router';
import router, { pendingSessionRoute } from '@/router';
import { useSessionStore } from '@/stores/session';

const route = useRoute();
const session = useSessionStore();

function retryRestore() {
  void router.replace(pendingSessionRoute.value || '/');
}
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
      <QPage v-if="pendingSessionRoute && !session.loggedIn" class="page-content">
        <QBanner v-if="session.restoreError" class="bg-red-1 text-negative" role="alert">
          {{ session.restoreError }}
          <template #action>
            <QBtn flat label="重试" @click="retryRestore" />
            <QBtn flat label="返回登录" @click="router.replace('/login')" />
          </template>
        </QBanner>
        <div v-else role="status" class="row items-center q-gutter-sm">
          <QSpinner color="primary" />
          <span>正在恢复会话…</span>
        </div>
      </QPage>
      <RouterView v-else />
    </QPageContainer>
  </QLayout>
</template>
