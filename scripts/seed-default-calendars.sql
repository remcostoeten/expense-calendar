-- Seed script to create default calendars for testing
-- This script creates sample calendars and events for development/testing purposes
-- Run this after setting up the database schema

-- First, let's create a test user if it doesn't exist
INSERT INTO users (id, email, name, created_at, updated_at) 
VALUES (123, 'test@example.com', 'Test User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert default calendars for the test user
INSERT INTO calendars (user_id, name, description, color, is_default, created_at, updated_at) VALUES
  (123, 'Personal', 'Personal events and appointments', '#10b981', true, NOW(), NOW()),
  (123, 'Work', 'Work meetings and tasks', '#3b82f6', false, NOW(), NOW()),
  (123, 'Family', 'Family events and gatherings', '#f97316', false, NOW(), NOW()),
  (123, 'Health', 'Medical appointments and fitness', '#8b5cf6', false, NOW(), NOW()),
  (123, 'Projects', 'Side projects and learning', '#f43f5e', false, NOW(), NOW()),
  (123, 'Travel', 'Trips and vacation planning', '#06b6d4', false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Get the calendar IDs for inserting events
-- Note: In a real application, you'd get these IDs programmatically
-- For this seed script, we'll assume the calendars were created with sequential IDs

-- Insert sample events
INSERT INTO events (calendar_id, user_id, title, description, start_time, end_time, all_day, location, created_at, updated_at) VALUES
  -- Personal events
  (1, 123, 'Morning Jog', 'Daily exercise routine', CURRENT_DATE + INTERVAL '1 day' + TIME '07:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '08:00:00', false, 'Central Park', NOW(), NOW()),
  (1, 123, 'Grocery Shopping', 'Weekly grocery run', CURRENT_DATE + INTERVAL '2 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '11:30:00', false, 'Whole Foods', NOW(), NOW()),
  (1, 123, 'Book Club', 'Monthly book discussion', CURRENT_DATE + INTERVAL '5 days' + TIME '19:00:00', CURRENT_DATE + INTERVAL '5 days' + TIME '21:00:00', false, 'Community Center', NOW(), NOW()),

  -- Work events  
  (2, 123, 'Team Standup', 'Daily team sync meeting', CURRENT_DATE + INTERVAL '1 day' + TIME '09:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '09:30:00', false, 'Conference Room A', NOW(), NOW()),
  (2, 123, 'Client Presentation', 'Q4 results presentation', CURRENT_DATE + INTERVAL '3 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '15:30:00', false, 'Zoom', NOW(), NOW()),
  (2, 123, 'Code Review', 'Review pull requests', CURRENT_DATE + INTERVAL '4 days' + TIME '11:00:00', CURRENT_DATE + INTERVAL '4 days' + TIME '12:00:00', false, 'Office', NOW(), NOW()),

  -- Family events
  (3, 123, 'Dinner with Parents', 'Monthly family dinner', CURRENT_DATE + INTERVAL '6 days' + TIME '18:00:00', CURRENT_DATE + INTERVAL '6 days' + TIME '20:00:00', false, 'Home', NOW(), NOW()),
  (3, 123, 'Kids Soccer Game', 'Support the team!', CURRENT_DATE + INTERVAL '7 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '7 days' + TIME '12:00:00', false, 'Sports Complex', NOW(), NOW()),

  -- Health events
  (4, 123, 'Doctor Checkup', 'Annual physical exam', CURRENT_DATE + INTERVAL '8 days' + TIME '15:00:00', CURRENT_DATE + INTERVAL '8 days' + TIME '16:00:00', false, 'Medical Center', NOW(), NOW()),
  (4, 123, 'Yoga Class', 'Evening relaxation', CURRENT_DATE + INTERVAL '2 days' + TIME '18:30:00', CURRENT_DATE + INTERVAL '2 days' + TIME '19:30:00', false, 'Wellness Studio', NOW(), NOW()),

  -- Project events
  (5, 123, 'Learn React', 'Study new framework', CURRENT_DATE + INTERVAL '1 day' + TIME '20:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '22:00:00', false, 'Home Office', NOW(), NOW()),
  (5, 123, 'Side Project Demo', 'Show progress to friends', CURRENT_DATE + INTERVAL '9 days' + TIME '16:00:00', CURRENT_DATE + INTERVAL '9 days' + TIME '17:00:00', false, 'Coffee Shop', NOW(), NOW()),

  -- Travel events
  (6, 123, 'Weekend Getaway', 'Relaxing trip to the mountains', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', true, 'Mountain Resort', NOW(), NOW()),
  (6, 123, 'Flight to Conference', 'Travel for tech conference', CURRENT_DATE + INTERVAL '15 days' + TIME '08:00:00', CURRENT_DATE + INTERVAL '15 days' + TIME '12:00:00', false, 'Airport', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create user settings for the test user
INSERT INTO user_settings (user_id, show_current_time, show_recurring_events, default_view, created_at, updated_at)
VALUES (123, true, true, 'week', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Display success message
SELECT 'Default calendars and events created successfully for test user (ID: 123)' as result;