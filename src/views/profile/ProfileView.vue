<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser, logout } from '@/services/api';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const errorMessage = ref('');

async function loadProfile() {
  loading.value = true;
  errorMessage.value = '';
  try {
    userStore.setUser(await getCurrentUser());
  }
  catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : '加载用户信息失败';
  }
  finally {
    loading.value = false;
  }
}

onMounted(loadProfile);

async function signOut() {
  await logout().catch(() => undefined);
  userStore.clearSession();
  await router.replace('/');
}
</script>

<template>
  <QPage class="page-content">
    <QCard>
      <QCardSection>
        <div class="text-h6">
          我的
        </div>
      </QCardSection>
      <QSeparator />
      <QInnerLoading :showing="loading">
        <QSpinner size="40px" color="primary" />
      </QInnerLoading>
      <QBanner v-if="errorMessage" class="bg-negative text-white" rounded>
        {{ errorMessage }}
        <template #action>
          <QBtn flat label="重试" @click="loadProfile" />
        </template>
      </QBanner>
      <QList v-else>
        <QItem>
          <QItemSection>名称</QItemSection>
          <QItemSection side>
            {{ userStore.user?.displayName }}
          </QItemSection>
        </QItem>
        <QSeparator spaced />
        <QItem>
          <QItemSection>来源</QItemSection>
          <QItemSection side>
            {{ userStore.user?.provider }}
          </QItemSection>
        </QItem>
        <QItem v-if="userStore.user?.email">
          <QItemSection>邮箱</QItemSection>
          <QItemSection side>
            {{ userStore.user?.email }}
          </QItemSection>
        </QItem>
      </QList>
    </QCard>
    <QBtn class="q-mt-md" color="negative" label="退出登录" @click="signOut" />
  </QPage>
</template>
