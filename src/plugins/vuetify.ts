/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from "vuetify";
// Styles
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: "weatherAppTheme",
    themes: {
      weatherAppTheme: {
        dark: true,
        colors: {
          // --- Main App Colors ---
          // background: "#2A61F8",
          // "on-background": "#D4E6F1",
          // surface: "#3A73E8",
          // "on-surface": "#D4E6F1",

          // --- Main App Colors ---
          background: "#0f172a", // Almost black-blue
          "on-background": "#cbd5e1", // Soft gray-blue text
          surface: "#1e293b", // Dark slate blue
          "on-surface": "#cbd5e1",

          // --- Weather Card Specific Gradient Colors ---
          // Sunny/Clear
          weatherSunnyStart: "#FDB813",
          weatherSunnyEnd: "#FF7F50",

          // Cloudy/Overcast (Tailwind equivalents)
          weatherCloudyStart: "#A0AEC0",
          weatherCloudyEnd: "#718096",

          // Rainy/Rain (Tailwind equivalents)
          weatherRainyStart: "#6DA4BB",
          weatherRainyEnd: "#336B87",

          // Snowy/Snow (Tailwind equivalents)
          weatherSnowyStart: "#93C5FD",
          weatherSnowyEnd: "#60A5FA",

          // Default (Tailwind equivalents)
          weatherDefaultStart: "#60A5FA",
          weatherDefaultEnd: "#2563EB",

          // Specific solid color for cloudy cards (if you want it as a solid, not gradient)
          grayWeatherCool: "#9E9E9E",
        },
      },
      weatherAppLightTheme: {
        dark: false,
        colors: {
          // Using Vuetify's default light theme colors
          background: "#FFFFFF",
          "on-background": "#000000",
          surface: "#F5F5F5",
          "on-surface": "#000000",
          "text-primary": "#000000", // Black text for light theme

          // --- Weather Card Specific Gradient Colors ---
          // Sunny/Clear
          weatherSunnyStart: "#FDB813",
          weatherSunnyEnd: "#FF7F50",

          // Cloudy/Overcast (Tailwind equivalents)
          weatherCloudyStart: "#A0AEC0",
          weatherCloudyEnd: "#718096",

          // Rainy/Rain (Tailwind equivalents)
          weatherRainyStart: "#6DA4BB", // blue-500
          weatherRainyEnd: "#336B87", // blue-700

          // Snowy/Snow (Tailwind equivalents)
          weatherSnowyStart: "#93C5FD", // blue-200
          weatherSnowyEnd: "#60A5FA", // blue-400

          // Default (Tailwind equivalents)
          weatherDefaultStart: "#60A5FA", // blue-400
          weatherDefaultEnd: "#2563EB", // blue-600

          // Specific solid color for cloudy cards
          grayWeatherCool: "#9E9E9E",
        },
      },
    },
  },
});
