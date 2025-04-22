/*
  # Create waitlist table

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `institute` (text)
      - `country` (text)
      - `research_interests` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `status` (text)

  2. Security
    - Enable RLS on `waitlist` table
    - Add policy for admins to read all entries
    - Add policy for public to insert entries
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  institute text,
  country text,
  research_interests text,
  role text,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert into waitlist"
  ON waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admins to read waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));