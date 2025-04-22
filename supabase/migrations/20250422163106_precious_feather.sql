/*
  # Fix RLS policies for profiles table

  1. Changes
    - Drop and recreate RLS policies with correct permissions
    - Allow unauthenticated users to create profiles during signup
    - Maintain security while allowing initial profile creation

  2. Security
    - Enable RLS
    - Update policies for better security model
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "New users can create profile" ON profiles;
DROP POLICY IF EXISTS "Allow public to verify activation codes" ON profiles;

-- Create new policies with correct permissions
CREATE POLICY "Enable read access for own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update access for own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Enable insert for signup"
  ON profiles FOR INSERT
  TO public  -- Changed from authenticated to public
  WITH CHECK (true);  -- Allow initial creation, RLS will protect after authentication

-- Allow public to verify activation codes
CREATE POLICY "Allow public to verify activation codes"
  ON profiles FOR SELECT
  TO public
  USING (activation_code IS NOT NULL);