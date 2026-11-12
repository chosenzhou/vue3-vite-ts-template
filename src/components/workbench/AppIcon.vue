<script setup lang="ts">
defineProps<{ name: string }>();
</script>

<template>
  <svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="['back', 'chevron', 'close'].includes(name) ? 2 : name === 'shield' ? 1.7 : 1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g v-if="name === 'dash'"><rect x="4" y="4" width="7" height="7" rx="1.8" /><rect x="13" y="4" width="7" height="7" rx="1.8" /><rect x="4" y="13" width="7" height="7" rx="1.8" /><rect x="13" y="13" width="7" height="7" rx="1.8" /></g>
    <g v-if="name === 'target'"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></g>
    <g v-if="name === 'me'"><circle cx="12" cy="8.2" r="3.6" /><path d="M4.8 19.4c1.6-3.1 4.2-4.6 7.2-4.6s5.6 1.5 7.2 4.6" /></g>
    <g v-if="name === 'sales'"><path d="M4.5 19.5h15" /><path d="M8 19.5v-5.5" /><path d="M12 19.5v-9" /><path d="M16 19.5V7" /></g>
    <g v-if="name === 'stock'"><path d="m12 3.8 8 3.6v9.2l-8 3.6-8-3.6V7.4z" /><path d="m4 7.4 8 3.6 8-3.6" /><path d="M12 11v9.2" /></g>
    <g v-if="name === 'purchase'"><path d="M3.5 5h2.2l2.1 9.6h9.4l1.8-6.8H6.4" /><circle cx="9.4" cy="18.6" r="1.3" /><circle cx="15.8" cy="18.6" r="1.3" /></g>
    <g v-if="name === 'customer'"><circle cx="9.2" cy="8.6" r="3.1" /><path d="M3.9 18.9c1.3-2.6 3.2-3.9 5.3-3.9s4 1.3 5.3 3.9" /><path d="M14.9 5.9a3.1 3.1 0 0 1 0 5.4" /><path d="M16.9 15.3c1.5.8 2.5 2 3.2 3.6" /></g>
    <g v-if="name === 'payment'"><circle cx="12" cy="12" r="8.2" /><path d="m9.2 7.8 2.8 3.4 2.8-3.4" /><path d="M12 11.2v4.8" /><path d="M9.8 13.6h4.4" /></g>
    <g v-if="name === 'category'"><path d="m12 4 8 4.2-8 4.2-8-4.2z" /><path d="m4 12.6 8 4.2 8-4.2" /><path d="m4 16.6 8 4.2 8-4.2" /></g>
    <g v-if="name === 'shield'"><path d="M12 3.5 5.5 6v5.2c0 4.4 2.7 7.3 6.5 8.8 3.8-1.5 6.5-4.4 6.5-8.8V6z" /><path d="m9.2 11.8 2 2 3.6-3.8" /></g>
    <g v-if="name === 'chevron'"><path d="m9.5 6.5 5.5 5.5-5.5 5.5" /></g>
    <g v-if="name === 'back'"><path d="m14.5 6-6 6 6 6" /></g>
    <g v-if="name === 'lock'"><rect x="5.5" y="10.5" width="13" height="9" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></g>
    <g v-if="name === 'help'"><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.6" /><circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none" /></g>
    <g v-if="name === 'info'"><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none" /></g>
    <g v-if="name === 'close'"><path d="m6.5 6.5 11 11m0-11-11 11" /></g>
  </svg>
</template>
