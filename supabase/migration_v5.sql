-- Pasin → Harnkhm Lab Migration v5.0
-- Run this in Supabase SQL Editor

-- 1) Add is_important and completed_at to todos
ALTER TABLE todos
  ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 2) Add is_important to todo_templates
ALTER TABLE todo_templates
  ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false;

-- 3) Update existing todos: set is_important = false for all existing rows
UPDATE todos SET is_important = false WHERE is_important IS NULL;
UPDATE todo_templates SET is_important = false WHERE is_important IS NULL;

-- 4) Set completed_at for already-completed todos (approximate: use updated_at or created_at)
UPDATE todos SET completed_at = created_at WHERE status = 'completed' AND completed_at IS NULL;
