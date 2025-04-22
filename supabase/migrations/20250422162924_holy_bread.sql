/*
  # Fix RLS policies for profiles table

  1. Changes
    - Add activation_code column to profiles table
    - Update RLS policies to handle profile creation correctly
    - Add policy for checking activation codes

  2. Security
    - Enable RLS
    - Add policies for profile management
    - Add policy for activation code verification
*/

-- Add activation_code column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS activation_code text;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "New users can create profile" ON profiles;

-- Create updated policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "New users can create profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add policy for public activation code verification
CREATE POLICY "Allow public to verify activation codes"
  ON profiles
  FOR SELECT
  TO public
  USING (true);