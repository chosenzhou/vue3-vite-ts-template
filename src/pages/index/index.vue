<script setup lang="ts">
import { useRouter } from 'uni-mini-router';

const router = useRouter();
function onClick() {
  console.log('click');
  router.push({ name: 'Login' });
}

// const pt = __UNI_PLATFORM__;
</script>

<template>
  <view class="border border-solid border-blue text-primary h-44 center text-mini">
    home
  </view>
  <button @click="onClick">
    登录
  </button>
</template>

<style lang="scss">
</style>
