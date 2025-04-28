/*
  # Configure Auth Settings for Password Reset

  1. Changes
    - Enable password reset functionality
    - Set proper redirect URL handling
    - Update auth settings

  2. Security
    - Maintain existing RLS policies
    - No changes to existing data
*/

-- Enable RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Update auth settings in the auth.config() function
SELECT auth.set_config(
  'site_url',
  'http://localhost:5174'::text,
  'API URL configuration'::text
);

SELECT auth.set_config(
  'additional_redirect_urls',
  ARRAY['http://localhost:5174/reset-password']::text[],
  'Additional allowed redirect URLs'::text
);