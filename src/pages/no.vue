<script lang="ts" setup>
import { ref, computed } from "vue";
import { weatherData } from "@/data/weatherData";

const searchQuery = ref("");

const handleSearch = () => {
  console.log("Searching for:", searchQuery.value);
};

const limitedWeatherData = computed(() => weatherData.slice(0, 5));
// const limitedWeatherData: City[] = [];
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-on-background">Weather App Dashboard</h1>
    <p class="">Track weather conditions across multiple cities</p>
    <v-text-field
      v-model="searchQuery"
      label="Search for a city..."
      placeholder="Lagos"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      clearable
      @input="handleSearch"
    />
    <div
      v-if="limitedWeatherData.length === 0"
      class="text-center text-on-background"
    >
      <p class="text-h6">
        No cities added yet. Search for a city to get started!
      </p>
    </div>
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <WeatherCard2
        v-for="city in limitedWeatherData"
        :key="city.id"
        :city="city"
      />
    </div>
  </div>
</template>
