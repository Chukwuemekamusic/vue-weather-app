-- Create a profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  home_location_name text, --e.g "London, UK"
  home_location_coords jsonb, -- e.g., {"lat": 51.5074, "lon": 0.1278}
  preferred_units TEXT DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')), -- <<< ADDED THIS LINE
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments to the table and columns for clarity in your database schema.

COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user, extending auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'References the internal Supabase auth user id.';
COMMENT ON COLUMN public.profiles.preferred_units IS 'User preference for units (metric or imperial).';
COMMENT ON COLUMN public.profiles.home_location_name IS 'User''s saved home location name for quick weather lookup.';
COMMENT ON COLUMN public.profiles.home_location_coords IS 'User''s saved home location coordinates (latitude and longitude).';


-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user registration
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;
-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile for a new user, populating details from OAuth if available.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'When a new user signs up, automatically create a corresponding profile entry.';


-- Function to automatically update `updated_at` TIMESTAMP
CREATE OR REPLACE FUNCTION public.handle_updated_at()

RETURNS TRIGGER AS $$

BEGIN

NEW.updated_at = NOW();

RETURN NEW;

END;

$$ LANGUAGE plpgsql SECURITY DEFINER;



CREATE TRIGGER on_profile_updated

BEFORE UPDATE ON public.profiles

FOR EACH ROW

EXECUTE PROCEDURE public.handle_updated_at();


COMMENT ON FUNCTION public.handle_updated_at() IS 'Sets the updated_at column to the current timestamp.';
COMMENT ON TRIGGER on_profile_updated ON public.profiles IS 'Automatically updates the updated_at timestamp on row modification.';



-- CITIES AND USER_CITIES TABLE 


-- 2. Create the 'cities' table
-- This table will store the master list of all available cities.
CREATE TABLE public.cities (
    id SERIAL PRIMARY KEY, -- Using INT for city IDs from WeatherService
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lon NUMERIC NOT NULL,
    UNIQUE (name, country) -- Ensure unique city-country pairs
);

COMMENT ON TABLE public.cities IS 'Master list of all available cities with their coordinates.';
COMMENT ON COLUMN public.cities.id IS 'Unique ID for the city, matching WeatherService.ts internal IDs.';
COMMENT ON COLUMN public.cities.name IS 'Name of the city.';
COMMENT ON COLUMN public.cities.country IS 'Country the city is located in.';
COMMENT ON COLUMN public.cities.lat IS 'Latitude coordinate of the city.';
COMMENT ON COLUMN public.cities.lon IS 'Longitude coordinate of the city.';


-- 3. Create the 'user_saved_cities' junction table
-- This table links users to the cities they have saved.
CREATE TABLE public.user_saved_cities (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    city_id INT REFERENCES public.cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, city_id) -- Composite primary key to ensure uniqueness
);

COMMENT ON TABLE public.user_saved_cities IS 'Links users to their saved cities.';
COMMENT ON COLUMN public.user_saved_cities.user_id IS 'Foreign key to the auth.users table, identifying the user.';
COMMENT ON COLUMN public.user_saved_cities.city_id IS 'Foreign key to the public.cities table, identifying the saved city.';
COMMENT ON COLUMN public.user_saved_cities.created_at IS 'Timestamp when the city was saved by the user.';


-- 4. Enable Row Level Security (RLS) for new tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_cities ENABLE ROW LEVEL SECURITY;


-- 5. Define RLS Policies for 'cities' table
-- Everyone can view all cities (for search/discovery)
CREATE POLICY "Enable read access for all users on cities"
ON public.cities FOR SELECT
USING (true);

-- 6. Define RLS Policies for 'user_saved_cities' table
-- Users can view their own saved cities
CREATE POLICY "Users can view own saved cities"
ON public.user_saved_cities FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own saved cities
CREATE POLICY "Users can insert own saved cities"
ON public.user_saved_cities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved cities
CREATE POLICY "Users can delete own saved cities"
ON public.user_saved_cities FOR DELETE
USING (auth.uid() = user_id);


-- 7. Populate the 'cities' table, letting 'id' auto-increment
INSERT INTO public.cities (name, country, lat, lon)
VALUES
('Aberdeen', 'United Kingdom', 57.1497, -2.0943),
('Abuja', 'Nigeria', 9.0765, 7.3986),
('Awka', 'Nigeria', 6.212, 7.0712),
('Ibadan', 'Nigeria', 7.3775, 3.947),
('Lagos', 'Nigeria', 6.5244, 3.3792),
('London', 'United Kingdom', 51.5074, -0.1278),
('Minna', 'Nigeria', 9.614, 6.556),
('Onitsha', 'Nigeria', 6.167, 6.787),
('Port Harcourt', 'Nigeria', 4.8156, 7.0498),
('Dubai', 'UAE', 25.2769, 55.2963)
ON CONFLICT (name, country) DO NOTHING; -- Use (name, country) for conflict resolution