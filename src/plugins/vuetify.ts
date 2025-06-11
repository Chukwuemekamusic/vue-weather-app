/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'weatherAppTheme',
    themes: {
      weatherAppTheme: {
        dark: true,
        colors: {
          // --- Main App Colors ---
          'background': '#2A61F8',
          'on-background': '#D4E6F1', // Your primary text color on the main background
          'surface': '#3A73E8', // A slightly lighter blue for cards/surfaces
          'on-surface': '#D4E6F1', // Text/icons color on the surface

          // --- Weather Card Specific Gradient Colors ---
          // Sunny/Clear
          'weatherSunnyStart': '#FDB813', // From Figma: sunny-gradient for sunny days card (70%)
          'weatherSunnyEnd': '#FF7F50', // From Figma: sunny-gradient for sunny days card (30%)

          // Cloudy/Overcast (Tailwind equivalents)
          'weatherCloudyStart': '#A0AEC0', // gray-400
          'weatherCloudyEnd': '#718096', // gray-600 (This one matches your #9E9E9E `gray-weather-cool` well for solid cards)

          // Rainy/Rain (Tailwind equivalents)
          'weatherRainyStart': '#6DA4BB', // blue-500
          'weatherRainyEnd': '#336B87', // blue-700

          // Snowy/Snow (Tailwind equivalents)
          'weatherSnowyStart': '#93C5FD', // blue-200
          'weatherSnowyEnd': '#60A5FA', // blue-400

          // Default (Tailwind equivalents)
          'weatherDefaultStart': '#60A5FA', // blue-400
          'weatherDefaultEnd': '#2563EB', // blue-600

          // Specific solid color for cloudy cards (if you want it as a solid, not gradient)
          'grayWeatherCool': '#9E9E9E',
        },
      },
    },
  },
})
