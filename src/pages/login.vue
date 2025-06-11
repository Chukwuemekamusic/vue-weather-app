<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";

const router = useRouter();
const {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  user,
  loading,
  authError,
} = useAuth();

const email = ref("");
const password = ref("");
const isRegistering = ref(false);
const showPassword = ref(false);

const isLoading = ref(false);

// watch for changes in global auth user to redirect
watch(
  user,
  (newUser) => {
    if (newUser) {
      router.push("/");
    }
  },
  { immediate: true }
);

const handleGoogleSignIn = async () => {
  isLoading.value = true;
  try {
    await signInWithGoogle();
  } catch (err) {
    // Error is already handled and stored in authError by useAuth composable
    console.error("Google sign-in failed from component:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleEmailAuth = async () => {
  if (!email.value || !password.value) {
    console.error("Email and password are required");
    return;
  }

  isLoading.value = true;
  try {
    if (isRegistering.value) {
      await signUpWithEmail(email.value, password.value);
      if (!authError.value) {
        // If no error, assume success or confirmation email sent
        alert(
          "Registration successful! Please check your email to confirm your account."
        );
        isRegistering.value = false; // Switch back to login form
        email.value = "";
        password.value = "";
      }
    } else {
      await signInWithEmail(email.value, password.value);
    }
  } catch (err) {
    console.error("Email authentication failed from component:", err);
    // authError will contain the specific error message
  } finally {
    isLoading.value = false;
  }
};

const clearError = () => {
  // Clear the error in the composable if it has a method for it
  // TODO Otherwise, you might need to expose an error clearing method from useAuth
  if (authError.value) {
    authError.value = null;
  }
};
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
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="clearError"
        >
          {{ authError.message || authError }}
        </v-alert>

        <v-card-text>
          <v-form @submit.prevent="handleEmailAuth">
            <v-text-field
              v-model="email"
              label="Email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              type="email"
              required
              class="mb-4"
              :disabled="isLoading"
            />

            <v-text-field
              v-model="password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              variant="outlined"
              :type="showPassword ? 'text' : 'password'"
              required
              class="mb-4"
              :disabled="isLoading"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn
              type="submit"
              color="background"
              class="w-100 text-on-background"
              :loading="isLoading"
              :disabled="isLoading"
              size="large"
              variant="elevated"
            >
              {{ isRegistering ? "Register" : "Login" }}
            </v-btn>

            <v-divider class="my-4"></v-divider>

            <v-btn
              color=""
              class="w-100"
              :loading="isLoading"
              :disabled="isLoading"
              size="large"
              variant="outlined"
              prepend-icon="mdi-google"
              @click="handleGoogleSignIn"
            >
              Sign In with Google
            </v-btn>

            <div class="mt-4 text-center">
              <v-btn
                variant="text"
                @click="isRegistering = !isRegistering"
                :disabled="isLoading"
                class="text-body-2"
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
