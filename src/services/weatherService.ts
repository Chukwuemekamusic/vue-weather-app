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

// MAKE CacheEntry GENERIC to store different types of data
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast/'
  private readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

  // Use a generic Map for caching
  private weatherCache = new Map<string, CacheEntry<any>>() // 'any' for flexibility

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

  // Public methods first
  async getCurrentWeather (lat: number, lon: number): Promise<WeatherResponse> {
    const cacheKey = this.getCacheKey(
      'raw_weather',
      `${lat.toFixed(4)}_${lon.toFixed(4)}`,
    )

    // Check cache first
    const cachedEntry = this.weatherCache.get(cacheKey)
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      console.log(`Cache hit for raw weather: ${cacheKey}`)
      return cachedEntry.data
    }

    // Cache miss or expired - fetch fresh data
    console.log(
      `Cache miss for raw weather: ${cacheKey} - fetching fresh data`,
    )

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

      const utcOffsetSeconds = response.utcOffsetSeconds()

      const current = response.current()!
      const daily = response.daily()!

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

      // Cache the result
      const now = Date.now()
      this.weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: now,
        expiresAt: now + this.CACHE_DURATION,
      })

      // Optional: Clean expired entries occasionally
      if (Math.random() < 0.1) {
        // 10% chance to clean
        this.cleanExpiredCache()
      }

      return weatherData
    } catch (error) {
      console.error('Weather API Error:', error)
      throw new Error(`Failed to fetch weather data: ${error}`)
    }
  }

  async getCities (): Promise<CityCoordinates[]> {
    // This is fetching from DB, not typically cached in-memory due to potential DB changes
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true }) // Order by name for consistent display

    if (error) {
      console.error('Error fetching cities from DB', error)
      throw new Error(`Failed to fetch cities from database: ${error.message}`)
    }

    return data as CityCoordinates[]
  }

  async getAllDbCitiesWeather (): Promise<City[]> {
    const allCityCoordinates = await this.getCities() // This hits your Supabase DB

    const weatherPromises = allCityCoordinates.map(async city => {
      // MODIFIED: Call getCityWeather to leverage its caching of the formatted City object
      const formattedCity = await this.getCityWeather(city.id)
      if (formattedCity) {
        return formattedCity
      } else {
        // Handle cases where a specific city's weather data couldn't be fetched (e.g., DB city ID invalid)
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
          error: `Failed to load weather data for ${city.name} (ID: ${city.id})`,
          lat: city.lat,
          lon: city.lon,
        }
      }
    })

    return Promise.all(weatherPromises)
  }

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

  async getSavedCitiesWeather (userId: string): Promise<City[]> {
    if (!userId) {
      return []
    }

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

    const userCityCoordinates: CityCoordinates[] = savedCitiesData
      .map((item: any) => item.cities)
      .filter((city: any) => city !== null)

    const weatherPromises = userCityCoordinates.map(async city => {
      // MODIFIED: Call getCityWeather to leverage its caching of the formatted City object
      const formattedCity = await this.getCityWeather(city.id)
      if (formattedCity) {
        return formattedCity
      } else {
        // Handle cases where a specific city's weather data couldn't be fetched (e.g., DB city ID invalid)
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
          error: `Failed to load weather data for ${city.name} (ID: ${city.id})`,
          lat: city.lat,
          lon: city.lon,
        }
      }
    })

    return Promise.all(weatherPromises)
  }

  async insertNewCity (
    city: Omit<CityCoordinates, 'id'>,
  ): Promise<CityCoordinates> {
    const { data, error } = await supabase
      .from('cities')
      .insert({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        const { data: existingCity, error: existingError } = await supabase
          .from('cities')
          .select('id, name, country, lat, lon')
          .eq('name', city.name)
          .eq('country', city.country)
          .single()

        if (existingError) {
          console.error('Error fetching existing city:', existingError)
          throw new Error(
            `Failed to get existing city: ${existingError.message}`,
          )
        }
        if (existingCity) {
          return existingCity as CityCoordinates
        }
      }
      console.error('Error inserting new city:', error)
      throw new Error(
        `Failed to insert new city into database: ${error.message}`,
      )
    }

    return data as CityCoordinates
  }

  async addSavedCity (userId: string, cityId: number): Promise<void> {
    if (!userId || !cityId) {
      throw new Error('User ID and City ID are required to save a city.')
    }
    const { error } = await supabase
      .from('user_saved_cities')
      .insert({ user_id: userId, city_id: cityId })

    if (error) {
      if (error.code === '23505') {
        throw new Error('This city is already in your saved list.')
      }
      console.error('Error saving city:', error)
      throw new Error(`Failed to save city: ${error.message}`)
    }
  }

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

  async getCityWeather (cityId: number): Promise<City | null> {
    const cacheKey = this.getCacheKey('formatted_city', cityId)
    const cachedEntry = this.weatherCache.get(cacheKey)

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      console.log(`Cache hit for formatted city ID ${cityId}`)
      return cachedEntry.data as City
    }

    // Cache miss or expired - fetch fresh data
    console.log(
      `Cache miss for formatted city ID ${cityId} - fetching fresh data`,
    )

    const { data: cityCoord, error: cityError } = await supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single()

    if (cityError) {
      console.error('Error fetching city details from DB:', cityError)
      // Do NOT throw here, return null so calling functions can handle gracefully
      return null
    }
    if (!cityCoord) {
      console.warn(`City with ID ${cityId} not found in database.`)
      return null
    }

    try {
      // getCurrentWeather already has caching, so this will either hit its cache or make a new API call
      const weatherData = await this.getCurrentWeather(
        cityCoord.lat,
        cityCoord.lon,
      )
      const { condition, icon, weatherType } = this.getWeatherDetails(
        weatherData.current.weatherCode,
        weatherData.current.isDay === 1,
      )

      const formattedCity: City = {
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
        lat: cityCoord.lat,
        lon: cityCoord.lon,
        daily: weatherData.daily,
      }

      const now = Date.now()
      this.weatherCache.set(cacheKey, {
        data: formattedCity,
        timestamp: now,
        expiresAt: now + this.CACHE_DURATION,
      })
      return formattedCity
    } catch (error) {
      console.error(`Failed to load weather data for ID ${cityId}:`, error)
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

  // Private methods
  private getCacheKey (dataType: string, id: number | string): string {
    return `${dataType}_${id}`
  }

  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expiresAt
  }

  private cleanExpiredCache (): void {
    const now = Date.now()
    for (const [key, entry] of this.weatherCache.entries()) {
      if (now >= entry.expiresAt) {
        this.weatherCache.delete(key)
        console.log(`Cache entry expired and removed: ${key}`)
      }
    }
  }

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
