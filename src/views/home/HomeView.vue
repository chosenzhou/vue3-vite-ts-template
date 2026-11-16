<script setup lang="ts">
import { useRouter } from 'vue-router';
import { signOut } from '@/services/auth';
import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
const router = useRouter();

function exit() {
  void signOut();
  void router.replace('/login');
}
</script>

<template>
  <QPage class="page-content">
    <QCard flat bordered>
      <QCardSection>
        <h1 class="text-h5 q-mt-none q-mb-md">
          首页
        </h1>
        <div class="text-body1">
          {{ session.user?.displayName }}
        </div>
        <div v-if="session.user?.email" class="text-body2 text-grey-7 q-mt-sm">
          {{ session.user.email }}
        </div>
      </QCardSection>
      <QCardActions>
        <QBtn color="primary" outline label="退出登录" @click="exit" />
      </QCardActions>
    </QCard>
  </QPage>
</template>
