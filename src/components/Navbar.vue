<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/composables/useAuth";

interface NavbarProps {
  user: User | null;
  loading: boolean;
}

const props = defineProps<NavbarProps>();

const emit = defineEmits<{
  (e: "toggle-theme"): void;
}>();

const theme = useTheme();
const currentTheme = computed(() =>
  theme.global.current.value.dark ? "Weather App Theme" : "Light"
);

const toggleTheme = () => {
  emit("toggle-theme");
};

const { signInWithGoogle, signOut } = useAuth();

const handleSignIn = async () => {
  try {
    await signInWithGoogle();
  } catch (error) {
    // TODO: HANDLE ERROR
    console.error("login failed", error);
  }
};

const handleSignOut = async () => {
  try {
    await signOut();
  } catch (error) {
    // Handle error
    console.error("Logout failed:", error);
  }
};
</script>

<template>
  <v-app-bar app color="surface" dark>
    <v-app-bar-title class="font-weight-bold">Weather App</v-app-bar-title>
    <v-spacer></v-spacer>

    <v-btn
      icon
      @click="toggleTheme"
      class="mr-2"
      :title="`Switch to ${
        currentTheme === 'Light' ? 'Weather App Theme' : 'Light'
      } theme`"
    >
      <v-icon>
        {{
          currentTheme === "Light" ? "mdi-weather-night" : "mdi-weather-sunny"
        }}
      </v-icon>
    </v-btn>

    <template v-if="loading">
      <v-progress-circular
        indeterminate
        size="24"
        width="2"
        color="on-surface"
      />
    </template>
    <template v-else>
      <v-menu v-if="user">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            color="on-surface"
            variant="flat"
            prepend-icon="mdi-account-circle"
          >
            {{ user.email || user.user_metadata?.full_name || "User" }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="handleSignOut">
            <v-list-item-title>Sign Out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        v-else
        color="on-surface"
        variant="elevated"
        @click="handleSignIn"
        prepend-icon="mdi-google"
      >
        Sign In with Google
      </v-btn>
    </template>
  </v-app-bar>
</template>

<style scoped></style>
