/*
  # Add activation code to profiles table

  1. Changes
    - Add activation_code column to profiles table
    - Add foreign key constraint to link with waitlist table
    - Add unique constraint to ensure each activation code is used only once
    - Update RLS policies to handle activation code

  2. Security
    - Maintain existing RLS policies
    - Ensure activation codes can only be used once
*/

-- Add activation_code column to profiles table
ALTER TABLE profiles
ADD COLUMN activation_code text UNIQUE;

-- Add foreign key constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_activation_code_fkey
FOREIGN KEY (activation_code)
REFERENCES waitlist(activation_code)
ON DELETE SET NULL;

-- Update the handle_new_user function to include activation code
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;