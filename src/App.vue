<!-- src/App.vue -->
<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  import { useThemePersistence } from '@/composables/useThemePersistence'

  const { initAuth, user, loading: authLoading } = useAuth()
  const { toggleTheme, initializeTheme } = useThemePersistence()

  onMounted(() => {
    initializeTheme()
    initAuth()
  })
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
