-- Ensure austin.larocque@tpsgc-pwgsc.gc.ca has both admin and dev rights
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user_id for the email
    SELECT user_id INTO target_user_id 
    FROM profiles 
    WHERE email = 'austin.larocque@tpsgc-pwgsc.gc.ca';
    
    IF target_user_id IS NOT NULL THEN
        -- Remove any existing roles for this user to avoid duplicates
        DELETE FROM user_roles WHERE user_id = target_user_id;
        
        -- Add admin role
        INSERT INTO user_roles (user_id, role) 
        VALUES (target_user_id, 'admin'::app_role);
        
        -- Add moderator role for dev privileges (if you want separate dev role, we'd need to add it to the enum)
        INSERT INTO user_roles (user_id, role) 
        VALUES (target_user_id, 'moderator'::app_role);
        
        RAISE NOTICE 'Admin and moderator roles assigned to user: austin.larocque@tpsgc-pwgsc.gc.ca';
    ELSE
        RAISE NOTICE 'User not found with email: austin.larocque@tpsgc-pwgsc.gc.ca';
    END IF;
END $$;