-- Seed script for calendar demo data

INSERT INTO calendars (id, name, description, color, is_default, user_id, created_at, updated_at)
VALUES 
  ('cal_1', 'Work Calendar', 'Professional meetings and tasks', '#3b82f6', true, 'user_1', NOW(), NOW()),
  ('cal_2', 'Personal', 'Personal appointments and reminders', '#10b981', false, 'user_1', NOW(), NOW()),
  ('cal_3', 'Family', 'Family events and gatherings', '#f59e0b', false, 'user_1', NOW(), NOW()),
  ('cal_4', 'Fitness', 'Workout and health activities', '#ef4444', false, 'user_1', NOW(), NOW()),
  ('cal_5', 'Projects', 'Side projects and learning', '#8b5cf6', false, 'user_1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Added comprehensive test events spanning multiple weeks with various types
INSERT INTO events (id, calendar_id, title, description, start_time, end_time, all_day, location, status, created_at, updated_at)
VALUES 
  ('evt_1', 'cal_1', 'Team Standup', 'Daily team sync meeting', 
   CURRENT_DATE + TIME '11:00:00', CURRENT_DATE + TIME '09:30:00', false, 
   'Conference Room A', 'confirmed', NOW(), NOW()),
  
  ('evt_2', 'cal_1', 'Client Presentation', 'Q4 results presentation to stakeholders', 
   CURRENT_DATE + TIME '14:00:00', CURRENT_DATE + TIME '15:30:00', false, 
   'Zoom Meeting', 'confirmed', NOW(), NOW()),
  
  ('evt_3', 'cal_1', 'Code Review', 'Review PRs from the team', 
   CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00', false, 
   'Online', 'confirmed', NOW(), NOW()),
  
  ('evt_4', 'cal_1', 'Sprint Planning', 'Plan next sprint tasks and goals', 
   CURRENT_DATE + INTERVAL '2 days' + TIME '13:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '15:00:00', false, 
   'Conference Room B', 'tentative', NOW(), NOW()),

  ('evt_5', 'cal_1', '1:1 with Manager', 'Weekly check-in and feedback session',
   CURRENT_DATE + INTERVAL '3 days' + TIME '11:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '11:30:00', false,
   'Manager Office', 'confirmed', NOW(), NOW()),

  ('evt_6', 'cal_1', 'Architecture Review', 'Review system design for new feature',
   CURRENT_DATE + INTERVAL '4 days' + TIME '15:00:00', CURRENT_DATE + INTERVAL '4 days' + TIME '16:30:00', false,
   'Conference Room C', 'confirmed', NOW(), NOW()),

  ('evt_7', 'cal_1', 'All Hands Meeting', 'Company-wide quarterly update',
   CURRENT_DATE + INTERVAL '7 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '7 days' + TIME '11:00:00', false,
   'Main Auditorium', 'confirmed', NOW(), NOW()),

  ('evt_8', 'cal_1', 'Tech Talk: AI in Production', 'Learn about deploying AI models',
   CURRENT_DATE + INTERVAL '10 days' + TIME '16:00:00', CURRENT_DATE + INTERVAL '10 days' + TIME '17:00:00', false,
   'Virtual', 'confirmed', NOW(), NOW()),

  ('evt_9', 'cal_1', 'Performance Review', 'Annual performance discussion',
   CURRENT_DATE + INTERVAL '14 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '14 days' + TIME '15:00:00', false,
   'HR Office', 'tentative', NOW(), NOW()),

  ('evt_10', 'cal_1', 'Team Lunch', 'Monthly team bonding lunch',
   CURRENT_DATE + INTERVAL '5 days' + TIME '12:00:00', CURRENT_DATE + INTERVAL '5 days' + TIME '13:30:00', false,
   'Italian Restaurant', 'confirmed', NOW(), NOW()),
  
  ('evt_11', 'cal_2', 'Gym Session', 'Morning workout routine', 
   CURRENT_DATE + TIME '07:00:00', CURRENT_DATE + TIME '08:00:00', false, 
   'Local Gym', 'confirmed', NOW(), NOW()),
  
  ('evt_12', 'cal_2', 'Dentist Appointment', 'Regular checkup', 
   CURRENT_DATE + INTERVAL '3 days' + TIME '16:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '17:00:00', false, 
   '123 Health St', 'confirmed', NOW(), NOW()),
  
  ('evt_13', 'cal_2', 'Book Club', 'Monthly book discussion', 
   CURRENT_DATE + INTERVAL '5 days' + TIME '19:00:00', CURRENT_DATE + INTERVAL '5 days' + TIME '21:00:00', false, 
   'Coffee House', 'confirmed', NOW(), NOW()),

  ('evt_14', 'cal_2', 'Haircut', 'Monthly trim',
   CURRENT_DATE + INTERVAL '8 days' + TIME '15:00:00', CURRENT_DATE + INTERVAL '8 days' + TIME '15:45:00', false,
   'Barber Shop', 'confirmed', NOW(), NOW()),

  ('evt_15', 'cal_2', 'Car Service', 'Oil change and inspection',
   CURRENT_DATE + INTERVAL '12 days' + TIME '09:00:00', CURRENT_DATE + INTERVAL '12 days' + TIME '10:30:00', false,
   'Auto Center', 'confirmed', NOW(), NOW()),

  ('evt_16', 'cal_2', 'Meditation Class', 'Weekly mindfulness session',
   CURRENT_DATE + INTERVAL '6 days' + TIME '18:00:00', CURRENT_DATE + INTERVAL '6 days' + TIME '19:00:00', false,
   'Wellness Center', 'confirmed', NOW(), NOW()),

  ('evt_17', 'cal_2', 'Doctor Appointment', 'Annual physical exam',
   CURRENT_DATE + INTERVAL '20 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '20 days' + TIME '11:00:00', false,
   'Medical Center', 'confirmed', NOW(), NOW()),

  ('evt_18', 'cal_2', 'Piano Lesson', 'Weekly music practice',
   CURRENT_DATE + INTERVAL '2 days' + TIME '17:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '18:00:00', false,
   'Music School', 'confirmed', NOW(), NOW()),

  ('evt_19', 'cal_2', 'Grocery Shopping', 'Weekly groceries',
   CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '12:00:00', false,
   'Supermarket', 'confirmed', NOW(), NOW()),
  
  ('evt_20', 'cal_3', 'Family Dinner', 'Weekly family gathering', 
   CURRENT_DATE + INTERVAL '4 days' + TIME '18:00:00', CURRENT_DATE + INTERVAL '4 days' + TIME '20:00:00', false, 
   'Home', 'confirmed', NOW(), NOW()),
  
  ('evt_21', 'cal_3', 'Kids Soccer Game', 'Watch the kids play soccer', 
   CURRENT_DATE + INTERVAL '6 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '6 days' + TIME '12:00:00', false, 
   'Community Park', 'confirmed', NOW(), NOW()),

  ('evt_22', 'cal_3', 'School Parent-Teacher Meeting', 'Discuss kids progress',
   CURRENT_DATE + INTERVAL '9 days' + TIME '16:00:00', CURRENT_DATE + INTERVAL '9 days' + TIME '17:00:00', false,
   'Elementary School', 'confirmed', NOW(), NOW()),

  ('evt_23', 'cal_3', 'Movie Night', 'Family movie at home',
   CURRENT_DATE + INTERVAL '1 day' + TIME '19:30:00', CURRENT_DATE + INTERVAL '1 day' + TIME '21:30:00', false,
   'Home', 'confirmed', NOW(), NOW()),

  ('evt_24', 'cal_3', 'Beach Day', 'Family outing to the beach',
   CURRENT_DATE + INTERVAL '13 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '13 days' + TIME '16:00:00', false,
   'Sunset Beach', 'tentative', NOW(), NOW()),

  ('evt_25', 'cal_3', 'Grandparents Visit', 'Grandparents coming over for lunch',
   CURRENT_DATE + INTERVAL '11 days' + TIME '12:00:00', CURRENT_DATE + INTERVAL '11 days' + TIME '15:00:00', false,
   'Home', 'confirmed', NOW(), NOW()),

  ('evt_26', 'cal_3', 'Kids Birthday Party', 'Celebrate Emma turning 8',
   CURRENT_DATE + INTERVAL '18 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '18 days' + TIME '17:00:00', false,
   'Party Venue', 'confirmed', NOW(), NOW()),
  
  ('evt_27', 'cal_2', 'Birthday - Mom', 'Mom''s birthday celebration', 
   CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', true, 
   NULL, 'confirmed', NOW(), NOW()),

  ('evt_28', 'cal_2', 'Conference Day 1', 'Tech conference attendance',
   CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '21 days', true,
   'Convention Center', 'confirmed', NOW(), NOW()),

  ('evt_29', 'cal_2', 'Conference Day 2', 'Tech conference attendance',
   CURRENT_DATE + INTERVAL '22 days', CURRENT_DATE + INTERVAL '22 days', true,
   'Convention Center', 'confirmed', NOW(), NOW()),

  ('evt_30', 'cal_2', 'Vacation Day', 'Personal time off',
   CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE + INTERVAL '25 days', true,
   NULL, 'confirmed', NOW(), NOW()),

  ('evt_31', 'cal_4', 'Morning Run', 'Cardio workout',
   CURRENT_DATE + TIME '06:00:00', CURRENT_DATE + TIME '07:00:00', false,
   'Park Trail', 'confirmed', NOW(), NOW()),

  ('evt_32', 'cal_4', 'Yoga Class', 'Evening yoga session',
   CURRENT_DATE + INTERVAL '2 days' + TIME '18:30:00', CURRENT_DATE + INTERVAL '2 days' + TIME '19:30:00', false,
   'Yoga Studio', 'confirmed', NOW(), NOW()),

  ('evt_33', 'cal_4', 'Swimming', 'Lap swimming',
   CURRENT_DATE + INTERVAL '4 days' + TIME '07:00:00', CURRENT_DATE + INTERVAL '4 days' + TIME '08:00:00', false,
   'Community Pool', 'confirmed', NOW(), NOW()),

  ('evt_34', 'cal_4', 'Personal Training', 'Strength training session',
   CURRENT_DATE + INTERVAL '7 days' + TIME '17:00:00', CURRENT_DATE + INTERVAL '7 days' + TIME '18:00:00', false,
   'Fitness Center', 'confirmed', NOW(), NOW()),

  ('evt_35', 'cal_4', 'Cycling', 'Mountain bike ride',
   CURRENT_DATE + INTERVAL '9 days' + TIME '08:00:00', CURRENT_DATE + INTERVAL '9 days' + TIME '10:00:00', false,
   'Mountain Trail', 'tentative', NOW(), NOW()),

  ('evt_36', 'cal_5', 'Side Project: Work on Portfolio', 'Update personal website',
   CURRENT_DATE + INTERVAL '1 day' + TIME '20:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '22:00:00', false,
   'Home Office', 'confirmed', NOW(), NOW()),

  ('evt_37', 'cal_5', 'Online Course: Advanced React', 'Complete module 3',
   CURRENT_DATE + INTERVAL '3 days' + TIME '20:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '21:30:00', false,
   'Home', 'confirmed', NOW(), NOW()),

  ('evt_38', 'cal_5', 'Hackathon Prep', 'Prepare for weekend hackathon',
   CURRENT_DATE + INTERVAL '5 days' + TIME '19:00:00', CURRENT_DATE + INTERVAL '5 days' + TIME '21:00:00', false,
   'Home Office', 'confirmed', NOW(), NOW()),

  ('evt_39', 'cal_5', 'Hackathon', '48-hour coding challenge',
   CURRENT_DATE + INTERVAL '6 days' + TIME '09:00:00', CURRENT_DATE + INTERVAL '8 days' + TIME '17:00:00', false,
   'Tech Hub', 'confirmed', NOW(), NOW()),

  ('evt_40', 'cal_5', 'Blog Writing', 'Write article on Next.js patterns',
   CURRENT_DATE + INTERVAL '10 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '10 days' + TIME '16:00:00', false,
   'Coffee Shop', 'confirmed', NOW(), NOW()),

  ('evt_41', 'cal_5', 'Open Source Contribution', 'Work on GitHub issues',
   CURRENT_DATE + INTERVAL '15 days' + TIME '19:00:00', CURRENT_DATE + INTERVAL '15 days' + TIME '21:00:00', false,
   'Home', 'confirmed', NOW(), NOW()),

  ('evt_42', 'cal_1', 'Lunch with Colleague', 'Catch up with Sarah',
   CURRENT_DATE + INTERVAL '1 day' + TIME '12:30:00', CURRENT_DATE + INTERVAL '1 day' + TIME '13:30:00', false,
   'Cafe Downtown', 'confirmed', NOW(), NOW()),

  ('evt_43', 'cal_1', 'Product Demo', 'Demo new features to stakeholders',
   CURRENT_DATE + INTERVAL '8 days' + TIME '11:00:00', CURRENT_DATE + INTERVAL '8 days' + TIME '12:00:00', false,
   'Virtual Meeting', 'confirmed', NOW(), NOW()),

  ('evt_44', 'cal_1', 'Interview Candidate', 'Technical interview for senior role',
   CURRENT_DATE + INTERVAL '11 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '11 days' + TIME '15:30:00', false,
   'Conference Room A', 'confirmed', NOW(), NOW()),

  ('evt_45', 'cal_1', 'Budget Review', 'Q4 budget planning meeting',
   CURRENT_DATE + INTERVAL '16 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '16 days' + TIME '11:30:00', false,
   'Finance Office', 'tentative', NOW(), NOW()),

  ('evt_46', 'cal_2', 'Coffee with Friend', 'Catch up with Alex',
   CURRENT_DATE + INTERVAL '4 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '4 days' + TIME '11:00:00', false,
   'Local Cafe', 'confirmed', NOW(), NOW()),

  ('evt_47', 'cal_2', 'Photography Walk', 'Practice street photography',
   CURRENT_DATE + INTERVAL '13 days' + TIME '15:00:00', CURRENT_DATE + INTERVAL '13 days' + TIME '17:00:00', false,
   'Downtown', 'tentative', NOW(), NOW()),

  ('evt_48', 'cal_2', 'Cooking Class', 'Learn Italian cuisine',
   CURRENT_DATE + INTERVAL '17 days' + TIME '18:00:00', CURRENT_DATE + INTERVAL '17 days' + TIME '20:00:00', false,
   'Culinary School', 'confirmed', NOW(), NOW()),

  ('evt_49', 'cal_3', 'School Play', 'Kids performing in school play',
   CURRENT_DATE + INTERVAL '19 days' + TIME '19:00:00', CURRENT_DATE + INTERVAL '19 days' + TIME '21:00:00', false,
   'School Auditorium', 'confirmed', NOW(), NOW()),

  ('evt_50', 'cal_3', 'Family Game Night', 'Board games and snacks',
   CURRENT_DATE + INTERVAL '8 days' + TIME '19:00:00', CURRENT_DATE + INTERVAL '8 days' + TIME '21:00:00', false,
   'Home', 'confirmed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Added comprehensive reminders for various events
INSERT INTO event_reminders (id, event_id, remind_at, created_at)
VALUES 
  ('rem_1', 'evt_2', CURRENT_DATE + TIME '13:30:00', NOW()),
  ('rem_2', 'evt_4', CURRENT_DATE + INTERVAL '2 days' + TIME '12:00:00', NOW()),
  ('rem_3', 'evt_12', CURRENT_DATE + INTERVAL '3 days' + TIME '15:00:00', NOW()),
  ('rem_4', 'evt_20', CURRENT_DATE + INTERVAL '4 days' + TIME '17:00:00', NOW()),
  ('rem_5', 'evt_27', CURRENT_DATE + INTERVAL '6 days' + TIME '09:00:00', NOW()),
  ('rem_6', 'evt_7', CURRENT_DATE + INTERVAL '7 days' + TIME '09:00:00', NOW()),
  ('rem_7', 'evt_9', CURRENT_DATE + INTERVAL '14 days' + TIME '13:00:00', NOW()),
  ('rem_8', 'evt_17', CURRENT_DATE + INTERVAL '20 days' + TIME '09:00:00', NOW()),
  ('rem_9', 'evt_22', CURRENT_DATE + INTERVAL '9 days' + TIME '15:00:00', NOW()),
  ('rem_10', 'evt_26', CURRENT_DATE + INTERVAL '18 days' + TIME '12:00:00', NOW()),
  ('rem_11', 'evt_28', CURRENT_DATE + INTERVAL '20 days' + TIME '08:00:00', NOW()),
  ('rem_12', 'evt_39', CURRENT_DATE + INTERVAL '6 days' + TIME '08:00:00', NOW()),
  ('rem_13', 'evt_44', CURRENT_DATE + INTERVAL '11 days' + TIME '13:00:00', NOW()),
  ('rem_14', 'evt_49', CURRENT_DATE + INTERVAL '19 days' + TIME '18:00:00', NOW()),
  ('rem_15', 'evt_15', CURRENT_DATE + INTERVAL '12 days' + TIME '08:00:00', NOW())
ON CONFLICT (id) DO NOTHING;
