# Vue 3 Weather App

A dynamic and interactive weather application built with Vue 3, Vuetify 3, TypeScript, and powered by the Open-Meteo API. User authentication and data persistence are managed through Supabase.

## Features

- **User Authentication:** Secure user login and registration using:
  - Email and Password
  - Google OAuth
- **Persistent User Data:**
  - Users can save their preferred cities, which persist across sessions via Supabase database integration.
  - Recently added cities are displayed first on the dashboard.
- **Dynamic Weather Display:**
  - Dashboard view shows current weather conditions for all saved cities using a visually appealing card layout.
  - Weather cards feature dynamic gradient backgrounds and Material Design Icons based on weather conditions (sunny, cloudy, rainy, snowy, stormy).
- **City Search & Management:**
  - Search for cities globally using an autocomplete search bar.
  - Add new cities to your personal dashboard.
  - Remove cities from your saved list.
- **Detailed City Weather View:**
  - Click on any weather card to navigate to a dedicated detail page for a specific city.vue`].
  - The detail page displays current weather conditions and a 7-day forecast.vue`, `WeatherService.ts`].
- **Responsive UI:** Built with Vuetify 3 for a modern and adaptive user interface across different devices.
- **TypeScript:** Ensures type safety and improves code maintainability.

## Technologies Used

- **Frontend Framework:** Vue 3 (with `<script setup>`)
- **UI Framework:** Vuetify 3
- **Routing:** Vue Router (with `vue-router/auto` for automatic route generation)
- **State Management:** Vue `ref`s and `computed` properties, custom composables (`useAuth`)
- **Authentication & Database:** Supabase (PostgreSQL backend, Auth, RLS)
- **Weather API:** Open-Meteo API
- **Language:** TypeScript
- **Build Tool:** Vite

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd vue-weather-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Supabase Setup:**
    <!-- * Create a new Supabase project.
    * Go to `Authentication > Settings` and enable **Google** as an OAuth provider.
    * Add your app's redirect URLs (e.g., `http://localhost:5173/` and `http://localhost:5173/dashboard`) in your Supabase project's `Authentication > URL Configuration`.
    * Set up your database schema by running the SQL commands provided in the `SCHEMA.sql` (or similar) file:
        * Drop existing `user_saved_cities` and `cities` tables if they exist.
        * Create `public.cities` table with `id SERIAL PRIMARY KEY`.
        * Create `public.user_saved_cities` junction table.
        * Enable Row Level Security (RLS) and set up policies for `public.cities` and `public.user_saved_cities` (read access for all on `cities`, user-specific read/write on `user_saved_cities`).
        * Insert initial city data into `public.cities` (e.g., London, Lagos, etc.).
        * Ensure the `profiles` table exists and has the `preferred_units` column (if you decide to implement it later).
    * Create a `.env` file in the root of your project and add your Supabase project URL and Anon Key:
        ```env
        VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
        VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
        ``` -->

4.  **Run the development server:**

    ```bash
    npm run dev
    # OR
    yarn dev
    ```

    The app will typically be available at `http://localhost:5173`.

## Project Structure (Key Directories)

- `src/`: Main application source code
  - `assets/`: Static assets (images, fonts, etc.)
  - `components/`: Reusable Vue components (`WeatherCard.vue`, `SearchBar.vue`, `WeatherIcon.vue`, `Navbar.vue`)
  - `composables/`: Vue Composables (`useAuth.ts`)
  - `lib/`: Utility files (`supabase.ts`)
  - `pages/`: Auto-generated routes based on file structure (`index.vue`, `login.vue`, `city/[id].vue`)
  - `plugins/`: Vuetify configuration (`vuetify.ts`)
  - `services/`: Data fetching and mapping logic (`weatherService.ts`)
  - `types/`: TypeScript type definitions (`auth.ts`)

<!-- ## Contributing

Feel free to open issues or submit pull requests if you have suggestions or improvements!

---

This `README.md` provides a good overview for anyone looking at your repository, covering the core aspects, setup, and technologies used. -->
