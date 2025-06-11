// src/services/weatherService.ts
import { fetchWeatherApi } from 'openmeteo'
import { supabase } from '@/lib/supabase'

export interface City {
  id: number
  name: string
  country: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  feelsLike: number
  icon: string
  weatherType: string
  loading?: boolean
  error?: string | null
  lat?: number
  lon?: number
  daily?: {
    time: Date[]
    temperature2mMax: Float32Array
    temperature2mMin: Float32Array
    weatherCode: Float32Array
    precipitationSum: Float32Array
  }
}

// Internal interface for city coordinates
export interface CityCoordinates {
  id: number
  name: string
  country: string
  lat: number
  lon: number
}

export interface WeatherResponse {
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
    windSpeed10m: number
    weatherCode: number
  }
  daily: {
    time: Date[]
    temperature2mMax: Float32Array
    temperature2mMin: Float32Array
    weatherCode: Float32Array
    precipitationSum: Float32Array
  }
}

export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast/'

  private WMO_WEATHER_CODES: {
    [key: number]: {
      condition: string
      icons: { day: string, night: string }
      weatherType: string
    }
  } = {
    0: {
      condition: 'Clear sky',
      icons: { day: 'mdi-weather-sunny', night: 'mdi-weather-night' },
      weatherType: 'sunny',
    },
    1: {
      condition: 'Mainly clear',
      icons: { day: 'mdi-weather-sunny', night: 'mdi-weather-night' },
      weatherType: 'sunny',
    },
    2: {
      condition: 'Partly cloudy',
      icons: {
        day: 'mdi-weather-partly-cloudy',
        night: 'mdi-weather-night-partly-cloudy',
      },
      weatherType: 'cloudy',
    },
    3: {
      condition: 'Overcast',
      icons: { day: 'mdi-weather-cloudy', night: 'mdi-weather-cloudy' },
      weatherType: 'cloudy',
    },
    45: {
      condition: 'Fog',
      icons: { day: 'mdi-weather-fog', night: 'mdi-weather-fog' },
      weatherType: 'cloudy',
    },
    48: {
      condition: 'Depositing rime fog',
      icons: { day: 'mdi-weather-fog', night: 'mdi-weather-fog' },
      weatherType: 'cloudy',
    },
    51: {
      condition: 'Drizzle (light)',
      icons: { day: 'mdi-weather-rainy', night: 'mdi-weather-rainy' },
      weatherType: 'rainy',
    },
    53: {
      condition: 'Drizzle (moderate)',
      icons: { day: 'mdi-weather-rainy', night: 'mdi-weather-rainy' },
      weatherType: 'rainy',
    },
    55: {
      condition: 'Drizzle (dense)',
      icons: { day: 'mdi-weather-rainy', night: 'mdi-weather-rainy' },
      weatherType: 'rainy',
    },
    56: {
      condition: 'Freezing Drizzle (light)',
      icons: {
        day: 'mdi-weather-rainy-freeze',
        night: 'mdi-weather-rainy-freeze',
      },
      weatherType: 'rainy',
    },
    57: {
      condition: 'Freezing Drizzle (dense)',
      icons: {
        day: 'mdi-weather-rainy-freeze',
        night: 'mdi-weather-rainy-freeze',
      },
      weatherType: 'rainy',
    },
    61: {
      condition: 'Rain (slight)',
      icons: { day: 'mdi-weather-rainy', night: 'mdi-weather-rainy' },
      weatherType: 'rainy',
    },
    63: {
      condition: 'Rain (moderate)',
      icons: { day: 'mdi-weather-pouring', night: 'mdi-weather-pouring' },
      weatherType: 'rainy',
    },
    65: {
      condition: 'Rain (heavy)',
      icons: { day: 'mdi-weather-pouring', night: 'mdi-weather-pouring' },
      weatherType: 'rainy',
    },
    66: {
      condition: 'Freezing Rain (light)',
      icons: {
        day: 'mdi-weather-rainy-freeze',
        night: 'mdi-weather-rainy-freeze',
      },
      weatherType: 'rainy',
    },
    67: {
      condition: 'Freezing Rain (heavy)',
      icons: {
        day: 'mdi-weather-rainy-freeze',
        night: 'mdi-weather-rainy-freeze',
      },
      weatherType: 'rainy',
    },
    71: {
      condition: 'Snow fall (slight)',
      icons: { day: 'mdi-weather-snowy', night: 'mdi-weather-snowy' },
      weatherType: 'snowy',
    },
    73: {
      condition: 'Snow fall (moderate)',
      icons: { day: 'mdi-weather-snowy', night: 'mdi-weather-snowy' },
      weatherType: 'snowy',
    },
    75: {
      condition: 'Snow fall (heavy)',
      icons: {
        day: 'mdi-weather-snowy-heavy',
        night: 'mdi-weather-snowy-heavy',
      },
      weatherType: 'snowy',
    },
    77: {
      condition: 'Snow grains',
      icons: {
        day: 'mdi-weather-snowy-rainy',
        night: 'mdi-weather-snowy-rainy',
      },
      weatherType: 'snowy',
    },
    80: {
      condition: 'Rain showers (slight)',
      icons: {
        day: 'mdi-weather-partly-cloudy-rain',
        night: 'mdi-weather-night-partly-cloudy-rain',
      },
      weatherType: 'rainy',
    },
    81: {
      condition: 'Rain showers (moderate)',
      icons: {
        day: 'mdi-weather-partly-cloudy-rain',
        night: 'mdi-weather-night-partly-cloudy-rain',
      },
      weatherType: 'rainy',
    },
    82: {
      condition: 'Rain showers (violent)',
      icons: { day: 'mdi-weather-pouring', night: 'mdi-weather-pouring' },
      weatherType: 'rainy',
    },
    85: {
      condition: 'Snow showers (slight)',
      icons: {
        day: 'mdi-weather-snowy-light',
        night: 'mdi-weather-snowy-light',
      },
      weatherType: 'snowy',
    },
    86: {
      condition: 'Snow showers (heavy)',
      icons: {
        day: 'mdi-weather-snowy-heavy',
        night: 'mdi-weather-snowy-heavy',
      },
      weatherType: 'snowy',
    },
    95: {
      condition: 'Thunderstorm (slight/moderate)',
      icons: { day: 'mdi-weather-lightning', night: 'mdi-weather-lightning' },
      weatherType: 'stormy',
    },
    96: {
      condition: 'Thunderstorm with slight hail',
      icons: { day: 'mdi-weather-hail', night: 'mdi-weather-hail' },
      weatherType: 'stormy',
    },
    99: {
      condition: 'Thunderstorm with heavy hail',
      icons: { day: 'mdi-weather-hail', night: 'mdi-weather-hail' },
      weatherType: 'stormy',
    },
  }

  // Predefined cities with coordinates
  // TODO create table in database.

  async getCurrentWeather (lat: number, lon: number): Promise<WeatherResponse> {
    const params = {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'wind_speed_10m',
        'weather_code',
      ],
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'weather_code',
        'precipitation_sum',
      ],
      timezone: 'auto',
      forecast_days: 7,
    }

    try {
      const responses = await fetchWeatherApi(this.baseUrl, params)
      const response = responses[0]

      // Get timezone info
      const utcOffsetSeconds = response.utcOffsetSeconds()

      // Get current and daily data
      const current = response.current()!
      const daily = response.daily()!

      // Process the data according to the variable order in params
      const weatherData: WeatherResponse = {
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
          windSpeed10m: current.variables(8)!.value(),
          weatherCode: current.variables(9)!.value(),
        },
        daily: {
          time: Array.from({
            length:
              (Number(daily.timeEnd()) - Number(daily.time()))
              / daily.interval(),
          }).map(
            (_, i) =>
              new Date(
                (Number(daily.time())
                  + i * daily.interval()
                  + utcOffsetSeconds)
                * 1000,
              ),
          ),
          temperature2mMax: daily.variables(0)!.valuesArray()!,
          temperature2mMin: daily.variables(1)!.valuesArray()!,
          weatherCode: daily.variables(2)!.valuesArray()!,
          precipitationSum: daily.variables(3)!.valuesArray()!,
        },
      }

      return weatherData
    } catch (error) {
      console.error('Weather API Error:', error)
      throw new Error(`Failed to fetch weather data: ${error}`)
    }
  }

  // get all cities from the public.cities table
  async getCities (): Promise<CityCoordinates[]> {
    const { data, error } = await supabase.from('cities').select('*')

    if (error) {
      console.error('Error fetching cities from DB', error)
      throw new Error(`Failed to fetch cities from database: ${error.message}`)
    }

    return data as CityCoordinates[]
  }

  // Search cities by name from the public.cities table
  async searchCities (query: string): Promise<CityCoordinates[]> {
    if (!query || query.trim().length < 2) {
      return []
    }
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .ilike('name', `%${query.trim()}%`)
      .limit(10)

    if (error) {
      console.error('Error searching cities:', error)
      throw new Error(`Failed to search cities: ${error.message}`)
    }

    return data as CityCoordinates[]
  }

  // Get a user's saved cities and their weather data
  async getSavedCitiesWeather (userId: string): Promise<City[]> {
    if (!userId) {
      return []
    }

    // Fetch the cities saved by the current user from 'user_saved_cities' table
    // and join with 'cities' table to get full city details (lat, lon, etc.)
    const { data: savedCitiesData, error: savedCitiesError } = await supabase
      .from('user_saved_cities')
      .select(
        `
        city_id,
        cities (id, name, country, lat, lon)
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (savedCitiesError) {
      console.error('Error fetching user saved cities:', savedCitiesError)
      throw new Error(
        `Failed to fetch user's saved cities: ${savedCitiesError.message}`,
      )
    }

    if (!savedCitiesData || savedCitiesData.length === 0) {
      return []
    }

    // Extract city coordinates from the joined data
    const userCityCoordinates: CityCoordinates[] = savedCitiesData
      .map((item: any) => item.cities) // 'item.cities' contains the joined city object
      .filter((city: any) => city !== null)

    const weatherPromises = userCityCoordinates.map(async city => {
      try {
        const weatherData = await this.getCurrentWeather(city.lat, city.lon)
        const { condition, icon, weatherType } = this.getWeatherDetails(
          weatherData.current.weatherCode,
          weatherData.current.isDay === 1,
        )

        return {
          id: city.id,
          name: city.name,
          country: city.country,
          temperature: Math.round(weatherData.current.temperature2m),
          condition,
          humidity: Math.round(weatherData.current.relativeHumidity2m),
          windSpeed: Math.round(weatherData.current.windSpeed10m),
          feelsLike: Math.round(weatherData.current.apparentTemperature),
          icon,
          weatherType,
          loading: false,
          error: null,
          lat: city.lat,
          lon: city.lon,
          daily: weatherData.daily,
        }
      } catch {
        return {
          id: city.id,
          name: city.name,
          country: city.country,
          temperature: 0,
          condition: 'Unknown',
          humidity: 0,
          windSpeed: 0,
          feelsLike: 0,
          icon: 'cloud-question',
          weatherType: 'default',
          loading: false,
          error: `Failed to load weather data for ${city.name}`,
          lat: city.lat,
          lon: city.lon,
        }
      }
    })

    return Promise.all(weatherPromises)
  }

  // New method: Add a city to user's saved cities
  async addSavedCity (userId: string, cityId: number): Promise<void> {
    if (!userId || !cityId) {
      throw new Error('User ID and City ID are required to save a city.')
    }
    const { error } = await supabase
      .from('user_saved_cities')
      .insert({ user_id: userId, city_id: cityId })

    if (error) {
      // Check for unique constraint violation (city already saved)
      if (error.code === '23505') {
        // PostgreSQL unique_violation error code
        throw new Error('This city is already in your saved list.')
      }
      console.error('Error saving city:', error)
      throw new Error(`Failed to save city: ${error.message}`)
    }
  }

  // New method: Remove a city from user's saved cities
  async removeSavedCity (userId: string, cityId: number): Promise<void> {
    if (!userId || !cityId) {
      throw new Error('User ID and City ID are required to remove a city.')
    }
    const { error } = await supabase
      .from('user_saved_cities')
      .delete()
      .eq('user_id', userId)
      .eq('city_id', cityId)

    if (error) {
      console.error('Error removing city:', error)
      throw new Error(`Failed to remove city: ${error.message}`)
    }
  }

  // Refactored getCityWeather to include daily data directly from the first API call
  async getCityWeather (cityId: number): Promise<City | null> {
    const { data: cityCoord, error: cityError } = await supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single()

    if (cityError) {
      console.error('Error fetching city details from DB:', cityError)
      throw new Error(
        `Failed to fetch city details for ID ${cityId}: ${cityError.message}`,
      )
    }
    if (!cityCoord) {
      return null
    }

    try {
      // Fetch current and daily weather data in one go
      const weatherData = await this.getCurrentWeather(
        cityCoord.lat,
        cityCoord.lon,
      )
      const { condition, icon, weatherType } = this.getWeatherDetails(
        weatherData.current.weatherCode,
        weatherData.current.isDay === 1,
      )

      return {
        id: cityCoord.id,
        name: cityCoord.name,
        country: cityCoord.country,
        temperature: Math.round(weatherData.current.temperature2m),
        condition,
        humidity: Math.round(weatherData.current.relativeHumidity2m),
        windSpeed: Math.round(weatherData.current.windSpeed10m),
        feelsLike: Math.round(weatherData.current.apparentTemperature),
        icon,
        weatherType,
        loading: false,
        error: null,
        lat: cityCoord.lat, // Include lat
        lon: cityCoord.lon, // Include lon
        daily: weatherData.daily, // Include daily data
      }
    } catch (error) {
      return {
        id: cityCoord.id,
        name: cityCoord.name,
        country: cityCoord.country,
        temperature: 0,
        condition: 'Unknown',
        humidity: 0,
        windSpeed: 0,
        feelsLike: 0,
        icon: 'cloud-question',
        weatherType: 'default',
        loading: false,
        error: `Failed to load weather data: ${error}`,
        lat: cityCoord.lat,
        lon: cityCoord.lon,
      }
    }
  }

  // Function to get weather details (condition string and icon) from WMO code and isDay flag
  private getWeatherDetails (
    weatherCode: number,
    isDay: boolean,
  ): { condition: string, icon: string, weatherType: string } {
    const mapping = this.WMO_WEATHER_CODES[weatherCode]
    if (mapping) {
      return {
        condition: mapping.condition,
        icon: isDay ? mapping.icons.day : mapping.icons.night,
        weatherType: mapping.weatherType,
      }
    }
    return {
      condition: 'Unknown',
      icon: 'mdi-weather-alert',
      weatherType: 'default',
    }
  }
}
