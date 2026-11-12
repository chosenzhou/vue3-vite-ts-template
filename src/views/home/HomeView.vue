<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOAuth } from '@/composables/useOAuth';

const route = useRoute();
const router = useRouter();
const { start } = useOAuth();
const starting = ref(false);
const errorMessage = ref('');
const redirect = typeof route.query.redirect === 'string'
  ? route.query.redirect
  : '/profile';

async function enterApplication() {
  starting.value = true;
  errorMessage.value = '';
  try {
    await start(redirect);
  }
  catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : '无法创建授权入口。';
    starting.value = false;
  }
}
</script>

<template>
  <QPage class="page-content">
    <QCard>
      <QCardSection>
        <div class="text-h5 q-mb-sm">
          企业微信工作台 H5
        </div>
        <div class="text-body1 text-secondary">
          面向企业微信自建应用的响应式 Web 模板，一套代码覆盖手机与桌面内置浏览器。
        </div>
      </QCardSection>
      <QSeparator />
      <QCardActions align="left">
        <QBtn
          color="primary"
          label="进入应用"
          :loading="starting"
          @click="enterApplication"
        />
        <QBtn
          color="primary"
          flat
          label="查看图表示例"
          @click="router.push('/charts')"
        />
      </QCardActions>
    </QCard>

    <QBanner v-if="errorMessage" class="q-mt-md bg-negative text-white" rounded>
      {{ errorMessage }}
    </QBanner>
    <QBanner
      v-else-if="route.query.auth === 'expired'"
      class="q-mt-md bg-warning text-black"
      rounded
    >
      登录状态已失效，请重新进入应用。
    </QBanner>
  </QPage>
</template>
