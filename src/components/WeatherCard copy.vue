<script setup lang="ts">
import { ref, computed } from "vue";
import type { City } from "@/data/weatherData";
import WeatherIcon from "@/components/WeatherIcon.vue";
import { useTheme } from "vuetify";

interface WeatherCardProps {
  city: City;
}

interface Emits {
  remove: [];
}

const props = defineProps<WeatherCardProps>();
defineEmits<Emits>();

const hover = ref(false);
const theme = useTheme();

const cardClass = computed(() => {
  const colors = theme.global.current.value.colors;
  let startColor = colors.weatherDefaultStart as string;
  let endColor = colors.weatherDefaultEnd as string;

  switch (props.city.condition.toLowerCase()) {
    case "sunny":
    case "clear":
      startColor = colors.weatherSunnyStart as string;
      endColor = colors.weatherSunnyEnd as string;
      break;
    case "cloudy":
    case "overcast":
      startColor = colors.weatherCloudyStart as string;
      endColor = colors.weatherCloudyEnd as string;
      break;
    case "rainy":
    case "rain":
      startColor = colors.weatherRainyStart as string;
      endColor = colors.weatherRainyEnd as string;
      break;
    case "snowy":
    case "snow":
      startColor = colors.weatherSnowyStart as string;
      endColor = colors.weatherSnowyEnd as string;
      break;
  }

  return `background: linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`;
});

const additionalDetails = [
  {
    icon: "mdi-thermometer",
    label: "Feels like",
    value: `${props.city.feelsLike}°C`,
  },
  {
    icon: "mdi-water-percent",
    label: "Humidity",
    value: `${props.city.humidity}%`,
  },
  {
    icon: "mdi-weather-windy",
    label: "wind",
    value: `${props.city.windSpeed} km/h`,
  },
  // {
  //   icon: "mdi-air-filter",
  //   label: "Air Quality",
  //   value: `${props.city.airQuality}`,
  // },
];
</script>

<template>
  <!-- @mouseenter="hover = true"
   @mouseleave="hover = false" -->
  <div class="">
    <v-card
      :class="[
        'weather-card',
        'pa-6',
        'mt-4',
        'text-white',
        'rounded-xl',
        'position-relative',
        'elevation-10',
        'transition-all',
        'duration-300',
        'cursor-pointer',
      ]"
      :style="cardClass"
    >
      <!-- Remove button  -->
      <v-btn
        icon
        size="small"
        variant="text"
        class="remove-btn"
        @click="$emit('remove')"
      >
        <v-icon color="white" size="16">mdi-close</v-icon>
      </v-btn>

      <!-- City name and country -->
      <div class="mb-4">
        <h3 class="text-h5 font-weight-bold text-on-background">
          {{ props.city.name }}
        </h3>
        <p class="text-body-2 text-white text-opacity-80">
          {{ props.city.country }}
        </p>
      </div>

      <!-- Weather icon and temperature -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="">
          <div class="text-h4 font-weight-bold text-on-background">
            {{ props.city.temperature }}°C
          </div>
          <div class="text-body-2 text-white text-opacity-90">
            {{ props.city.condition }}
          </div>
        </div>
        <div class="text-right">
          <WeatherIcon :icon="props.city.icon" :size="48" />
        </div>
      </div>

      <!-- Additional weather details  -->
      <div class="border-t border-white border-opacity-20 pt-1">
        <!-- Feels like -->
        <div
          v-for="detail in additionalDetails"
          :key="detail.label"
          class="d-flex align-center justify-space-between mt-1"
        >
          <div class="d-flex align-center">
            <v-icon color="white" size="16" class="mr-2">{{
              detail.icon
            }}</v-icon>
            <span class="text-body-2 font-weight-medium">
              {{ detail.label }}</span
            >
          </div>
          <div class="text-body-2 font-weight-medium">
            {{ detail.value }}
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.weather-card {
  /* Using background property to apply the dynamic gradient */
  min-width: 280px; /* Adjust as needed */
  max-width: 400px;
  width: 100%; /* Make it responsive within its container */
  /* color: white; /* Ensure all text inside the card is white */

  /* Hover effects */
  transition: all 0.3s ease-in-out;
}

.weather-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3) !important;
}

.remove-btn {
  position: absolute !important;
  top: 1rem;
  right: 1rem;
  background-color: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
}

.remove-btn:hover {
  background-color: rgba(255, 255, 255, 0.3) !important;
}
</style>
