-- Pasin Migration v4.0
-- Run this in Supabase SQL Editor

-- 1) Create notes table for NotePasin feature
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Enable RLS for notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 3) RLS policies for notes (service role bypasses these, but good for direct access)
CREATE POLICY "notes_select_own" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert_own" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update_own" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notes_delete_own" ON notes FOR DELETE USING (auth.uid() = user_id);

-- 4) Update todo_templates to remove priority constraint (if still needed)
-- Priority is no longer used in app but column remains for backward compat
ALTER TABLE todo_templates ALTER COLUMN priority SET DEFAULT 1;

-- 5) Update todos to remove old CHECK constraint if it exists
-- The app now always inserts priority=1 and points_reward=20
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_priority_check;
ALTER TABLE todos ALTER COLUMN priority SET DEFAULT 1;
