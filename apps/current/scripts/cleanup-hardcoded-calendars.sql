-- Migration script to clean up hardcoded calendar names
-- This updates existing calendars with more generic names

-- Update hardcoded calendar names to more generic ones
UPDATE calendars SET 
    name = 'Personal',
    description = 'Personal events and appointments'
WHERE name = 'My Events';

UPDATE calendars SET 
    name = 'Work',
    description = 'Work meetings and tasks'
WHERE name IN ('Marketing Team', 'Events Planning');

UPDATE calendars SET 
    name = 'Health',
    description = 'Medical appointments and fitness'
WHERE name = 'Interviews';

UPDATE calendars SET 
    name = 'Personal Time',
    description = 'Holidays and personal time off'
WHERE name = 'Holidays';

-- Display what was updated
SELECT 
    'Updated ' || COUNT(*) || ' calendars to use generic names' as result
FROM calendars 
WHERE name IN ('Personal', 'Work', 'Health', 'Personal Time');