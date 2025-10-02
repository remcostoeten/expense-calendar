-- Drop existing tables if they have the wrong schema
DROP TABLE IF EXISTS event_reminders CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS calendars CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert mock user
INSERT INTO users (id, name, email, created_at, updated_at)
VALUES (123, 'John Doe', 'john.doe@example.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create calendars table with correct schema matching Drizzle
CREATE TABLE calendars (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6',
  user_id INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create events table with correct schema matching Drizzle
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  all_day BOOLEAN DEFAULT false,
  location VARCHAR(255),
  calendar_id INTEGER NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create event_reminders table with correct schema matching Drizzle
CREATE TABLE event_reminders (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  minutes_before INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_calendars_user_id ON calendars(user_id);
CREATE INDEX idx_events_calendar_id ON events(calendar_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);
CREATE INDEX idx_event_reminders_event_id ON event_reminders(event_id);

-- Insert default calendars with different colors for user_id 123
INSERT INTO calendars (user_id, name, description, color, is_default) VALUES
  (123, 'My Events', 'Personal events and appointments', '#10b981', true),
  (123, 'Marketing Team', 'Marketing team meetings and campaigns', '#f97316', false),
  (123, 'Interviews', 'Job interviews and candidate meetings', '#8b5cf6', false),
  (123, 'Events Planning', 'Event planning and coordination', '#3b82f6', false),
  (123, 'Holidays', 'Holidays and time off', '#f43f5e', false);

-- Insert some sample events for testing
INSERT INTO events (calendar_id, user_id, title, description, start_time, end_time, all_day, location) VALUES
  (1, 123, 'Team Standup', 'Daily team standup meeting', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '30 minutes', false, 'Conference Room A'),
  (2, 123, 'Marketing Campaign Review', 'Review Q4 marketing campaign performance', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', false, 'Marketing Office'),
  (3, 123, 'Interview: Senior Developer', 'Technical interview with candidate', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', false, 'Zoom'),
  (4, 123, 'Company All-Hands', 'Monthly company all-hands meeting', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', false, 'Main Auditorium'),
  (5, 123, 'Thanksgiving', 'Thanksgiving holiday', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days', true, null);
