<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loginWithWeCom } from '@/services/api';
import { useUserStore } from '@/stores/user';
import { readState } from '@/utils/oauth';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const errorMessage = ref('');

onMounted(async () => {
  const code = route.query.code;
  const { redirect } = readState(typeof route.query.state === 'string'
    ? route.query.state
    : null);

  if (typeof code !== 'string') {
    errorMessage.value = '授权回调参数无效。';
    return;
  }

  try {
    const response = await loginWithWeCom(code);
    userStore.setSession(response.token, response.user);
    await router.replace(redirect);
  }
  catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : '登录失败，请重试。';
  }
});
</script>

<template>
  <QPage class="page-content">
    <QCard>
      <QCardSection>
        <div class="text-h6">
          正在登录
        </div>
      </QCardSection>
      <QCardSection>
        <QBanner v-if="errorMessage" class="bg-negative text-white" rounded>
          {{ errorMessage }}
          <template #action>
            <QBtn flat label="返回首页" @click="router.replace('/')" />
          </template>
        </QBanner>
        <QSpinner v-else color="primary" size="40px" />
      </QCardSection>
    </QCard>
  </QPage>
</template>
