<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signIn } from '@/services/auth';
import { ApiError } from '@/services/http';
import { safeRedirect } from '@/utils/redirect';

const route = useRoute();
const router = useRouter();
const username = ref('');
const password = ref('');
const submitting = ref(false);
const errorMessage = ref('');

async function submit() {
  if (submitting.value) {
    return;
  }
  submitting.value = true;
  errorMessage.value = '';
  try {
    await signIn({
      username: username.value.trim(),
      password: password.value,
    });
    password.value = '';
    const redirect = safeRedirect(route.query.redirect);
    await router.replace(router.resolve(redirect).name === 'not-found'
      ? '/'
      : redirect);
  }
  catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : '登录失败，请稍后重试。';
  }
  finally {
    submitting.value = false;
  }
}
</script>

<template>
  <QPage class="page-content">
    <QCard flat bordered class="login-card q-mx-auto q-mt-xl">
      <QCardSection>
        <h1 class="text-h5 q-mt-none q-mb-lg">
          账号登录
        </h1>
        <QForm class="q-gutter-md" @submit="submit">
          <QInput
            v-model="username"
            outlined
            label="账号"
            autocomplete="username"
            :disable="submitting"
            :rules="[value => Boolean(value?.trim()) || '请输入账号']"
          />
          <QInput
            v-model="password"
            outlined
            label="密码"
            type="password"
            autocomplete="current-password"
            :disable="submitting"
            :rules="[value => Boolean(value) || '请输入密码']"
          />
          <QBanner v-if="errorMessage" rounded class="bg-red-1 text-negative" role="alert">
            {{ errorMessage }}
          </QBanner>
          <QBtn
            type="submit"
            color="primary"
            label="登录"
            class="full-width"
            :loading="submitting"
            :disable="submitting"
          />
        </QForm>
      </QCardSection>
    </QCard>
  </QPage>
</template>

<style scoped lang="scss">
.login-card {
  max-width: 400px;
}
</style>
