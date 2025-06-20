# Vue 3 Weather App

A dynamic and interactive weather application built with Vue 3, Vuetify 3, TypeScript, and powered by the Open-Meteo API. User authentication and data persistence are managed through Supabase.

## Features

- **User Authentication:** Secure user login and registration using:
  - Email and Password
  - Google OAuth
- **Persistent User Data & Preferences:**
  - Users can save their preferred cities, which persist across sessions via Supabase database integration.
  - **Theme Preference:** The user's selected light or dark theme is persisted across sessions using `localStorage`.
- **Dynamic Weather Display:**
  - **Main Dashboard:** Displays current weather conditions for **all available cities** from the database using a visually appealing card layout.
  - Weather cards feature dynamic gradient backgrounds and Material Design Icons based on weather conditions (sunny, cloudy, rainy, snowy, stormy).
  - **Robust Error Handling:** Individual weather cards gracefully display "Data Unavailable" messages and provide a "Refresh" option if weather data fails to load for a specific city.
- **City Search & Management:**
  - **Client-Side City Filtering:** A search bar on the main dashboard allows users to quickly filter and find cities that are already displayed by name or country.
  - Users can still add new cities to their _personal saved list_ and remove them, leveraging Supabase for data persistence (though the primary UI for adding new cities from an external API might be on a separate page or a later iteration).
- **Detailed City Weather View:**
  - Clicking on any weather card navigates to a dedicated detail page for that specific city.
  - The detail page displays current weather conditions and a 7-day forecast.
- **Optimized Data Fetching:**
  - **Client-Side Weather Data Caching:** Fetched weather data is cached for at least one hour to reduce redundant API calls and improve performance.
- **Responsive UI:**
  - Built with Vuetify 3 for a modern and adaptive user interface across different devices.
  - **Dynamic Button Sizing:** Key action buttons (e.g., "Sign In with Google") dynamically adjust their text content based on screen size for improved readability on mobile devices.
- **TypeScript:** Ensures type safety and improves code maintainability.
- **Smart Routing:** Authentication guards (`router.beforeResolve`) ensure correct redirection behavior, waiting for asynchronous authentication state to resolve before allowing navigation, preventing erroneous redirects on page refresh.

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
    git clone https://github.com/Chukwuemekamusic/vue-weather-app
    cd vue-weather-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Supabase Setup:**

    - Create a new Supabase project.
    - Go to `Authentication > Settings` and enable **Google** as an OAuth provider.
    - Add your app's redirect URLs (e.g., `http://localhost:3000/`) in your Supabase project's `Authentication > URL Configuration`.
    - Set up your database schema by running the SQL commands provided in the `SCHEMA.sql`
    - Create a `.env` file in the root of your project and add your Supabase project URL and Anon Key:
      ```env
      VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
      VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
      ```

4.  **Running with Docker Compose (Recommended for Local Development/Testing):**

    - Ensure you have Docker Desktop (or Docker Engine) installed and running.
    - From the project root, build and run the application:
      ```bash
      docker compose up --build
      ```
      This command will:
      - Build the Docker image for the frontend service.
      - Start the frontend container.
      - Map container port 80 to host port 3000.
    - For subsequent runs (after the initial build), you can just use:
      ```bash
      docker compose up
      ```
    - To stop the containers:
      `bash
docker compose down
`
      The app will be accessible in your browser at `http://localhost:3000`.

5.  **Run the development server:**

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
