-- Fix events that violate the end_time_after_start_time constraint
-- Update events where end_time <= start_time to have end_time = start_time + 1 hour

UPDATE events
SET end_time = start_time + INTERVAL '1 hour'
WHERE end_time <= start_time;

-- Check if there are still any violations
SELECT COUNT(*) as violations
FROM events
WHERE end_time <= start_time;
