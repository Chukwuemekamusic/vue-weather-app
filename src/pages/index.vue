<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import {
  WeatherService,
  type City,
  type CityCoordinates,
} from "@/services/weatherService";
import { useAuth } from "@/composables/useAuth";
import SearchBar from "@/components/SearchBar.vue"; // Import the new SearchBar component
import WeatherCard from "@/components/WeatherCard.vue"; // Keep this import

const weatherService = new WeatherService();
const { user, loading: authLoading } = useAuth();

const cities = ref<City[]>([]);
const weatherLoading = ref(false);
const error = ref<string | null>(null); // Global error for weather fetching or city operations

// Function to load weather data for the current user's saved cities
const loadWeatherData = async (userId: string) => {
  weatherLoading.value = true;
  error.value = null; // Clear general errors

  try {
    const fetchedCities = await weatherService.getSavedCitiesWeather(userId);
    cities.value = fetchedCities;
  } catch (err: any) {
    console.error("Failed to load user's weather data:", err);
    error.value = err.message || "Failed to load weather data.";
    cities.value = []; // Clear list if there's a global error fetching all
  } finally {
    weatherLoading.value = false;
  }
};

// Watch for user changes and load weather data
watch(
  user,
  async (newUser) => {
    if (newUser) {
      await loadWeatherData(newUser.id);
    } else {
      cities.value = []; // Clear cities if user logs out
    }
  },
  { immediate: true }
);

// Handle city added from SearchBar
const handleCityAdded = async (newCityCoords: CityCoordinates) => {
  if (!user.value) return; // Should not happen if SearchBar is disabled when no user

  // Optimistic UI update: Temporarily add the city to the display with a loading state

  const isAlreadyOptimisticallyAdded = cities.value.some(
    (c: City) => c.id === newCityCoords.id && c.loading
  );
  if (!isAlreadyOptimisticallyAdded) {
    cities.value.unshift({
      id: newCityCoords.id,
      name: newCityCoords.name,
      country: newCityCoords.country,
      temperature: 0,
      condition: "Adding...",
      humidity: 0,
      windSpeed: 0,
      feelsLike: 0,
      icon: "mdi-cloud-sync-outline",
      weatherType: "default",
      loading: true,
      error: null,
    });
  }

  // Then trigger a full reload to get the fresh data and remove loading state
  await loadWeatherData(user.value.id);
};

// Handle error emitted from SearchBar
const handleSearchBarError = (message: string) => {
  error.value = message;
};

// Remove city from display and database
const removeCity = async (cityId: number) => {
  if (!user.value) {
    alert("Please log in to remove cities."); // This should be covered by auth guard, but good fallback
    return;
  }

  // Optimistic UI update: Remove the city immediately
  const originalCities = [...cities.value];
  cities.value = cities.value.filter((city: City) => city.id !== cityId);

  try {
    await weatherService.removeSavedCity(user.value.id, cityId);
    // If successful, no need to reload all cities, optimistic update is fine.
  } catch (err: any) {
    console.error("Failed to remove city:", err);
    error.value = err.message || "Failed to remove city.";
    // Revert if API call fails
    cities.value = originalCities;
  }
};

// Refresh weather data (for currently saved cities)
const refreshWeather = async () => {
  if (user.value) {
    await loadWeatherData(user.value.id);
  } else {
    // This case should be covered by the "Not Authenticated" block
    alert("Please log in to refresh weather data.");
  }
};

// Determine overall loading state (auth or weather data)
const overallLoading = computed(
  () => authLoading.value || weatherLoading.value
);
</script>

<template>
  <div class="container mx-auto p-4 d-flex flex-column text-center">
    <h1 class="text-on-background">Weather App Dashboard</h1>
    <p class="mb-4 text-body-1 text-on-background">
      Track weather conditions across multiple cities
    </p>

    <SearchBar
      :disabled="overallLoading"
      :existing-cities="cities"
      @city-added="handleCityAdded"
      @error="handleSearchBarError"
    />

    <v-row v-if="error">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          :text="error"
          class="mb-4"
          closable
          @click:close="error = null"
        />
      </v-col>
    </v-row>

    <v-row v-if="overallLoading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          class="mb-4"
        />
        <p class="text-h6 text-on-background">Loading weather data...</p>
      </v-col>
    </v-row>

    <div v-else-if="!user" class="text-center text-on-background">
      <p class="text-h6 text-medium-emphasis">
        Please log in to see your saved cities and manage them.
      </p>
      <v-btn
        @click="$router.push('/login')"
        color="primary"
        variant="elevated"
        class="mt-4"
      >
        Go to Login
      </v-btn>
    </div>

    <div
      v-else-if="cities.length === 0 && !overallLoading"
      class="text-center text-on-background"
    >
      <p class="text-h6 text-medium-emphasis">
        No cities added yet. Use the search bar to find and add your first city!
      </p>
      <v-btn
        @click="refreshWeather"
        color="primary"
        variant="elevated"
        class="mt-4"
        >Refresh</v-btn
      >
    </div>

    <div v-else class="d-flex flex-wrap">
      <v-row>
        <v-col
          v-for="city in cities"
          :key="city.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <WeatherCard
            :city="city"
            class="mx-auto"
            @remove="removeCity(city.id)"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<route lang="json">
{
  "meta": {
    "requiresAuth": true
  }
}
</route>
