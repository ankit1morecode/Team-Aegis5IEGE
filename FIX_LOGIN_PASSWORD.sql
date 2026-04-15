-- LOGIN PASSWORD ISSUE DIAGNOSIS & FIX
-- Run this to fix "wrong password" login errors

-- Step 1: Check if user actually exists
SELECT '=== CHECKING USER EXISTENCE ===' as info;
SELECT id, email, created_at, email_confirmed_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'admin@local.dev' -- Replace with your actual email
ORDER BY created_at DESC;

-- Step 2: Check if user is confirmed (unconfirmed users can't login)
SELECT '=== EMAIL CONFIRMATION STATUS ===' as info;
SELECT email, 
       CASE 
         WHEN email_confirmed_at IS NULL THEN 'NOT CONFIRMED (Login blocked)'
         WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED (Login allowed)'
       END as confirmation_status
FROM auth.users 
WHERE email = 'admin@local.dev'; -- Replace with your actual email

-- Step 3: Force email confirmation (fixes login issues)
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'admin@local.dev' AND email_confirmed_at IS NULL;

-- Step 4: Check if profile and wallet exist (missing can cause issues)
SELECT '=== PROFILE & WALLET STATUS ===' as info;
SELECT u.email,
       CASE WHEN p.user_id IS NULL THEN 'MISSING PROFILE' ELSE 'PROFILE EXISTS' END as profile_status,
       CASE WHEN w.user_id IS NULL THEN 'MISSING WALLET' ELSE 'WALLET EXISTS' END as wallet_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.wallets w ON u.id = w.user_id
WHERE u.email = 'admin@local.dev'; -- Replace with your actual email

-- Step 5: Create missing profile and wallet
INSERT INTO public.profiles (user_id, full_name, email)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', 'Admin User'), u.email
FROM auth.users u
WHERE u.email = 'admin@local.dev'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

INSERT INTO public.wallets (user_id, balance)
SELECT u.id, 0.00
FROM auth.users u
WHERE u.email = 'admin@local.dev'
AND NOT EXISTS (
    SELECT 1 FROM public.wallets w WHERE w.user_id = u.id
);

-- Step 6: Check admin role assignment
SELECT '=== ADMIN ROLE STATUS ===' as info;
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@local.dev'; -- Replace with your actual email

-- Step 7: Assign admin role if missing
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'admin@local.dev'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id AND role = 'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 8: Test password reset (alternative to login)
-- If login still fails, use forgot password feature
SELECT '=== PASSWORD RESET ALTERNATIVE ===' as info;
SELECT 'If login still fails:' as step1;
SELECT '1. Go to http://localhost:8081/login' as step2;
SELECT '2. Click "Forgot Password?"' as step3;
SELECT '3. Enter: admin@local.dev' as step4;
SELECT '4. Check email for reset link' as step5;
SELECT '5. Set new password' as step6;

-- Step 9: Final verification
SELECT '=== LOGIN FIX COMPLETE ===' as info;
SELECT u.email, 
       u.email_confirmed_at as confirmed,
       p.user_id as profile_exists,
       w.user_id as wallet_exists,
       ur.role as admin_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.wallets w ON u.id = w.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@local.dev'; -- Replace with your actual email

-- Step 10: Try these test credentials
SELECT '=== TEST CREDENTIALS ===' as info;
SELECT 'Email: admin@local.dev' as email;
SELECT 'Password: admin1234' as password;
SELECT 'If still fails: Use forgot password feature' as alternative;
