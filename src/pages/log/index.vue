<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();
// onLoad((query) => {
//   console.log('log onLoad query', query);
// });
</script>

<template>
  <view class="text-center">
    登录后访问log
  </view>
  <image class="" :src="userStore.userInfo?.avatar" mode="aspectFit" lazy-load="false" binderror="" bindload="" />
  <view>用户昵称：{{ userStore.userInfo?.nickname }}</view>
</template>

<style lang="scss" scoped></style>
