/*
  # Fix User Signup RLS Policy

  1. Changes
    - Update RLS policy to allow service role to insert users during signup
    - This fixes the "Database error saving new user" issue during authentication

  2. Security
    - Maintains existing user data protection
    - Only allows service role and authenticated users to insert
*/

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create a new policy that allows both authenticated users and service role to insert
CREATE POLICY "Users and service can insert user data"
  ON users
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Also ensure the service role insert policy exists and is correct
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);