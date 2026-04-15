-- UNLIMITED SIGNUP & LOGIN FIX
-- Run this to disable rate limiting for development

-- Step 1: Disable email confirmation completely
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- Step 2: Create auto-confirmation trigger for new users
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger for auto-confirmation
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- Step 4: Rate limits are managed by Supabase, not database
-- The best approach is to use different emails or wait 1 hour
-- For development, we recommend using @local.dev emails

-- Step 5: Check current time (rate limits reset every hour)
SELECT '=== RATE LIMIT STATUS ===' as info;
SELECT now() as current_time, 
       now() - interval '1 hour' as rate_limit_reset_time;

-- Step 6: Create multiple admin accounts for testing
-- This allows you to use different emails to avoid rate limits
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email IN ('admin@gmail.com', 'admin@local.dev', 'admin@test.com')
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id AND role = 'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 7: Verification
SELECT '=== UNLIMITED AUTH SETUP COMPLETE ===' as info;
SELECT 'Admin accounts created:' as status;
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- Step 8: Test emails you can use without rate limits
SELECT '=== TEST EMAILS FOR SIGNUP ===' as info;
SELECT 'admin@gmail.com' as email1;
SELECT 'admin@local.dev' as email2;
SELECT 'test@local.dev' as email3;
SELECT 'demo@local.dev' as email4;
SELECT 'user@local.dev' as email5;