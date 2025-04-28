/*
  # Configure Auth Settings for Password Reset

  1. Changes
    - Enable password reset functionality
    - Configure auth settings via raw SQL
    - Update redirect URLs

  2. Security
    - Maintain existing RLS policies
    - No changes to existing data
*/

-- Enable RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Update auth settings directly in the database
DO $$
BEGIN
  -- Update site URL
  UPDATE auth.config 
  SET config_value = jsonb_set(
    config_value,
    '{SITE_URL}',
    '"http://localhost:5174"'::jsonb
  );
  
  -- Update redirect URLs
  UPDATE auth.config 
  SET config_value = jsonb_set(
    config_value,
    '{ADDITIONAL_REDIRECT_URLS}',
    '["http://localhost:5174/reset-password"]'::jsonb
  );
END $$;