<script setup lang="ts">
import type { UserProfile } from '@/services/model';
import { Notify } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '@/components/workbench/AppIcon.vue';
import DataState from '@/components/workbench/DataState.vue';
import PageHeader from '@/components/workbench/PageHeader.vue';
import { useWorkbenchNavigation } from '@/composables/useWorkbenchNavigation';
import { getCurrentUser, logout } from '@/services/api';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const { preview, path } = useWorkbenchNavigation();
const previewUser = ref<UserProfile>();
const displayedUser = computed(() => preview.value ? previewUser.value : userStore.user);
const loading = ref(true);
const errorMessage = ref('');

async function loadProfile() {
  loading.value = true;
  errorMessage.value = '';
  try {
    if (import.meta.env.DEV && preview.value) {
      const { previewProfile } = await import('@/dev/previewProfile');
      previewUser.value = previewProfile;
    }
    else {
      userStore.setUser(await getCurrentUser());
    }
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
  if (import.meta.env.DEV && preview.value) {
    await router.push(path('workbench'));
    return;
  }
  await logout().catch(() => undefined);
  userStore.clearSession();
  await router.replace('/');
}
</script>

<template>
  <section class="screen enter" aria-label="我的">
    <PageHeader title="我的" subtitle="企业微信已登录" />
    <div class="page-body me-layout">
      <DataState v-if="loading || errorMessage" :loading="loading" :error="errorMessage" @retry="loadProfile" />
      <QCard v-else flat bordered class="card me-card">
        <span class="avatar"><QAvatar size="52px" font-size="20px">
          <img v-if="displayedUser?.avatar" :src="displayedUser.avatar" alt=""><span v-else>{{ displayedUser?.displayName?.slice(0, 1) }}</span>
        </QAvatar></span>
        <div class="me-main">
          <div class="me-name-row">
            <span class="me-name">{{ displayedUser?.displayName }}</span><span class="me-role">销售总监</span>
          </div><span class="me-sub">华康医药批发有限公司 · 华东大区</span>
        </div>
      </QCard>
      <QCard flat bordered class="card">
        <div class="set-list">
          <button class="set-row" type="button" @click="Notify.create({ message: '帮助与反馈（演示入口）', position: 'bottom', timeout: 1600 })">
            <AppIcon name="help" class="set-ic" style="--od-icon-size: 20px" /><span class="set-label">帮助与反馈</span><AppIcon name="chevron" class="set-chev" style="--od-icon-size: 16px" />
          </button>
          <div class="set-row">
            <AppIcon name="info" class="set-ic" style="--od-icon-size: 20px" /><span class="set-label">版本</span><span class="set-value num">v2.4.1 · 企业微信 H5</span>
          </div>
        </div>
      </QCard>
      <QBtn v-if="!preview" class="logout-button" flat color="grey-7" label="退出登录" @click="signOut" />
    </div>
  </section>
</template>
