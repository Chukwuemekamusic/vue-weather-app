<script setup lang="ts">
import { ref } from "vue";
import type { VForm } from "vuetify/components";

const form = ref<VForm | null>(null);
const loading = ref(false);

// Form data
const cityName = ref("");
const country = ref("");

// Validation rules
const rules = {
  required: (v: string) => !!v || "This field is required",
  minLength: (v: string) => v.length >= 2 || "Minimum 2 characters",
};

// Form submission
const handleSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();

  if (valid) {
    loading.value = true;
    try {
      // Handle form submission here
      console.log("Form submitted:", {
        cityName: cityName.value,
        country: country.value,
      });
      // Reset form after successful submission
      form.value.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      loading.value = false;
    }
  }
};
</script>

<template>
  <v-form ref="form" @submit.prevent="handleSubmit" class="pa-4">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="cityName"
            label="City Name"
            :rules="[rules.required, rules.minLength]"
            variant="outlined"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="country"
            label="Country"
            :rules="[rules.required, rules.minLength]"
            variant="outlined"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" class="d-flex justify-end">
          <v-btn
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading"
          >
            Submit
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
