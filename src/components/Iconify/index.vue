<script lang="ts" setup>
/**
 * @name Iconify
 * @desc 图标组件 使用 iconify + tailwindcss
 * 更多图标库 https://icon-sets.iconify.design/
 * @docs https://github.com/egoist/tailwindcss-icons
 * @example <Iconify icon="i-mdi-account-box" size="32" color="green" />
 */

interface Props {
  icon: string
  size?: string | number
  color?: string
}
const props = withDefaults(defineProps<Props>(), {
  size: 'inherit',
  color: 'inherit',
});

const iconSize = computed(() => (Number.isNaN(Number(props.size)) ? `${props.size}` : `${props.size}rpx`));
</script>

<template>
  <text class="iconify-icon" :class="[props.icon]" />
</template>

<style lang="scss" scoped>
.iconify-icon {
  display: inline-block;
  line-height: 1;
  font-size: v-bind('iconSize');
  color: v-bind('color');
}
</style>
