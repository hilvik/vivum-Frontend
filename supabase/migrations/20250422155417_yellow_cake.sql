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

-- Function to generate random activation code
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS text AS $$
DECLARE
  chars text[] := ARRAY['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','2','3','4','5','6','7','8','9'];
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || chars[1 + floor(random() * array_length(chars, 1))];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate activation codes for existing entries
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT "Email address" FROM waitlist WHERE activation_code IS NULL
  LOOP
    UPDATE waitlist 
    SET activation_code = (
      SELECT code 
      FROM (
        SELECT generate_activation_code() as code 
        WHERE NOT EXISTS (
          SELECT 1 FROM waitlist WHERE activation_code = generate_activation_code()
        )
      ) unique_code
    )
    WHERE "Email address" = r."Email address";
  END LOOP;
END $$;

-- Add trigger to automatically generate activation code for new entries
CREATE OR REPLACE FUNCTION set_activation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.activation_code IS NULL THEN
    NEW.activation_code := (
      SELECT code 
      FROM (
        SELECT generate_activation_code() as code 
        WHERE NOT EXISTS (
          SELECT 1 FROM waitlist WHERE activation_code = generate_activation_code()
        )
      ) unique_code
    );
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