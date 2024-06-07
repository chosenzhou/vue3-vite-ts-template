<script lang="ts" setup>
import { ref } from 'vue';

const demo = ref('Demo');
</script>

<template>
  <view>{{ demo }}</view>
</template>

<style lang="scss" scoped>
.container {
  padding: 128rpx 0;
  text-align: center;
}
</style>
