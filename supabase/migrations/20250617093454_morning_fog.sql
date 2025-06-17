/*
  # Add company and timezone columns to users table

  1. Changes
     - Add `company` column to users table
     - Add `timezone` column to users table
     
  2. Purpose
     - Support profile settings functionality
     - Fix errors in ProfileSettings component
*/

-- Add company column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'company'
  ) THEN
    ALTER TABLE users ADD COLUMN company text;
  END IF;
END $$;

-- Add timezone column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE users ADD COLUMN timezone text;
  END IF;
END $$;