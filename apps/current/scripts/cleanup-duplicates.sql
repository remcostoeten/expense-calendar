-- Script to clean up duplicate events
-- This will remove duplicate events based on title, start_time, end_time, and user_id

-- First, let's see what duplicates exist
SELECT 
    title, 
    start_time, 
    end_time, 
    user_id, 
    COUNT(*) as duplicate_count
FROM events 
GROUP BY title, start_time, end_time, user_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, title;

-- Remove duplicates, keeping only the event with the lowest ID
DELETE FROM events 
WHERE id NOT IN (
    SELECT MIN(id)
    FROM events 
    GROUP BY title, start_time, end_time, user_id
);

-- Verify cleanup
SELECT 
    'Cleanup completed. Remaining events:' as message,
    COUNT(*) as total_events
FROM events;

-- Show remaining events for user 123
SELECT 
    id,
    title,
    start_time,
    end_time,
    calendar_id
FROM events 
WHERE user_id = 123 
ORDER BY start_time;