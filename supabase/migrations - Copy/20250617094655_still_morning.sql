/*
  # Fix User Signup Database Trigger

  1. Database Functions
    - Create or replace the handle_new_user function to properly insert user data
    - Ensure the function handles all required fields and potential conflicts

  2. Triggers
    - Create trigger on auth.users to automatically create public.users record
    - Handle the trigger execution properly with error handling

  3. Security
    - Ensure RLS policies allow the trigger to insert data
    - Verify service role permissions
*/

-- Create or replace the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the service role can execute this function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Temporarily allow service_role to insert into users table for the trigger
DO $$
BEGIN
  -- Check if policy exists and drop it
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Service role can insert users'
  ) THEN
    DROP POLICY "Service role can insert users" ON public.users;
  END IF;
END $$;

-- Create policy for service role to insert users (needed for trigger)
CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);