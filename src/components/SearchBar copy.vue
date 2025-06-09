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

const searchQuery = ref<string>("");
const selectedValue = ref<number | null>(null);
const searchResults = ref<CityCoordinates[]>([]);
const searchLoading = ref(false);
const searchError = ref<string | null>(null);

const existingCityIds = computed(
  () => new Set(props.existingCities.map((city) => city.id))
);

let searchTimeout: ReturnType<typeof setTimeout>;

// Watch for searchQuery changes and trigger search
watch(searchQuery, (newVal) => {
  console.log("SearchBar: searchQuery changed to:", newVal);
  handleSearchInput(newVal);
});

// Watch for selection changes (when an item is clicked/chosen from dropdown)
watch(selectedValue, (newVal) => {
  console.log("SearchBar: selectedValue changed to:", newVal);
  if (newVal) {
    handleSelection(newVal);
  }
});

const handleSearchInput = (query: string) => {
  console.log("SearchBar: handleSearchInput called with query:", query);
  const currentQuery = query?.trim() || "";

  clearTimeout(searchTimeout);

  if (currentQuery.length < 2) {
    console.log("SearchBar: Query too short, clearing results.");
    searchResults.value = [];
    searchError.value = null;
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
    clearSearch();
    return;
  }

  try {
    await weatherService.addSavedCity(user.value.id, cityToAdd.id);
    emit("city-added", cityToAdd);
    clearSearch();
    console.log("SearchBar: City added successfully, search cleared.");
  } catch (err: any) {
    console.error("SearchBar: Failed to add city:", err);
    emit("error", err.message || "Failed to add city.");
  }
};

// Handle selection from dropdown
const handleSelection = (selectedId: number | null) => {
  if (selectedId) {
    const selectedCity = searchResults.value.find(
      (city) => city.id === selectedId
    );
    if (selectedCity) {
      handleAddCity(selectedCity);
    }
  }
};

// New function to handle Enter key press
const handleEnterKey = () => {
  const currentQuery = searchQuery.value?.trim();
  if (!currentQuery || currentQuery.length < 2) {
    // If query is too short or empty, just clear or do nothing
    clearSearch();
    return;
  }

  // If there are search results and the query exactly matches one of them (case-insensitive)
  // or a user has selected an item, add that city.
  const exactMatch = searchResults.value.find(
    (city) => city.name.toLowerCase() === currentQuery.toLowerCase()
  );

  if (selectedValue.value) {
    // If an item is already selected by v-model (e.g., user navigated with arrow keys and pressed enter)
    handleSelection(selectedValue.value);
  } else if (exactMatch) {
    // If there's an exact text match for the typed query
    handleAddCity(exactMatch);
  } else {
    // If no exact match or selection, but query is long enough,
    // you could optionally re-run search, or just let the debounce handle it.
    // For now, if no explicit selection or exact match, we rely on the debounce logic.
    // This could also be a trigger to add the *first* result if desired,
    // but clicking it is more explicit.
    console.log(
      "No exact match or selection, relying on current search logic."
    );
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  selectedValue.value = null;
  searchResults.value = [];
  searchError.value = null;
};

// Computed property for formatted search results
const formattedResults = computed(() => {
  return searchResults.value.map((city) => ({
    ...city,
    title: city.name,
    subtitle: city.country,
    value: city.id,
  }));
});
</script>

<template>
  <div>
    <v-autocomplete
      v-model="selectedValue"
      v-model:search="searchQuery"
      :items="formattedResults"
      item-title="title"
      item-value="value"
      label="Search for a city to add..."
      placeholder="e.g., London, Tokyo"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      clearable
      :loading="searchLoading"
      :disabled="props.disabled || !user"
      class="mb-4"
      hide-no-data
      return-object
      @update:model-value="handleSelection"
      @click:clear="clearSearch"
      @keydown.enter.native.prevent="handleEnterKey"
    >
      <template v-slot:item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps">
          <template v-slot:prepend>
            <v-icon color="primary">mdi-map-marker</v-icon>
          </template>
          <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.raw.country }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon
              v-if="existingCityIds.has(item.raw.id)"
              color="success"
              class="ml-2"
            >
              mdi-check-circle
            </v-icon>
            <v-icon v-else color="primary" class="ml-2">
              mdi-plus-circle
            </v-icon>
          </template>
        </v-list-item>
      </template>

      <template v-slot:no-data>
        <v-list-item
          v-if="
            searchQuery.length >= 2 &&
            !searchLoading &&
            searchResults.length === 0
          "
        >
          <v-list-item-title>
            No cities found for "{{ searchQuery }}"
          </v-list-item-title>
          <v-list-item-subtitle>
            Try a different search term
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-else-if="searchQuery.length < 2">
          <v-list-item-title>
            Start typing to search for cities...
          </v-list-item-title>
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

    <v-alert
      v-if="searchError"
      type="warning"
      variant="tonal"
      :text="searchError"
      class="mb-4"
      closable
      @click:close="searchError = null"
    />
  </div>
</template>

<style scoped>
/* Any specific styles for SearchBar.vue if needed */
</style>
