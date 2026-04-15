-- ADMIN DASHBOARD USERS FIX
-- Run this to fix users not showing in admin dashboard

-- Step 1: Check if profiles table exists and has data
SELECT '=== PROFILES TABLE CHECK ===' as info;
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Step 2: Show sample profiles data
SELECT '=== SAMPLE PROFILES ===' as info;
SELECT user_id, full_name, email, credit_score, is_blocked, created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 3: Check if auth.users has data
SELECT '=== AUTH USERS CHECK ===' as info;
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Step 4: Show sample auth users
SELECT '=== SAMPLE AUTH USERS ===' as info;
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 5: Check for missing profiles (users exist but no profile)
SELECT '=== USERS WITHOUT PROFILES ===' as info;
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Step 6: Create missing profiles for all users
INSERT INTO public.profiles (user_id, full_name, email)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', 'Unknown User'), u.email
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Step 7: Check wallets table
SELECT '=== WALLETS TABLE CHECK ===' as info;
SELECT COUNT(*) as total_wallets FROM public.wallets;

-- Step 8: Create missing wallets
INSERT INTO public.wallets (user_id, balance)
SELECT u.id, 0.00
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.wallets w WHERE w.user_id = u.id
);

-- Step 9: Check RLS policies on profiles (might block admin access)
SELECT '=== PROFILES RLS POLICIES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 10: Create admin policy if missing
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN auth.users u ON ur.user_id = u.id 
    WHERE u.id = auth.uid() AND ur.role = 'admin'
  )
);

-- Step 11: Test admin access to profiles
SELECT '=== TEST ADMIN PROFILE ACCESS ===' as info;
-- This simulates what the admin dashboard query does
SELECT user_id, full_name, email, credit_score, is_blocked
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 3;

-- Step 12: Final verification
SELECT '=== ADMIN DASHBOARD FIX COMPLETE ===' as info;
SELECT 'Profiles created:' as status, COUNT(*) as count FROM public.profiles;
SELECT 'Wallets created:' as status, COUNT(*) as count FROM public.wallets;
SELECT 'Users with profiles:' as status, COUNT(*) as count 
FROM auth.users u 
JOIN public.profiles p ON u.id = p.user_id;
