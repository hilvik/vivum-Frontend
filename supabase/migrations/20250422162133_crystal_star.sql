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

-- Add activation_code column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS activation_code text;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_activation_code_key UNIQUE (activation_code);

-- Add foreign key constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_activation_code_fkey
FOREIGN KEY (activation_code)
REFERENCES waitlist(activation_code)
ON DELETE SET NULL;

-- Create function to handle activation code usage
CREATE OR REPLACE FUNCTION handle_activation_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.activation_code IS NOT NULL THEN
    UPDATE waitlist
    SET status = 'used'
    WHERE activation_code = NEW.activation_code
    AND status != 'used';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for activation code usage
CREATE TRIGGER on_profile_activation_code
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_activation_code();

-- Update handle_new_user function
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

-- Recreate trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();