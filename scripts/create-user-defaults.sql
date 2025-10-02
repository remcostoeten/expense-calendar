-- Function to create default calendars for a new user
-- Usage: SELECT create_default_calendars_for_user(user_id);

CREATE OR REPLACE FUNCTION create_default_calendars_for_user(target_user_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    calendar_count INTEGER;
BEGIN
    -- Check if user already has calendars
    SELECT COUNT(*) INTO calendar_count 
    FROM calendars 
    WHERE user_id = target_user_id;
    
    -- Only create defaults if user has no calendars
    IF calendar_count = 0 THEN
        INSERT INTO calendars (user_id, name, description, color, is_default, created_at, updated_at) VALUES
            (target_user_id, 'Personal', 'Personal events and appointments', '#10b981', true, NOW(), NOW()),
            (target_user_id, 'Work', 'Work meetings and tasks', '#3b82f6', false, NOW(), NOW()),
            (target_user_id, 'Family', 'Family events and gatherings', '#f97316', false, NOW(), NOW()),
            (target_user_id, 'Health', 'Medical appointments and fitness', '#8b5cf6', false, NOW(), NOW()),
            (target_user_id, 'Projects', 'Side projects and learning', '#f43f5e', false, NOW(), NOW());
        
        -- Create default user settings
        INSERT INTO user_settings (user_id, show_current_time, show_recurring_events, default_view, created_at, updated_at)
        VALUES (target_user_id, true, true, 'week', NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING;
        
        RETURN 'Default calendars created for user ' || target_user_id;
    ELSE
        RETURN 'User ' || target_user_id || ' already has ' || calendar_count || ' calendars';
    END IF;
END;
$$ LANGUAGE plpgsql;