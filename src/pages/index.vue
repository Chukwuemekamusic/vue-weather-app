<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import WeatherCard from '@/components/WeatherCard.vue'
  import { useAuth } from '@/composables/useAuth'
  import { type City, WeatherService } from '@/services/weatherService'

  const weatherService = new WeatherService()
  const { user, loading: authLoading } = useAuth()

  const cities = ref<City[]>([])
  const weatherLoading = ref(false)
  const error = ref<string | null>(null) // Global error for weather fetching or city operations

  const searchQuery = ref<string>('')

  const loadAllCitiesWeatherData = async () => {
    weatherLoading.value = true
    error.value = null // Clear general errors

    try {
      const fetchedCities = await weatherService.getAllDbCitiesWeather()
      cities.value = fetchedCities
    } catch (error_: any) {
      console.error('Failed to load all cities weather data:', error_)
      error.value = error_.message || 'Failed to load all weather data.'
      cities.value = [] // Clear list if there's a global error fetching all
    } finally {
      weatherLoading.value = false
    }
  }

  // Handle retry for a single city's weather data
  const handleRetryFetch = async (cityId: number) => {
    const cityIndex = cities.value.findIndex(city => city.id === cityId)
    if (cityIndex === -1) {
      console.warn(`City with ID ${cityId} not found for retry.`)
      return
    }

    // Set individual city to loading state
    cities.value[cityIndex].loading = true
    cities.value[cityIndex].error = null // Clear previous error
    console.log(`Attempting to re-fetch weather for city ID: ${cityId}`)

    try {
      const updatedCity = await weatherService.getCityWeather(cityId) // Use getCityWeather for single city
      if (updatedCity) {
        cities.value[cityIndex] = updatedCity // Replace with updated data
      } else {
        // If getCityWeather returns null (city not found), mark as an error again
        cities.value[cityIndex].error = 'City data could not be retrieved.'
        cities.value[cityIndex].loading = false
      }
    } catch (error_: any) {
      console.error(`Failed to re-fetch weather for city ID ${cityId}:`, error_)
      cities.value[cityIndex].error = error_.message || 'Failed to refresh data.'
      cities.value[cityIndex].loading = false
    }
  }

  // Watch for user changes and load weather data
  watch(
    [user, authLoading],
    async ([newUser, newAuthLoading], [oldUser, oldAuthLoading]) => {
      if (!newAuthLoading && (newUser !== oldUser || oldAuthLoading)) {
        await loadAllCitiesWeatherData()
      }
    },
    { immediate: true },
  )

  // Computed property to filter cities based on searchQuery
  const filteredCities = computed(() => {
    if (!searchQuery.value) {
      return cities.value // If search query is empty, return all cities
    }

    const query = searchQuery.value.toLowerCase()
    return cities.value.filter(
      city =>
        city.name.toLowerCase().includes(query)
        || city.country.toLowerCase().includes(query),
    )
  })

  // Determine overall loading state (auth or weather data)
  const overallLoading = computed(
    () => authLoading.value || weatherLoading.value,
  )
</script>

<template>
  <div class="container mx-auto p-4 d-flex flex-column text-center">
    <h1 class="text-on-background">Weather App Dashboard</h1>
    <p class="mb-4 text-body-1 text-on-background">
      View current weather conditions for various cities around the world
    </p>
    <v-text-field
      v-model="searchQuery"
      class="mb-6"
      clearable
      :disabled="overallLoading || (cities.length === 0 && !searchQuery)"
      label="Filter cities by name or country"
      prepend-inner-icon="mdi-filter"
      variant="outlined"
    />

    <v-row v-if="error">
      <v-col cols="12">
        <v-alert
          class="mb-4"
          closable
          :text="error"
          type="error"
          variant="tonal"
          @click:close="error = null"
        />
      </v-col>
    </v-row>

    <v-row v-if="error">
      <v-col cols="12">
        <v-alert
          class="mb-4"
          closable
          :text="error"
          type="error"
          variant="tonal"
          @click:close="error = null"
        />
      </v-col>
    </v-row>

    <v-row v-if="overallLoading">
      <v-col class="text-center" cols="12">
        <v-progress-circular
          class="mb-4"
          color="primary"
          indeterminate
          size="64"
        />
        <p class="text-h6 text-on-background">Loading weather data...</p>
      </v-col>
    </v-row>

    <div
      v-else-if="cities.length === 0 && !searchQuery"
      class="text-center text-on-background"
    >
      <p class="text-h6 text-medium-emphasis">
        No cities available in the database.
      </p>
      <p class="text-body-1 text-medium-emphasis">
        (You might need to add cities to your Supabase `public.cities` table).
      </p>
      <v-btn
        class="mt-4"
        color="primary"
        variant="elevated"
        @click="loadAllCitiesWeatherData"
      >
        <v-icon start>mdi-refresh</v-icon> Reload All
      </v-btn>
    </div>

    <div
      v-else-if="filteredCities.length === 0 && searchQuery"
      class="text-center text-on-background"
    >
      <p class="text-h6 text-medium-emphasis">
        No cities match "{{ searchQuery }}".
      </p>
      <p class="text-body-1 text-medium-emphasis">
        Try a different filter or clear the search.
      </p>
    </div>

    <div v-else-if="!user" class="text-center text-on-background">
      <p class="text-h6 text-medium-emphasis">
        Please log in to see your saved cities and manage them.
      </p>
      <v-btn
        class="mt-4"
        color="primary"
        variant="elevated"
        @click="$router.push('/login')"
      >
        Go to Login
      </v-btn>
    </div>

    <div v-else class="d-flex flex-wrap">
      <v-row>
        <v-col
          v-for="city in filteredCities"
          :key="city.id"
          cols="12"
          lg="3"
          md="4"
          sm="6"
        >
          <WeatherCard
            :city="city"
            class="mx-auto"
            @retry-fetch="handleRetryFetch"
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
