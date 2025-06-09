<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  WeatherService,
  type CityCoordinates,
} from "@/services/weatherService";
import { useAuth } from "@/composables/useAuth";
import type { City } from "@/services/weatherService";

interface Props {
  disabled: boolean;
  existingCities: City[];
}

const props = defineProps<Props>();

interface Emits {
  (e: "city-added", city: CityCoordinates): void;
  (e: "error", message: string): void;
}

const emit = defineEmits<Emits>();

const weatherService = new WeatherService();
const { user } = useAuth();

const searchQuery = ref<string | null>("");
const searchResults = ref<CityCoordinates[]>([]);
const searchLoading = ref(false);
const searchError = ref<string | null>(null);

const existingCityIds = computed(
  () => new Set(props.existingCities.map((city) => city.id))
);

let searchTimeout: ReturnType<typeof setTimeout>;

// IMPORTANT: Add a watch for searchQuery to see if it updates
watch(searchQuery, (newVal) => {
  console.log("SearchBar: searchQuery changed to:", newVal);
  // This watch is just for debugging. Do not keep in final code unless needed for other logic.
  // It effectively calls handleSearchInput, but the @update:search event is the primary trigger.
  // We're keeping handleSearchInput separate to trace the event.
});

const handleSearchInput = (query: string | null) => {
  // Accept query directly from event
  console.log("SearchBar: handleSearchInput called with query:", query);
  const currentQuery = query?.trim() || ""; // Use the directly passed query

  clearTimeout(searchTimeout);

  if (currentQuery.length < 2) {
    console.log("SearchBar: Query too short, clearing results.");
    searchResults.value = [];
    return;
  }

  searchLoading.value = true;
  searchError.value = null;

  searchTimeout = setTimeout(async () => {
    console.log("SearchBar: Debounced search initiated for:", currentQuery);
    try {
      const fetchedResults = await weatherService.searchCities(currentQuery);
      console.log("SearchBar: API search results:", fetchedResults);
      searchResults.value = fetchedResults;
    } catch (err: any) {
      console.error("SearchBar: API search failed:", err);
      searchError.value = err.message || "Failed to search for cities.";
      searchResults.value = [];
    } finally {
      searchLoading.value = false;
      console.log("SearchBar: Search loading finished.");
    }
  }, 300);
};

const handleAddCity = async (cityToAdd: CityCoordinates) => {
  console.log("SearchBar: handleAddCity called for:", cityToAdd.name);
  if (!user.value) {
    emit("error", "Please log in to save cities.");
    return;
  }

  if (existingCityIds.value.has(cityToAdd.id)) {
    emit("error", `${cityToAdd.name} is already in your list.`);
    searchQuery.value = null;
    searchResults.value = [];
    return;
  }

  try {
    await weatherService.addSavedCity(user.value.id, cityToAdd.id);
    emit("city-added", cityToAdd);

    searchQuery.value = null;
    searchResults.value = [];
    console.log("SearchBar: City added successfully, search cleared.");
  } catch (err: any) {
    console.error("SearchBar: Failed to add city:", err);
    emit("error", err.message || "Failed to add city.");
  }
};
</script>

<template>
  <div>
    <v-autocomplete
      v-model="searchQuery"
      :items="searchResults"
      item-title="name"
      item-value="id"
      label="Search for a city to add..."
      placeholder="e.g., London, Tokyo"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      clearable
      :loading="searchLoading"
      :disabled="props.disabled || !user"
      @update:search="handleSearchInput"
      @keydown.enter="handleSearchInput(searchQuery || '')"
      class="mb-4"
    >
      <template v-slot:item="{ props: itemProps, item }">
        <v-list-item
          v-bind="itemProps"
          @click="handleAddCity(item.raw as CityCoordinates)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.raw.country }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon
              v-if="existingCityIds.has(item.raw.id)"
              color="success"
              class="ml-2"
              >mdi-check-circle</v-icon
            >
          </template>
        </v-list-item>
      </template>
      <template v-slot:no-data>
        <v-list-item>
          <v-list-item-title
            >No results found or start typing...</v-list-item-title
          >
        </v-list-item>
      </template>
      <template v-slot:append-inner>
        <v-progress-circular
          v-if="searchLoading"
          indeterminate
          size="24"
          width="2"
          color="primary"
        />
      </template>
    </v-autocomplete>

    <v-row v-if="searchError">
      <v-col cols="12">
        <v-alert
          type="warning"
          variant="tonal"
          :text="searchError"
          class="mb-4"
          closable
          @click:close="searchError = null"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
/* Any specific styles for SearchBar.vue if needed */
</style>
