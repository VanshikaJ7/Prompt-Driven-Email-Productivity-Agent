/*
  # Email Productivity Agent Schema

  ## Overview
  Creates the complete database schema for the Email Productivity Agent application.

  ## New Tables
  
  ### 1. `prompts`
  Stores user-defined prompt templates that guide the agent's behavior
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Prompt name (categorization, action_item, auto_reply)
  - `content` (text) - The actual prompt text
  - `description` (text) - Human-readable description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `emails`
  Stores inbox emails (mock or real)
  - `id` (uuid, primary key) - Unique identifier
  - `sender` (text) - Email sender address
  - `sender_name` (text) - Sender's display name
  - `subject` (text) - Email subject line
  - `body` (text) - Email body content
  - `category` (text) - Assigned category (Important, Newsletter, Spam, To-Do)
  - `timestamp` (timestamptz) - Email received time
  - `is_processed` (boolean) - Whether email has been processed
  - `created_at` (timestamptz) - Record creation time

  ### 3. `action_items`
  Stores extracted action items from emails
  - `id` (uuid, primary key) - Unique identifier
  - `email_id` (uuid, foreign key) - Reference to parent email
  - `task` (text) - Extracted task description
  - `deadline` (text) - Task deadline (if any)
  - `is_completed` (boolean) - Task completion status
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `drafts`
  Stores generated email drafts
  - `id` (uuid, primary key) - Unique identifier
  - `email_id` (uuid, foreign key, nullable) - Reference to original email (if reply)
  - `subject` (text) - Draft subject line
  - `body` (text) - Draft body content
  - `suggested_followups` (text) - Suggested follow-up actions
  - `metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. `chat_history`
  Stores chat interactions with the email agent
  - `id` (uuid, primary key) - Unique identifier
  - `email_id` (uuid, foreign key, nullable) - Context email (if applicable)
  - `user_message` (text) - User's query
  - `agent_response` (text) - Agent's response
  - `created_at` (timestamptz) - Timestamp

  ## Security
  - RLS enabled on all tables
  - Public access policies for demo purposes (no authentication required)
*/

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  content text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to prompts"
  ON prompts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to prompts"
  ON prompts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to prompts"
  ON prompts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to prompts"
  ON prompts FOR DELETE
  USING (true);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender text NOT NULL,
  sender_name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category text DEFAULT '',
  timestamp timestamptz DEFAULT now(),
  is_processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to emails"
  ON emails FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to emails"
  ON emails FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to emails"
  ON emails FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to emails"
  ON emails FOR DELETE
  USING (true);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id uuid REFERENCES emails(id) ON DELETE CASCADE,
  task text NOT NULL,
  deadline text DEFAULT '',
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to action_items"
  ON action_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to action_items"
  ON action_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to action_items"
  ON action_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to action_items"
  ON action_items FOR DELETE
  USING (true);

-- Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id uuid REFERENCES emails(id) ON DELETE SET NULL,
  subject text NOT NULL,
  body text NOT NULL,
  suggested_followups text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to drafts"
  ON drafts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to drafts"
  ON drafts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to drafts"
  ON drafts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to drafts"
  ON drafts FOR DELETE
  USING (true);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id uuid REFERENCES emails(id) ON DELETE SET NULL,
  user_message text NOT NULL,
  agent_response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to chat_history"
  ON chat_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to chat_history"
  ON chat_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to chat_history"
  ON chat_history FOR DELETE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(category);
CREATE INDEX IF NOT EXISTS idx_emails_timestamp ON emails(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emails_is_processed ON emails(is_processed);
CREATE INDEX IF NOT EXISTS idx_action_items_email_id ON action_items(email_id);
CREATE INDEX IF NOT EXISTS idx_drafts_email_id ON drafts(email_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_email_id ON chat_history(email_id);