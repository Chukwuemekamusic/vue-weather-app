<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import {
  WeatherService,
  type City,
  type WeatherResponse,
} from "@/services/weatherService"; // WeatherResponse needed for types
import WeatherIcon from "@/components/WeatherIcon.vue";
import { useTheme } from "vuetify";

const route = useRoute();
const weatherService = new WeatherService();
const theme = useTheme();

const cityDetail = ref<City | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const cityId = computed(() =>
  Number((route.params as Record<string, string>).id)
);

// IMPORTANT: Define fetchCityDetails before the watch
const fetchCityDetails = async (id: number) => {
  loading.value = true;
  error.value = null;
  cityDetail.value = null;

  try {
    // This single call now fetches city details, current weather, AND daily forecast
    const fetchedCity = await weatherService.getCityWeather(id);
    if (fetchedCity) {
      cityDetail.value = fetchedCity;
    } else {
      error.value = "City not found.";
    }
  } catch (err: any) {
    console.error("Failed to fetch city details:", err);
    error.value = err.message || "Failed to load city weather details.";
  } finally {
    loading.value = false;
  }
};

// Watch for changes in cityId and load data
watch(
  cityId,
  async (newId) => {
    if (newId) {
      await fetchCityDetails(newId);
    } else {
      cityDetail.value = null;
      error.value = "No city ID provided.";
    }
  },
  { immediate: true }
);

// Computed property to determine the card background gradient
const cardBackground = computed(() => {
  if (!cityDetail.value)
    return "background: linear-gradient(to bottom right, #60A5FA, #2563EB);";
  const weatherType = cityDetail.value.weatherType;
  const colors = theme.global.current.value.colors;

  const gradientColorMap: Record<string, { start: string; end: string }> = {
    sunny: { start: "weatherSunnyStart", end: "weatherSunnyEnd" },
    cloudy: { start: "weatherCloudyStart", end: "weatherCloudyEnd" },
    rainy: { start: "weatherRainyStart", end: "weatherRainyEnd" },
    snowy: { start: "weatherSnowyStart", end: "weatherSnowyEnd" },
    stormy: { start: "weatherStormyStart", end: "weatherStormyEnd" },
    default: { start: "weatherDefaultStart", end: "weatherDefaultEnd" },
  };

  const selectedGradient =
    gradientColorMap[weatherType] || gradientColorMap.default;

  const startColor = colors[selectedGradient.start] as string;
  const endColor = colors[selectedGradient.end] as string;

  return `background: linear-gradient(to bottom right, ${startColor}, ${endColor});`;
});

// Helper to format date for daily forecast
const formatDailyDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Helper to get icon for daily forecast
const getDailyIcon = (weatherCode: number, isDay: number) => {
  const { icon } = (weatherService as any).getWeatherDetails(
    weatherCode,
    isDay === 1
  );
  return icon;
};

// Helper to get condition for daily forecast
const getDailyCondition = (weatherCode: number, isDay: number) => {
  const { condition } = (weatherService as any).getWeatherDetails(
    weatherCode,
    isDay === 1
  );
  return condition;
};
</script>

<route lang="json">
{
  "meta": {
    "requiresAuth": true
  }
}
</route>

<template>
  <div class="container mx-auto p-4 text-center">
    <v-btn icon @click="$router.back()" class="back-button">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <h1 class="text-h4 font-weight-bold text-on-background mb-6">
      City Weather Details
    </h1>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="text-h6 text-on-background">Loading detailed weather...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          :text="error"
          closable
          @click:close="error = null"
        />
      </v-col>
    </v-row>

    <v-card
      v-else-if="cityDetail && cityDetail.daily"
      class="pa-8 elevation-12 rounded-xl text-white mx-auto detail-card"
      :style="cardBackground"
    >
      <div class="d-flex align-center align-center justify-space-between mb-4">
        <div class="text-left">
          <h2 class="text-h4 font-weight-bold">
            {{ cityDetail.name }}
          </h2>
          <p class="text-h6 text-white text-opacity-80">
            {{ cityDetail.country }}
          </p>
          <div class="text-h3 font-weight-bold mt-2">
            {{ cityDetail.temperature }}°C
          </div>
          <p class="text-h6 text-white text-opacity-90">
            {{ cityDetail.condition }}
          </p>
        </div>
        <div class="text-right">
          <WeatherIcon :icon="cityDetail.icon" :size="96" />
        </div>
      </div>

      <v-divider class="my-4 border-white border-opacity-30"></v-divider>

      <v-row class="mb-4">
        <v-col cols="6" sm="3">
          <div class="d-flex flex-column align-center">
            <v-icon color="white" size="24" class="mb-1"
              >mdi-thermometer</v-icon
            >
            <span class="text-body-2 text-white text-opacity-90"
              >Feels Like</span
            >
            <span class="text-body-1 font-weight-medium"
              >{{ cityDetail.feelsLike }}°C</span
            >
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="d-flex flex-column align-center">
            <v-icon color="white" size="24" class="mb-1"
              >mdi-water-percent</v-icon
            >
            <span class="text-body-2 text-white text-opacity-90">Humidity</span>
            <span class="text-body-1 font-weight-medium"
              >{{ cityDetail.humidity }}%</span
            >
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="d-flex flex-column align-center">
            <v-icon color="white" size="24" class="mb-1"
              >mdi-weather-windy</v-icon
            >
            <span class="text-body-2 text-white text-opacity-90"
              >Wind Speed</span
            >
            <span class="text-body-1 font-weight-medium"
              >{{ cityDetail.windSpeed }} km/h</span
            >
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="d-flex flex-column align-center">
            <v-icon color="white" size="24" class="mb-1"
              >mdi-weather-pouring</v-icon
            >
            <span class="text-body-2 text-white text-opacity-90"
              >Precipitation</span
            >
            <span class="text-body-1 font-weight-medium"
              >{{
                Math.round(cityDetail.daily.precipitationSum[0] * 10) / 10
              }}
              mm</span
            >
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4 border-white border-opacity-30"></v-divider>

      <h3 class="text-h6 font-weight-bold text-left mb-4">7-Day Forecast</h3>
      <v-row>
        <v-col
          v-for="(day, index) in cityDetail.daily.time"
          :key="index"
          cols="6"
          sm="4"
          md="2"
        >
          <v-card class="pa-2 rounded-lg text-center daily-forecast-card" flat>
            <div class="text-body-2 font-weight-bold mb-1">
              {{ formatDailyDate(day) }}
            </div>
            <WeatherIcon
              :icon="
                getDailyIcon(
                  cityDetail.daily.weatherCode[index],
                  cityDetail.temperature > 10 ? 1 : 0
                )
              "
              :size="36"
            />
            <div class="text-body-2 mt-1">
              {{
                getDailyCondition(
                  cityDetail.daily.weatherCode[index],
                  cityDetail.temperature > 10 ? 1 : 0
                )
              }}
            </div>
            <div class="text-body-1 font-weight-medium mt-2">
              <span class="text-high-temp"
                >{{
                  Math.round(cityDetail.daily.temperature2mMax[index])
                }}°</span
              >
              /
              <span class="text-low-temp"
                >{{
                  Math.round(cityDetail.daily.temperature2mMin[index])
                }}°</span
              >
            </div>
            <div class="text-body-2 text-caption">
              P:
              {{
                Math.round(cityDetail.daily.precipitationSum[index] * 10) / 10
              }}
              mm
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<style scoped>
.back-button {
  position: absolute;
  top: 70px;
  left: 20px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.detail-card {
  max-width: 900px;
}

.daily-forecast-card {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.daily-forecast-card .text-high-temp {
  color: #ffcc80;
}

.daily-forecast-card .text-low-temp {
  color: #a7d9ff;
}
</style>
