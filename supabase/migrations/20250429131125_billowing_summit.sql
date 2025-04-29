/*
  # Configure Auth Settings for Password Reset

  1. Changes
    - Enable password reset functionality
    - Configure auth settings
    - Update redirect URLs

  2. Security
    - Maintain existing RLS policies
    - No changes to existing data
*/

-- Enable RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.config if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key text NOT NULL UNIQUE,
    config_value jsonb NOT NULL
);

-- Insert or update site URL configuration
INSERT INTO auth.config (config_key, config_value)
VALUES ('SITE_URL', '"http://localhost:5174"'::jsonb)
ON CONFLICT (config_key) 
DO UPDATE SET config_value = '"http://localhost:5174"'::jsonb;

-- Insert or update redirect URLs configuration
INSERT INTO auth.config (config_key, config_value)
VALUES ('ADDITIONAL_REDIRECT_URLS', '["http://localhost:5174/reset-password"]'::jsonb)
ON CONFLICT (config_key) 
DO UPDATE SET config_value = '["http://localhost:5174/reset-password"]'::jsonb;