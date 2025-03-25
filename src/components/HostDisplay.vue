<template>
    <ul>
        <li v-for="(item, index) in hosts" :key="index">
            {{ index + 1 }}.{{ item }}
        </li>
    </ul>
</template>

<script setup>

import { computed } from 'vue';

const props = defineProps({
    hosts: {
        type: Array,
        required: true,
    }
})



</script>