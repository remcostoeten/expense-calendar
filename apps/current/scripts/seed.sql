-- Insert mock users
INSERT INTO users (id, name, email, created_at, updated_at)
VALUES 
  (123, 'John Doe', 'john.doe@example.com', NOW(), NOW()),
  (456, 'Jane Smith', 'jane.smith@example.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert default calendars for user_id 123 (John Doe)
INSERT INTO calendars (user_id, name, description, color, is_default) VALUES
  (123, 'My Events', 'Personal events and appointments', '#10b981', true),
  (123, 'Marketing Team', 'Marketing team meetings and campaigns', '#f97316', false),
  (123, 'Interviews', 'Job interviews and candidate meetings', '#8b5cf6', false),
  (123, 'Events Planning', 'Event planning and coordination', '#3b82f6', false),
  (123, 'Holidays', 'Holidays and time off', '#f43f5e', false),
  (123, 'Project Phoenix', 'Tasks related to Project Phoenix', '#d946ef', false),
  (123, 'Client Meetings', 'Meetings with external clients', '#06b6d4', false);

-- Insert default calendars for user_id 456 (Jane Smith)
INSERT INTO calendars (user_id, name, description, color, is_default) VALUES
  (456, 'My Schedule', 'Personal and work appointments', '#ef4444', true),
  (456, 'Engineering Sync', 'Engineering team meetings and syncs', '#f59e0b', false),
  (456, 'Product Roadmap', 'Product planning and roadmap sessions', '#14b8a6', false),
  (456, 'Personal Growth', 'Courses, workshops, and personal development', '#6366f1', false);

-- Insert sample events for user_id 123 (John Doe)
INSERT INTO events (calendar_id, user_id, title, description, start_time, end_time, all_day, location) VALUES
  -- My Events
  (1, 123, 'Dentist Appointment', 'Annual check-up', NOW() + INTERVAL '2 days' + TIME '10:00:00', NOW() + INTERVAL '2 days' + TIME '11:00:00', false, 'Downtown Dental Clinic'),
  (1, 123, 'Gym Session', 'Leg day', NOW() + INTERVAL '3 days' + TIME '18:00:00', NOW() + INTERVAL '3 days' + TIME '19:30:00', false, 'City Fitness'),
  (1, 123, 'Dinner with Sarah', 'Catch up at the new Italian place', NOW() + INTERVAL '5 days' + TIME '19:30:00', NOW() + INTERVAL '5 days' + TIME '21:00:00', false, 'La Trattoria'),

  -- Marketing Team
  (2, 123, 'Q3 Campaign Brainstorm', 'Discuss ideas for the next quarter''s campaign', NOW() + INTERVAL '1 day' + TIME '14:00:00', NOW() + INTERVAL '1 day' + TIME '15:30:00', false, 'Marketing War Room'),
  (2, 123, 'Social Media Analytics Review', 'Weekly review of social media performance', NOW() + INTERVAL '4 days' + TIME '11:00:00', NOW() + INTERVAL '4 days' + TIME '12:00:00', false, 'Online'),

  -- Interviews
  (3, 123, 'Interview: Product Designer', 'Portfolio review and cultural fit interview', NOW() + INTERVAL '6 days' + TIME '13:00:00', NOW() + INTERVAL '6 days' + TIME '14:00:00', false, 'Zoom'),

  -- Events Planning
  (4, 123, 'Summer Party Logistics', 'Finalize vendors and venue for the company summer party', NOW() + INTERVAL '8 days' + TIME '10:00:00', NOW() + INTERVAL '8 days' + TIME '11:30:00', false, 'Conference Room B'),

  -- Holidays
  (5, 123, 'Independence Day', 'Public Holiday', (date_trunc('year', now()) + interval '6 month - 1 day')::date + interval '1 day' * 3, (date_trunc('year', now()) + interval '6 month - 1 day')::date + interval '1 day' * 3, true, NULL),

  -- Project Phoenix
  (6, 123, 'Phoenix: Sprint Planning', 'Plan for the next 2-week sprint', NOW() + INTERVAL '1 day' + TIME '09:00:00', NOW() + INTERVAL '1 day' + TIME '11:00:00', false, 'Project Room 1'),
  (6, 123, 'Phoenix: Daily Standup', 'Daily progress update', NOW() + INTERVAL '2 days' + TIME '09:30:00', NOW() + INTERVAL '2 days' + TIME '09:45:00', false, 'Project Room 1'),

  -- Client Meetings
  (7, 123, 'Acme Corp. - Q3 Check-in', 'Review progress and discuss next steps', NOW() + INTERVAL '3 days' + TIME '15:00:00', NOW() + INTERVAL '3 days' + TIME '16:00:00', false, 'Client Office');

-- Insert sample events for user_id 456 (Jane Smith)
INSERT INTO events (calendar_id, user_id, title, description, start_time, end_time, all_day, location) VALUES
  -- My Schedule
  (8, 456, 'Yoga Class', 'Vinyasa flow', NOW() + INTERVAL '1 day' + TIME '07:00:00', NOW() + INTERVAL '1 day' + TIME '08:00:00', false, 'Serenity Studio'),
  (8, 456, 'Team Lunch', 'Celebrate project milestone', NOW() + INTERVAL '4 days' + TIME '12:30:00', NOW() + INTERVAL '4 days' + TIME '14:00:00', false, 'The Corner Bistro'),

  -- Engineering Sync
  (9, 456, 'Backend Architecture Review', 'Discuss scaling strategy for the API', NOW() + INTERVAL '2 days' + TIME '14:00:00', NOW() + INTERVAL '2 days' + TIME '16:00:00', false, 'Conference Room 3'),
  (9, 456, 'Frontend Performance Guild', 'Share best practices for optimizing React components', NOW() + INTERVAL '7 days' + TIME '11:00:00', NOW() + INTERVAL '7 days' + TIME '12:00:00', false, 'Online'),

  -- Product Roadmap
  (10, 456, 'Q4 Roadmap Planning', 'Define key initiatives for the last quarter', NOW() + INTERVAL '9 days' + TIME '10:00:00', NOW() + INTERVAL '9 days' + TIME '13:00:00', false, 'Product Hub'),

  -- Personal Growth
  (11, 456, 'Advanced TypeScript Workshop', 'Deep dive into generics and conditional types', NOW() + INTERVAL '12 days' + TIME '09:00:00', NOW() + INTERVAL '12 days' + TIME '17:00:00', false, 'Online Workshop');