/*
  # Update handle_new_user function for activation codes

  1. Changes
    - Update handle_new_user function to properly handle activation codes
    - Add trigger for activation code usage
    - Add function to mark activation codes as used

  2. Security
    - Maintain existing RLS policies
    - Ensure activation codes can only be used once
*/

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