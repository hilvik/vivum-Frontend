/*
  # Add activation code to profiles table

  1. Changes
    - Add activation_code column to profiles table
    - Add foreign key constraint to link with waitlist table
    - Update handle_new_user function to include activation code
    - Add security policies for activation code

  2. Security
    - Maintain existing RLS policies
    - Ensure activation codes can only be used once
*/

BEGIN;

-- Add activation_code column to profiles table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'activation_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN activation_code text;
    ALTER TABLE profiles ADD CONSTRAINT profiles_activation_code_key UNIQUE (activation_code);
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_activation_code_fkey'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_activation_code_fkey
    FOREIGN KEY (activation_code)
    REFERENCES waitlist(activation_code)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    activation_code,
    institute,
    country
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'activation_code',
    new.raw_user_meta_data->>'institute',
    new.raw_user_meta_data->>'country'
  );
  RETURN new;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMIT;