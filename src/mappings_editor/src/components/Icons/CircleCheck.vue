<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        :fill="color"
        :width="width"
        :height="height"
    >
        <!-- Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
        <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-464a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm70.7 121.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"/>
    </svg>
</template>
<script setup lang="ts">
withDefaults(defineProps<{
    color?: string;
    width?: number | string;
    height?: number | string;
}>(), {
    color: 'currentColor',
    width: 16,
    height: 16,
});
</script>
<style scoped></style>