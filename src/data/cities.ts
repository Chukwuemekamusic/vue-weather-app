// src/data/cities.ts

export interface CityCoordinates {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Data for your specified cities, including latitude and longitude.
// You should verify/update these coordinates from your simplemaps.com database for accuracy.
export const CITIES_TO_FETCH: CityCoordinates[] = [
  {
    id: 1,
    name: "London",
    country: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    id: 2,
    name: "Aberdeen",
    country: "United Kingdom",
    latitude: 57.1497,
    longitude: -2.0943,
  },
  {
    id: 3,
    name: "Lagos",
    country: "Nigeria",
    latitude: 6.455,
    longitude: 3.3841,
  },
  {
    id: 4,
    name: "Abuja",
    country: "Nigeria",
    latitude: 9.0579,
    longitude: 7.4951,
  },
  {
    id: 5,
    name: "Ibadan",
    country: "Nigeria",
    latitude: 7.3986,
    longitude: 3.9169,
  },
  {
    id: 6,
    name: "Port Harcourt",
    country: "Nigeria",
    latitude: 4.7793,
    longitude: 7.0135,
  },
  {
    id: 7,
    name: "Awka",
    country: "Nigeria",
    latitude: 6.2088,
    longitude: 7.0094,
  },
  { id: 8, name: "Minna", country: "Nigeria", latitude: 9.62, longitude: 6.55 },
  {
    id: 9,
    name: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.006,
  }, // Example from your test data
  {
    id: 10,
    name: "Tokyo",
    country: "Japan",
    latitude: 35.6895,
    longitude: 139.6917,
  }, // Example from your test data
  {
    id: 11,
    name: "Sydney",
    country: "Australia",
    latitude: -33.8688,
    longitude: 151.2093,
  }, // Example from your test data
  {
    id: 12,
    name: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
  }, // Example from your test data
  {
    id: 13,
    name: "Dubai",
    country: "UAE",
    latitude: 25.2769,
    longitude: 55.2963,
  }, // Example from your test data
];
