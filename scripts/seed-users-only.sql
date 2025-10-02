-- Seed script to create only users
-- Run this to fix the foreign key constraint issue when creating calendars

-- Insert test users
INSERT INTO users (id, name, email, created_at, updated_at)
VALUES 
  (123, 'John Doe', 'john.doe@example.com', NOW(), NOW()),
  (456, 'Jane Smith', 'jane.smith@example.com', NOW(), NOW()),
  (789, 'Test User', 'test@example.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify users were created
SELECT id, name, email FROM users WHERE id IN (123, 456, 789);