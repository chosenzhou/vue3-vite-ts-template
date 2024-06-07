<script lang="ts" setup>
import type { IconProps } from '@iconify/vue';
/**
 * @name Iconify
 * @desc 图标
 * @docs https://iconify.design/docs/icon-components/vue/
 * @example <Iconify icon="ant-design:home-outlined" />
 */
import { Icon } from '@iconify/vue';

interface Props {
  icon: string
  size?: string | number
  width?: IconProps['width']
  height?: IconProps['height']
  color?: IconProps['color']
}

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <Icon v-bind="props" />
</template>

<style lang="scss" scoped></style>
