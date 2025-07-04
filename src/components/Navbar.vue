<script setup lang="ts">
  import type { User } from '@supabase/supabase-js'
  import { useAuth } from '@/composables/useAuth'
  import { useThemePersistence } from '@/composables/useThemePersistence'

  interface NavbarProps {
    user: User | null
    loading: boolean
  }

  defineProps<NavbarProps>()

  const { signInWithGoogle, signOut } = useAuth()
  const { currentTheme, toggleTheme } = useThemePersistence()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      // TODO: HANDLE ERROR
      console.error('login failed', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      // Handle error
      console.error('Logout failed:', error)
    }
  }
</script>

<template>
  <v-app-bar app color="surface" dark>
    <v-app-bar-title class="font-weight-bold">Weather App</v-app-bar-title>
    <v-spacer />

    <v-btn
      class="mr-2"
      icon
      :title="`Switch to ${
        currentTheme === 'Weather App Light Theme'
          ? 'Weather App Theme'
          : 'Weather App Light Theme'
      } theme`"
      @click="toggleTheme"
    >
      <v-icon>
        {{
          currentTheme === "Weather App Light Theme"
            ? "mdi-weather-night"
            : "mdi-weather-sunny"
        }}
      </v-icon>
    </v-btn>

    <template v-if="loading">
      <v-progress-circular
        color="on-surface"
        indeterminate
        size="24"
        width="2"
      />
    </template>
    <template v-else>
      <v-menu v-if="user">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            color="on-surface"
            prepend-icon="mdi-account-circle"
            variant="flat"
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
        prepend-icon="mdi-google"
        variant="elevated"
        @click="handleSignIn"
      >
        Sign In with Google
      </v-btn>
    </template>
  </v-app-bar>
</template>

<style scoped></style>
