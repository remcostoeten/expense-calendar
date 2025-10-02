-- Add unique constraint to prevent duplicate events
-- This constraint ensures that the same user cannot have identical events
-- (same title, start time, end time, and calendar)

-- First, clean up any existing duplicates
DELETE FROM events 
WHERE id NOT IN (
    SELECT MIN(id)
    FROM events 
    GROUP BY title, start_time, end_time, calendar_id, user_id
);

-- Add unique constraint
ALTER TABLE events 
ADD CONSTRAINT unique_event_per_user 
UNIQUE (title, start_time, end_time, calendar_id, user_id);

-- Verify the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'events'::regclass 
AND conname = 'unique_event_per_user';