<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <QPage class="page-content">
    <h1 class="q-ma-none q-mb-md text-h5">
      页面不存在
    </h1>
    <QBanner class="bg-negative text-white" rounded>
      请检查链接，或返回首页继续操作。
      <template #action>
        <QBtn flat label="返回首页" @click="router.replace('/')" />
      </template>
    </QBanner>
  </QPage>
</template>
