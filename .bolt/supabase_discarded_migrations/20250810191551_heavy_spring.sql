/*
  # Fix RLS policies for users table and storage

  1. Users Table Policies
    - Drop any conflicting UPDATE policies
    - Create secure UPDATE policy for authenticated users
    - Ensure users can only update their own profile

  2. Storage Policies
    - Create user-content-avatar bucket if needed
    - Enable RLS on storage.objects
    - Add policies for authenticated users to manage their own avatars
*/

-- Fix users table RLS policies
-- Drop any existing UPDATE policies that might be conflicting
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Allow user updates" ON public.users;

-- Create a clear, secure UPDATE policy for the users table
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create the user-content-avatar storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-content-avatar', 
  'user-content-avatar', 
  false, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing storage policies for user-content-avatar bucket
DROP POLICY IF EXISTS "Authenticated users can view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own avatars" ON storage.objects;

-- Policy for authenticated users to SELECT (read) their own avatar files
CREATE POLICY "Authenticated users can view their own avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- Policy for authenticated users to INSERT (upload) their own avatar files
CREATE POLICY "Authenticated users can upload their own avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- Policy for authenticated users to UPDATE (overwrite) their own avatar files
CREATE POLICY "Authenticated users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- Policy for authenticated users to DELETE their own avatar files
CREATE POLICY "Authenticated users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );