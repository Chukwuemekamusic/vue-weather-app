<script setup lang="ts">
  import { fetchWeatherApi } from 'openmeteo'
  import { onMounted, ref } from 'vue'

  interface WeatherData {
    current: {
      time: Date
      temperature2m: number
      relativeHumidity2m: number
      apparentTemperature: number
      isDay: number
      precipitation: number
      rain: number
      showers: number
      snowfall: number
    }
    daily: {
      time: Date[]
      temperature2mMax: number[]
      temperature2mMin: number[]
      weatherCode: number[]
      precipitationSum: number[]
    }
  }

  const weatherData = ref<WeatherData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchWeather = async () => {
    try {
      const params = {
        latitude: 52.52,
        longitude: 13.41,
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'weather_code',
          'precipitation_sum',
        ],
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'rain',
          'showers',
          'snowfall',
        ],
      }
      const url = 'https://api.open-meteo.com/v1/forecast'
      const responses = await fetchWeatherApi(url, params)
      const response = responses[0]

      const utcOffsetSeconds = response.utcOffsetSeconds()
      const current = response.current()!
      const daily = response.daily()!

      weatherData.value = {
        current: {
          time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
          temperature2m: current.variables(0)!.value(),
          relativeHumidity2m: current.variables(1)!.value(),
          apparentTemperature: current.variables(2)!.value(),
          isDay: current.variables(3)!.value(),
          precipitation: current.variables(4)!.value(),
          rain: current.variables(5)!.value(),
          showers: current.variables(6)!.value(),
          snowfall: current.variables(7)!.value(),
        },
        daily: {
          time: Array.from({
            length:
              (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval(),
          }).map(
            (_, i) =>
              new Date(
                (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds)
                * 1000,
              ),
          ),
          temperature2mMax: Array.from(daily.variables(0)!.valuesArray()!),
          temperature2mMin: Array.from(daily.variables(1)!.valuesArray()!),
          weatherCode: Array.from(daily.variables(2)!.valuesArray()!),
          precipitationSum: Array.from(daily.variables(3)!.valuesArray()!),
        },
      }
    } catch (error_: any) {
      error.value = error_.message
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchWeather()
  })
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-h4 mb-4">Weather Service Test</h1>

    <v-btn
      class="mb-4"
      color="primary"
      :loading="loading"
      @click="fetchWeather"
    >
      Refresh Weather Data
    </v-btn>

    <v-alert v-if="error" class="mb-4" type="error">
      {{ error }}
    </v-alert>

    <v-card v-if="weatherData" class="pa-4">
      <h2 class="text-h5 mb-4">Current Weather</h2>
      <v-list>
        <v-list-item>
          <template #prepend>
            <v-icon>mdi-clock</v-icon>
          </template>
          <v-list-item-title>Time</v-list-item-title>
          <v-list-item-subtitle>{{
            weatherData.current.time.toLocaleString()
          }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon>mdi-thermometer</v-icon>
          </template>
          <v-list-item-title>Temperature</v-list-item-title>
          <v-list-item-subtitle>{{ weatherData.current.temperature2m }}°C</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon>mdi-water-percent</v-icon>
          </template>
          <v-list-item-title>Humidity</v-list-item-title>
          <v-list-item-subtitle>{{ weatherData.current.relativeHumidity2m }}%</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon>mdi-thermometer-lines</v-icon>
          </template>
          <v-list-item-title>Feels Like</v-list-item-title>
          <v-list-item-subtitle>{{
            weatherData.current.apparentTemperature
          }}°C</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <h2 class="text-h5 mt-6 mb-4">Daily Forecast</h2>
      <v-table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Max Temp</th>
            <th>Min Temp</th>
            <th>Weather Code</th>
            <th>Precipitation</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(day, index) in weatherData.daily.time" :key="index">
            <td>{{ new Date(day).toLocaleDateString() }}</td>
            <td>{{ weatherData.daily.temperature2mMax[index] }}°C</td>
            <td>{{ weatherData.daily.temperature2mMin[index] }}°C</td>
            <td>{{ weatherData.daily.weatherCode[index] }}</td>
            <td>{{ weatherData.daily.precipitationSum[index] }}mm</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-skeleton-loader v-else-if="loading" class="mx-auto" type="card" />
  </div>
</template>
