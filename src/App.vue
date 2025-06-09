<!-- src/App.vue -->
<script lang="ts" setup>
import { useAuth } from "@/composables/useAuth";
import { onMounted } from "vue";
// import { useTheme } from "vuetify";

const { initAuth, user, loading: authLoading } = useAuth();

// const theme = useTheme();
// const currentTheme = computed(() =>
//   theme.global.current.value.dark ? "Weather App Theme" : "Light"
// );

// const toggleTheme = () => {
//   theme.global.name.value = theme.global.current.value.dark
//     ? "light"
//     : "weatherAppTheme";
// };

onMounted(() => {
  initAuth();
});
</script>

<template>
  <v-app>
    <Navbar :user="user" :loading="authLoading" />
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
