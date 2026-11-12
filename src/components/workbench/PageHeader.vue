<script setup lang="ts">
defineProps<{ title: string, subtitle: string }>();
</script>

<template>
  <header class="screen-head">
    <p class="eyebrow">
      {{ subtitle }}
    </p>
    <h1 class="page-title">
      {{ title }}
    </h1>
  </header>
</template>
