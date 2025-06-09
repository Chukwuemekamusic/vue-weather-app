<!-- src/components/WeatherIcon.vue -->
<script setup lang="ts">
import { computed } from "vue";

interface Props {
  icon: string;
  size?: number | string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: "white",
});

const iconColor = computed(() => props.color);
</script>

<template>
  <v-icon :color="iconColor" :size="size">
    {{ icon }}
  </v-icon>
</template>
