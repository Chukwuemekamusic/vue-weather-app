<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '@/composables/useAuth'

  const router = useRouter()
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, authError }
    = useAuth()

  const email = ref('')
  const password = ref('')
  const isRegistering = ref(false)
  const showPassword = ref(false)

  const isLoading = ref(false)

  // watch for changes in global auth user to redirect
  watch(
    user,
    newUser => {
      if (newUser) {
        router.push('/')
      }
    },
    { immediate: true },
  )

  const handleGoogleSignIn = async () => {
    isLoading.value = true
    try {
      await signInWithGoogle()
    } catch (error) {
      // Error is already handled and stored in authError by useAuth composable
      console.error('Google sign-in failed from component:', error)
    } finally {
      isLoading.value = false
    }
  }

  const handleEmailAuth = async () => {
    if (!email.value || !password.value) {
      console.error('Email and password are required')
      return
    }

    isLoading.value = true
    try {
      if (isRegistering.value) {
        await signUpWithEmail(email.value, password.value)
        if (!authError.value) {
          // If no error, assume success or confirmation email sent
          alert(
            'Registration successful! Please check your email to confirm your account.',
          )
          isRegistering.value = false // Switch back to login form
          email.value = ''
          password.value = ''
        }
      } else {
        await signInWithEmail(email.value, password.value)
      }
    } catch (error) {
      console.error('Email authentication failed from component:', error)
    // authError will contain the specific error message
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    // Clear the error in the composable if it has a method for it
    // TODO Otherwise, you might need to expose an error clearing method from useAuth
    if (authError.value) {
      authError.value = null
    }
  }
</script>

<template>
  <div>
    <v-container class="d-flex justify-center align-center min-vh-100">
      <v-card class="pa-8 elevation-12 rounded-xl" max-width="450" width="100%">
        <v-card-title class="text-h5 font-weight-bold text-center mb-4">
          {{ isRegistering ? "Create Account" : "Sign In" }}
        </v-card-title>

        <v-alert
          v-if="authError"
          class="mb-4"
          closable
          type="error"
          variant="tonal"
          @click:close="clearError"
        >
          {{ authError.message || authError }}
        </v-alert>

        <v-card-text>
          <v-form @submit.prevent="handleEmailAuth">
            <v-text-field
              v-model="email"
              class="mb-4"
              :disabled="isLoading"
              label="Email"
              prepend-inner-icon="mdi-email"
              required
              type="email"
              variant="outlined"
            />

            <v-text-field
              v-model="password"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="mb-4"
              :disabled="isLoading"
              label="Password"
              prepend-inner-icon="mdi-lock"
              required
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn
              class="w-100 text-on-background"
              color="background"
              :disabled="isLoading"
              :loading="isLoading"
              size="large"
              type="submit"
              variant="elevated"
            >
              {{ isRegistering ? "Register" : "Login" }}
            </v-btn>

            <v-divider class="my-4" />

            <v-btn
              class="w-100"
              color=""
              :disabled="isLoading"
              :loading="isLoading"
              prepend-icon="mdi-google"
              size="large"
              variant="outlined"
              @click="handleGoogleSignIn"
            >
              Sign In with Google
            </v-btn>

            <div class="mt-4 text-center">
              <v-btn
                class="text-body-2"
                :disabled="isLoading"
                variant="text"
                @click="isRegistering = !isRegistering"
              >
                {{
                  isRegistering
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Register"
                }}
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped></style>
