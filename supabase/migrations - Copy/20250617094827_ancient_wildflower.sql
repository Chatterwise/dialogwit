/*
  # Fix user signup trigger

  1. Database Functions
    - Create or replace the `handle_new_user` function to automatically create user profiles
    - This function will be triggered when a new user signs up via Supabase Auth

  2. Triggers
    - Create trigger on `auth.users` table to call the function after insert
    - This ensures every new authenticated user gets a profile in the public.users table

  3. Security
    - Function runs with security definer privileges to bypass RLS
    - Only creates the basic user profile with id and email
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();