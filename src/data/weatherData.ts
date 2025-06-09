// src/data/weatherData.ts

export interface City {
  id: number;
  name: string;
  country: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  icon: string;
}

export const weatherData: City[] = [
  {
    id: 1,
    name: "New York",
    country: "United States",
    temperature: 22,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    feelsLike: 25,
    icon: "cloud-sun",
  },
  {
    id: 2,
    name: "London",
    country: "United Kingdom",
    temperature: 18,
    condition: "Cloudy",
    humidity: 78,
    windSpeed: 8,
    feelsLike: 16,
    icon: "cloud",
  },
  {
    id: 3,
    name: "Tokyo",
    country: "Japan",
    temperature: 28,
    condition: "Sunny",
    humidity: 45,
    windSpeed: 5,
    feelsLike: 32,
    icon: "sun",
  },
  {
    id: 4,
    name: "Sydney",
    country: "Australia",
    temperature: 24,
    condition: "Rainy",
    humidity: 82,
    windSpeed: 15,
    feelsLike: 22,
    icon: "cloud-rain",
  },
  {
    id: 5,
    name: "Paris",
    country: "France",
    temperature: 20,
    condition: "Partly Cloudy",
    humidity: 70,
    windSpeed: 10,
    feelsLike: 23,
    icon: "cloud-sun",
  },
  {
    id: 6,
    name: "Dubai",
    country: "UAE",
    temperature: 35,
    condition: "Sunny",
    humidity: 40,
    windSpeed: 7,
    feelsLike: 38,
    icon: "sun",
  },
];
