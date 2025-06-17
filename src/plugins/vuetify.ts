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
          // --- Weather Card Specific Gradient Colors ---
          // Sunny/Clear
          weatherSunnyStart: '#FDB813',
          weatherSunnyEnd: '#FF7F50',

          // Cloudy/Overcast (Tailwind equivalents)
          weatherCloudyStart: '#A0AEC0',
          weatherCloudyEnd: '#718096',

          // Rainy/Rain (Tailwind equivalents)
          weatherRainyStart: '#6DA4BB',
          weatherRainyEnd: '#336B87',

          // Snowy/Snow (Tailwind equivalents)
          weatherSnowyStart: '#93C5FD',
          weatherSnowyEnd: '#60A5FA',

          // Default (Tailwind equivalents)
          weatherDefaultStart: '#60A5FA',
          weatherDefaultEnd: '#2563EB',

          // Specific solid color for cloudy cards (if you want it as a solid, not gradient)
          grayWeatherCool: '#9E9E9E',
        },
      },
      weatherAppLightTheme: {
        dark: false,
        colors: {
          // --- Weather Card Specific Gradient Colors ---
          // Sunny/Clear
          weatherSunnyStart: '#FDB813',
          weatherSunnyEnd: '#FF7F50',

          // Cloudy/Overcast (Tailwind equivalents)
          weatherCloudyStart: '#A0AEC0',
          weatherCloudyEnd: '#718096',

          // Rainy/Rain (Tailwind equivalents)
          weatherRainyStart: '#6DA4BB',
          weatherRainyEnd: '#336B87',

          // Snowy/Snow (Tailwind equivalents)
          weatherSnowyStart: '#93C5FD',
          weatherSnowyEnd: '#60A5FA',

          // Default (Tailwind equivalents)
          weatherDefaultStart: '#60A5FA',
          weatherDefaultEnd: '#2563EB',

          // Specific solid color for cloudy cards
          grayWeatherCool: '#9E9E9E',
        },
      },
    },
  },
})
