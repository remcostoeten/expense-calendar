-- Create table for default calendar templates
CREATE TABLE IF NOT EXISTS default_calendar_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert default calendar templates
INSERT INTO default_calendar_templates (name, description, color, is_default, sort_order) VALUES
  ('Personal', 'Personal events and appointments', '#10b981', true, 1),
  ('Work', 'Work meetings and tasks', '#3b82f6', false, 2),
  ('Family', 'Family events and gatherings', '#f97316', false, 3),
  ('Health', 'Medical appointments and fitness', '#8b5cf6', false, 4),
  ('Projects', 'Side projects and learning', '#f43f5e', false, 5)
ON CONFLICT DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_default_calendar_templates_sort_order ON default_calendar_templates(sort_order);