<!-- src/App.vue -->
<script lang="ts" setup>
import { onMounted } from "vue";
import { useTheme } from "vuetify";
import { useAuth } from "@/composables/useAuth";

const { initAuth, user, loading: authLoading } = useAuth();

const theme = useTheme();
// const currentTheme = computed(() =>
//   theme.global.current.value.dark ? "Weather App Theme" : "Light"
// );

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark
    ? "weatherAppLightTheme"
    : "weatherAppTheme";
};

onMounted(() => {
  initAuth();
});
</script>

<template>
  <v-app>
    <Navbar :loading="authLoading" :user="user" @toggle-theme="toggleTheme" />
    <v-main class="pa-8 mt-16">
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
.app-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
}
</style>
