<script setup lang="ts">
  import type { VForm } from 'vuetify/components'
  import { ref } from 'vue'

  const form = ref<VForm | null>(null)
  const loading = ref(false)

  // Form data
  const cityName = ref('')
  const country = ref('')

  // Validation rules
  const rules = {
    required: (v: string) => !!v || 'This field is required',
    minLength: (v: string) => v.length >= 2 || 'Minimum 2 characters',
  }

  // Form submission
  const handleSubmit = async () => {
    if (!form.value) return

    const { valid } = await form.value.validate()

    if (valid) {
      loading.value = true
      try {
        // Handle form submission here
        console.log('Form submitted:', {
          cityName: cityName.value,
          country: country.value,
        })
        // Reset form after successful submission
        form.value.reset()
      } catch (error) {
        console.error('Error submitting form:', error)
      } finally {
        loading.value = false
      }
    }
  }
</script>

<template>
  <v-form ref="form" class="pa-4" @submit.prevent="handleSubmit">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="cityName"
            label="City Name"
            required
            :rules="[rules.required, rules.minLength]"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="country"
            label="Country"
            required
            :rules="[rules.required, rules.minLength]"
            variant="outlined"
          />
        </v-col>

        <v-col class="d-flex justify-end" cols="12">
          <v-btn
            color="primary"
            :disabled="loading"
            :loading="loading"
            type="submit"
          >
            Submit
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
