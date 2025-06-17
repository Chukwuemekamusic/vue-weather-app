// composables/useThemePersistence.js
import { computed, ref, watch } from "vue";
import { useTheme } from "vuetify";

export function useThemePersistence() {
  const theme = useTheme();
  const THEME_STORAGE_KEY = "weather-app-theme";

  // Initialize theme from localStorage or default
  const initializeTheme = () => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        theme.global.name.value = savedTheme;
      }
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
    }
  };

  // Save theme to localStorage
  const saveTheme = (themeName: string) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  };

  // Watch for theme changes and save them
  watch(
    () => theme.global.name.value,
    (newTheme) => {
      if (newTheme) {
        saveTheme(newTheme);
      }
    },
    { immediate: false }
  );

  const toggleTheme = () => {
    const newTheme = theme.global.current.value.dark
      ? "weatherAppLightTheme"
      : "weatherAppTheme";

    theme.global.name.value = newTheme;
  };

  const currentTheme = computed(() =>
    theme.global.current.value.dark
      ? "Weather App Theme"
      : "Weather App Light Theme"
  );

  return {
    theme,
    currentTheme,
    toggleTheme,
    initializeTheme,
  };
}
