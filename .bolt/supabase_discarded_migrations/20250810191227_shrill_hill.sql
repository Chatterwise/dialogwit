/*
  # Fix Avatar Storage RLS Policies

  1. Storage Configuration
    - Create avatars storage bucket if it doesn't exist
    - Enable RLS on storage.objects table
    - Add policies for authenticated users to manage their own avatar files

  2. Security
    - Users can only access their own avatar files
    - File paths must follow the pattern: avatars/{user_id}/{filename}
    - Authenticated users only - no anonymous access

  3. Policies
    - SELECT: Users can view their own avatars
    - INSERT: Users can upload their own avatars
    - UPDATE: Users can update their own avatars
    - DELETE: Users can delete their own avatars
*/

-- Create the 'avatars' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  false, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable Row Level Security for storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing avatar-related policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Policy for authenticated users to SELECT (read) their own avatar files
CREATE POLICY "Authenticated users can view their own avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for authenticated users to INSERT (upload) their own avatar files
CREATE POLICY "Authenticated users can upload their own avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for authenticated users to UPDATE (overwrite) their own avatar files
CREATE POLICY "Authenticated users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for authenticated users to DELETE their own avatar files
CREATE POLICY "Authenticated users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Alternative bucket name support (if using 'user-content-avatar' bucket)
-- Create the 'user-content-avatar' storage bucket if it doesn't exist
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

-- Policies for the 'user-content-avatar' bucket
CREATE POLICY "Authenticated users can view their own user content avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can upload their own user content avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can update their own user content avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can delete their own user content avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-content-avatar' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );