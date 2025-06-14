<script setup lang="ts">
import {
  type City,
  type CityCoordinates,
  WeatherService,
} from "@/services/weatherService";
import { computed, ref } from "vue";
import { useAuth } from "@/composables/useAuth";

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

const handleSearchInput = (query: string | null) => {
  // Accept query directly from event
  console.log("SearchBar: handleSearchInput called with query:", query);
  const currentQuery = query?.trim() || "";

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
    } catch (error: any) {
      console.error("SearchBar: API search failed:", error);
      searchError.value = error.message || "Failed to search for cities.";
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
  } catch (error: any) {
    console.error("SearchBar: Failed to add city:", error);
    emit("error", error.message || "Failed to add city.");
  }
};
</script>

<template>
  <div>
    <v-autocomplete
      v-model="searchQuery"
      class="mb-4"
      clearable
      :disabled="props.disabled || !user"
      item-title="name"
      item-value="id"
      :items="searchResults"
      label="Search for a city to add..."
      :loading="searchLoading"
      placeholder="e.g., London, Tokyo"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      @keydown.enter="handleSearchInput(searchQuery || '')"
      @update:search="handleSearchInput"
    >
      <template #item="{ props: itemProps, item }">
        <v-list-item
          v-bind="itemProps"
          @click="handleAddCity(item.raw as CityCoordinates)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.raw.country }}</v-list-item-subtitle>
          <template #append>
            <v-icon
              v-if="existingCityIds.has(item.raw.id)"
              class="ml-2"
              color="success"
              >mdi-check-circle</v-icon
            >
          </template>
        </v-list-item>
      </template>
      <template #no-data>
        <v-list-item>
          <v-list-item-title
            >No results found or start typing...</v-list-item-title
          >
        </v-list-item>
      </template>
      <template #append-inner>
        <v-progress-circular
          v-if="searchLoading"
          color="primary"
          indeterminate
          size="24"
          width="2"
        />
      </template>
    </v-autocomplete>

    <v-row v-if="searchError">
      <v-col cols="12">
        <v-alert
          class="mb-4"
          closable
          :text="searchError"
          type="warning"
          variant="tonal"
          @click:close="searchError = null"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped></style>
