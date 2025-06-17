<!-- src/components/WeatherCard.vue -->
<script setup lang="ts">
import type { City } from "@/services/weatherService";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import WeatherIcon from "@/components/WeatherIcon.vue";

interface WeatherCardProps {
  city: City;
}

interface Emits {
  (e: "remove"): void;
  (e: "retry-fetch", cityId: number): void;
}

const props = defineProps<WeatherCardProps>();
const emit = defineEmits<Emits>();

const theme = useTheme();
const router = useRouter();

const formatValue = (
  value: number | string | undefined | null,
  suffix = ""
) => {
  // general error
  if (props.city.error) {
    return "N/A";
  }
  return value !== undefined && value !== null ? `${value}${suffix}` : "N/A";
};

const additionalDetails = computed(() => [
  {
    icon: "mdi-thermometer",
    label: "Feels like",
    value: formatValue(props.city.feelsLike, "°C"),
  },
  {
    icon: "mdi-water-percent",
    label: "Humidity",
    value: formatValue(props.city.humidity, "%"),
  },
  {
    icon: "mdi-weather-windy",
    label: "Wind",
    value: formatValue(props.city.windSpeed, " km/h"),
  },
]);

const cardClass = computed(() => {
  const weatherType = props.city.weatherType; // Directly use the weatherType from the prop
  const colors = theme.global.current.value.colors;

  // Define a mapping from weatherType to the theme color names (start and end for gradients)
  const gradientColorMap: Record<string, { start: string; end: string }> = {
    sunny: { start: "weatherSunnyStart", end: "weatherSunnyEnd" },
    cloudy: { start: "weatherCloudyStart", end: "weatherCloudyEnd" },
    rainy: { start: "weatherRainyStart", end: "weatherRainyEnd" },
    snowy: { start: "weatherSnowyStart", end: "weatherSnowyEnd" },
    stormy: { start: "weatherStormyStart", end: "weatherStormyEnd" },
    default: { start: "weatherDefaultStart", end: "weatherDefaultEnd" }, // Fallback
  };

  // Get the selected gradient color names, falling back to 'default' if weatherType is not found
  const selectedGradient =
    gradientColorMap[weatherType] || gradientColorMap.default;

  const startColor = colors[selectedGradient.start] as string;
  const endColor = colors[selectedGradient.end] as string;

  if (props.city.error) {
    // You'll need to define 'error' color in your Vuetify theme's colors if not already.
    return `linear-gradient(to bottom right, ${colors.error}AA, ${colors.error}55)`;
  }

  return `background: linear-gradient(to bottom right, ${startColor}, ${endColor})`;
});

const goToCityDetail = () => {
  if (!props.city.error && props.city.id) {
    // TODO Ensure city has an ID before navigating
    router.push(`/city/${props.city.id}`);
  }
};
</script>

<template>
  <div class="">
    <v-card
      :class="[
        'weather-card',
        'pa-6',
        'mt-4',
        'rounded-xl',
        'position-relative',
        'elevation-10',
        'transition-all',
        'duration-300',
        'cursor-pointer',
      ]"
      :style="cardClass"
      @click="goToCityDetail"
    >
      <!-- Remove button
      <v-btn
        class="remove-btn"
        icon
        size="small"
        variant="text"
        @click.stop="$emit('remove')"
      >
        <v-icon color="white" size="16">mdi-close</v-icon>
      </v-btn> -->

      <template v-if="props.city.error">
        <div class="text-center my-4">
          <v-icon color="error" size="64">mdi-alert-circle-outline</v-icon>
          <h3 class="text-h5 font-weight-bold mt-2 mb-1">
            {{ props.city.name }}
          </h3>
          <p class="text-body-2 text-opacity-80 mb-4">
            {{ props.city.country }}
          </p>
          <p class="text-body-2 text-red-lighten-2 mb-4">
            {{ props.city.error || "Weather data unavailable" }}
          </p>
          <v-btn
            size="small"
            variant="outlined"
            @click.stop="emit('retry-fetch', props.city.id)"
          >
            <v-icon start>mdi-refresh</v-icon> Refresh
          </v-btn>
        </div>
      </template>

      <template v-else>
        <!-- City Name -->
        <div class="mb-4 text-left">
          <h3 class="text-h5 font-weight-bold">
            {{ props.city.name }}
          </h3>
          <p class="text-body-2 text-opacity-80">
            {{ props.city.country }}
          </p>
        </div>

        <!-- Weather icon and temperature -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="text-left">
            <div class="text-h4 font-weight-bold text-on-background">
              {{ props.city.temperature }}°C
            </div>
            <div class="text-body-2 text-opacity-90">
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
              <v-icon class="mr-2" color="white" size="16">{{
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
      </template>
    </v-card>
  </div>
</template>

<style scoped>
.weather-card {
  min-width: 280px;
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
