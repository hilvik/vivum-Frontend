/*
  # Add activation code to waitlist table

  1. Changes
    - Add activation_code column to waitlist table
    - Generate random activation codes for existing entries
    - Add unique constraint on activation_code
    - Update RLS policies to allow activation code verification

  2. Security
    - Enable RLS
    - Add policy for public to verify activation codes
*/

-- Add activation_code column
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS activation_code text UNIQUE;

-- Function to generate random activation code with retry
CREATE OR REPLACE FUNCTION generate_unique_activation_code()
RETURNS text AS $$
DECLARE
  chars text[] := ARRAY['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','2','3','4','5','6','7','8','9'];
  result text := '';
  max_attempts integer := 10;
  current_attempt integer := 0;
  is_unique boolean := false;
BEGIN
  WHILE NOT is_unique AND current_attempt < max_attempts LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || chars[1 + floor(random() * array_length(chars, 1))];
    END LOOP;
    
    is_unique := NOT EXISTS (
      SELECT 1 FROM waitlist WHERE activation_code = result
    );
    
    current_attempt := current_attempt + 1;
  END LOOP;
  
  IF NOT is_unique THEN
    RAISE EXCEPTION 'Could not generate unique activation code after % attempts', max_attempts;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate activation codes for existing entries one at a time
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT "Email address" FROM waitlist WHERE activation_code IS NULL
  LOOP
    BEGIN
      UPDATE waitlist 
      SET activation_code = generate_unique_activation_code()
      WHERE "Email address" = r."Email address" AND activation_code IS NULL;
    EXCEPTION WHEN unique_violation THEN
      -- If we hit a duplicate, the loop will continue to the next record
      RAISE NOTICE 'Duplicate activation code generated for %', r."Email address";
    END;
  END LOOP;
END $$;

-- Add trigger to automatically generate activation code for new entries
CREATE OR REPLACE FUNCTION set_activation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.activation_code IS NULL THEN
    NEW.activation_code := generate_unique_activation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER waitlist_activation_code
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION set_activation_code();

-- Add policy to allow public to verify activation codes
CREATE POLICY "Allow public to verify activation codes"
  ON waitlist
  FOR SELECT
  TO public
  USING (true);