<script setup lang="ts">
const router = useRouter();

function onClick() {
  router.push({ name: 'Login' });
}
function goLog() {
  router.push({ name: 'Log' });
}
</script>

<template>
  <view class="border border-blue border-solid text-mini text-primary center h-44">
    home
  </view>
  <button @click="onClick">
    登录
  </button>
  <button @click="goLog">
    Log
  </button>
</template>

<style lang="scss">
</style>
