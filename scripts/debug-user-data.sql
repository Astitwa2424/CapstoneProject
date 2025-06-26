-- Check for users and their profiles
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.created_at,
    CASE WHEN rp.id IS NOT NULL THEN 'Has Profile' ELSE 'No Profile' END as profile_status
FROM users u
LEFT JOIN restaurant_profiles rp ON u.id = rp.user_id
WHERE u.role = 'RESTAURANT'
ORDER BY u.created_at DESC;

-- Check for orphaned restaurant profiles (profiles without users)
SELECT rp.*, 'ORPHANED' as status
FROM restaurant_profiles rp
LEFT JOIN users u ON rp.user_id = u.id
WHERE u.id IS NULL;

-- Check for users without profiles who should have them
SELECT u.*, 'MISSING PROFILE' as status
FROM users u
LEFT JOIN restaurant_profiles rp ON u.id = rp.user_id
WHERE u.role = 'RESTAURANT' AND rp.id IS NULL;
