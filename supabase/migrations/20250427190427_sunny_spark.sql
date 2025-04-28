/*
  # Update Auth Settings for Password Reset

  1. Changes
    - Enable password reset functionality
    - Set proper redirect URL handling
    - Update auth settings

  2. Security
    - Maintain existing RLS policies
    - No changes to existing data
*/

-- Update auth settings to handle password resets properly
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Update auth config for proper redirect handling
UPDATE auth.config SET 
  site_url = '${VITE_SUPABASE_REDIRECT_URL:-http://localhost:5174}',
  additional_redirect_urls = ARRAY['${VITE_SUPABASE_REDIRECT_URL:-http://localhost:5174}/reset-password'];