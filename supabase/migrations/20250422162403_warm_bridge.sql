/*
  # Add activation code handling

  1. Changes
    - Add function to mark activation codes as used
    - Add trigger to automatically mark codes as used
    - Update user creation handling

  2. Security
    - Functions run with invoker permissions
    - Maintain existing RLS policies
*/

-- Create function to handle activation code usage
CREATE OR REPLACE FUNCTION public.handle_activation_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.activation_code IS NOT NULL THEN
    UPDATE public.waitlist
    SET status = 'used'
    WHERE activation_code = NEW.activation_code
    AND status != 'used';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activation code usage
CREATE OR REPLACE TRIGGER on_profile_activation_code
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_activation_code();

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();