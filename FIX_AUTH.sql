-- AUTHENTICATION FIX SCRIPT
-- Run this to fix all authentication issues

-- Step 1: Check current auth users
SELECT '=== CURRENT AUTH USERS ===' as info;
SELECT id, email, created_at, email_confirmed_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Force email confirmation for all users (fix login issues)
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- Step 3: Check if user_roles table exists and has correct structure
SELECT '=== USER_ROLES TABLE CHECK ===' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND table_schema = 'public';

-- Step 4: Recreate user_roles table if needed
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Step 5: Recreate role checking function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 6: Auto-assign admin role to admin@gmail.com
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'admin@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Step 7: Create trigger for admin assignment
DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_admin_role();

-- Step 8: Manual admin role assignment (if admin user exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'admin@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id AND role = 'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 9: Check if profiles and wallets exist for all users
SELECT '=== MISSING PROFILES ===' as info;
SELECT u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

SELECT '=== MISSING WALLETS ===' as info;
SELECT u.email, u.created_at
FROM auth.users u
LEFT JOIN public.wallets w ON u.id = w.user_id
WHERE w.user_id IS NULL;

-- Step 10: Create missing profiles and wallets
INSERT INTO public.profiles (user_id, full_name, email)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', ''), u.email
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

INSERT INTO public.wallets (user_id, balance)
SELECT u.id, 0.00
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.wallets w WHERE w.user_id = u.id
);

-- Step 11: Final verification
SELECT '=== AUTHENTICATION FIX COMPLETE ===' as info;
SELECT 'Users with admin role:' as status;
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

SELECT 'All users with profiles:' as status;
SELECT u.email, p.full_name, p.created_at as profile_created
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id;

SELECT 'All users with wallets:' as status;
SELECT u.email, w.balance, w.created_at as wallet_created
FROM auth.users u
JOIN public.wallets w ON u.id = w.user_id;
