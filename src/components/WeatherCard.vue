<!-- src/components/WeatherCard.vue -->
<script setup lang="ts">
  import type { City } from '@/services/weatherService'
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import WeatherIcon from '@/components/WeatherIcon.vue'

  interface WeatherCardProps {
    city: City
  }

  interface Emits {
    remove: []
  }

  const props = defineProps<WeatherCardProps>()
  defineEmits<Emits>()

  const theme = useTheme()
  const router = useRouter()

  const additionalDetails = computed(() => [
    {
      icon: 'mdi-thermometer',
      label: 'Feels like',
      value: `${props.city.feelsLike}°C`,
    },
    {
      icon: 'mdi-water-percent',
      label: 'Humidity',
      value: `${props.city.humidity}%`,
    },
    {
      icon: 'mdi-weather-windy',
      label: 'wind',
      value: `${props.city.windSpeed} km/h`,
    },
  ])

  const cardClass = computed(() => {
    const weatherType = props.city.weatherType // Directly use the weatherType from the prop
    const colors = theme.global.current.value.colors

    // Define a mapping from weatherType to the theme color names (start and end for gradients)
    const gradientColorMap: Record<string, { start: string, end: string }> = {
      sunny: { start: 'weatherSunnyStart', end: 'weatherSunnyEnd' },
      cloudy: { start: 'weatherCloudyStart', end: 'weatherCloudyEnd' },
      rainy: { start: 'weatherRainyStart', end: 'weatherRainyEnd' },
      snowy: { start: 'weatherSnowyStart', end: 'weatherSnowyEnd' },
      stormy: { start: 'weatherStormyStart', end: 'weatherStormyEnd' },
      default: { start: 'weatherDefaultStart', end: 'weatherDefaultEnd' }, // Fallback
    }

    // Get the selected gradient color names, falling back to 'default' if weatherType is not found
    const selectedGradient
      = gradientColorMap[weatherType] || gradientColorMap.default

    const startColor = colors[selectedGradient.start] as string
    const endColor = colors[selectedGradient.end] as string

    return `background: linear-gradient(to bottom right, ${startColor}, ${endColor})`
  })

  const goToCityDetail = () => {
    if (props.city.id) {
      // Ensure city has an ID before navigating
      router.push(`/city/${props.city.id}`)
    }
  }
</script>

<template>
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
      @click="goToCityDetail"
    >
      <!-- Remove button  -->
      <v-btn
        class="remove-btn"
        icon
        size="small"
        variant="text"
        @click.stop="$emit('remove')"
      >
        <v-icon color="white" size="16">mdi-close</v-icon>
      </v-btn>

      <!-- City Name -->
      <div class="mb-4 text-left">
        <h3 class="text-h5 font-weight-bold text-white">
          {{ props.city.name }}
        </h3>
        <p class="text-body-2 text-white text-opacity-80">
          {{ props.city.country }}
        </p>
      </div>

      <!-- Weather icon and temperature -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-left">
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
            <v-icon class="mr-2" color="white" size="16">{{
              detail.icon
            }}</v-icon>
            <span class="text-body-2 font-weight-medium">
              {{ detail.label }}</span>
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
