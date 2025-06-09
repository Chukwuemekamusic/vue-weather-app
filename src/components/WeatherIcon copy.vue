<!-- src/components/WeatherIcon.vue -->
<script setup lang="ts">
import { computed } from "vue";

interface Props {
  condition: string;
  size?: number | string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: "white",
});

const iconColor = computed(() => props.color);

const getWeatherIcon = (condition: string): string => {
  switch (condition.toLowerCase()) {
    case "sunny":
    case "clear":
      return "mdi-weather-sunny";
    case "cloudy":
    case "overcast":
      return "mdi-weather-cloudy";
    case "rainy":
    case "rain":
    case "drizzle":
      return "mdi-weather-rainy";
    case "snowy":
    case "snow":
      return "mdi-weather-snowy";
    case "thunderstorm":
    case "storm":
      return "mdi-weather-lightning";
    case "foggy":
    case "fog":
    case "mist":
      return "mdi-weather-fog";
    case "windy":
      return "mdi-weather-windy";
    case "partly-cloudy":
    case "partlycloudy":
      return "mdi-weather-partly-cloudy";
    default:
      return "mdi-weather-partly-cloudy";
  }
};
</script>

<template>
  <v-icon :color="iconColor" :size="size">
    {{ getWeatherIcon(condition) }}
  </v-icon>
</template>
