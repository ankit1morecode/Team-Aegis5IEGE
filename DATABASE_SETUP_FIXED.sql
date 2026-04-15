-- ========================================
-- COMPLETE DATABASE SETUP FOR MICRO CREDIT UPI (FIXED)
-- ========================================
-- Run this entire script in Supabase SQL Editor

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ========================================
-- CORE TABLES
-- ========================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  credit_score INTEGER NOT NULL DEFAULT 500,
  is_blocked boolean NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 5000.00,
  credit_used NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.wallets;

CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for wallets
DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- KYC status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE public.kyc_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');
    END IF;
END $$;

-- KYC table
CREATE TABLE IF NOT EXISTS public.kyc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  date_of_birth date,
  pan_number text NOT NULL DEFAULT '',
  aadhaar_number text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  pincode text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT '',
  monthly_income numeric NOT NULL DEFAULT 0,
  status kyc_status NOT NULL DEFAULT 'pending',
  submitted_at timestamp with time zone,
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own kyc" ON public.kyc;
DROP POLICY IF EXISTS "Users can insert own kyc" ON public.kyc;
DROP POLICY IF EXISTS "Users can update own kyc" ON public.kyc;

CREATE POLICY "Users can view own kyc" ON public.kyc FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kyc" ON public.kyc FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kyc" ON public.kyc FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create trigger for KYC
DROP TRIGGER IF EXISTS update_kyc_updated_at ON public.kyc;
CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON public.kyc
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- LOANS & TRANSACTIONS
-- ========================================

-- Loan status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
        CREATE TYPE public.loan_status AS ENUM ('active', 'paid', 'overdue');
    END IF;
END $$;

-- Transaction type enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE public.transaction_type AS ENUM ('payment', 'add_money', 'loan_disbursement', 'loan_repayment');
    END IF;
END $$;

-- Loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_amount NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  interest_amount NUMERIC(12,2) NOT NULL,
  total_repayment NUMERIC(12,2) NOT NULL,
  repayment_deadline TIMESTAMPTZ NOT NULL,
  status public.loan_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can insert own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can update own loans" ON public.loans;

CREATE POLICY "Users can view own loans" ON public.loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loans" ON public.loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON public.loans FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for loans
DROP TRIGGER IF EXISTS update_loans_updated_at ON public.loans;
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  recipient TEXT,
  description TEXT,
  loan_id UUID REFERENCES public.loans(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- ADMIN & ROLES
-- ========================================

-- App role enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Interest settings table
CREATE TABLE IF NOT EXISTS public.interest_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week1_rate numeric NOT NULL DEFAULT 5,
  week2_rate numeric NOT NULL DEFAULT 10,
  week3_rate numeric NOT NULL DEFAULT 14,
  week4_rate numeric NOT NULL DEFAULT 17,
  week5_plus_rate numeric NOT NULL DEFAULT 19,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.interest_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read interest settings" ON public.interest_settings;

CREATE POLICY "Anyone can read interest settings" ON public.interest_settings FOR SELECT TO authenticated USING (true);

-- Admin logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can insert admin logs" ON public.admin_logs;

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Role checking function
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

-- Credit limit calculation function
CREATE OR REPLACE FUNCTION public.calculate_micro_credit_limit(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _transaction_count INTEGER;
  _repayment_success_rate NUMERIC;
  _monthly_payment_frequency INTEGER;
  _credit_limit NUMERIC := 500;
BEGIN
  -- Total transaction count
  SELECT COUNT(*) INTO _transaction_count
  FROM transactions WHERE user_id = _user_id;

  -- Repayment success rate
  SELECT CASE
    WHEN COUNT(*) = 0 THEN 100
    ELSE ROUND((COUNT(*) FILTER (WHERE status = 'paid')::NUMERIC / COUNT(*)) * 100, 2)
  END INTO _repayment_success_rate
  FROM loans WHERE user_id = _user_id;

  -- Monthly payment frequency
  SELECT COUNT(*) INTO _monthly_payment_frequency
  FROM transactions
  WHERE user_id = _user_id
    AND created_at >= now() - interval '30 days';

  -- Apply rules
  IF _transaction_count > 20 THEN
    _credit_limit := _credit_limit + 200;
  END IF;

  IF _repayment_success_rate > 90 THEN
    _credit_limit := _credit_limit + 300;
  END IF;

  IF _monthly_payment_frequency > 10 THEN
    _credit_limit := _credit_limit + 200;
  END IF;

  RETURN json_build_object(
    'credit_limit', _credit_limit,
    'transaction_count', _transaction_count,
    'repayment_success_rate', _repayment_success_rate,
    'monthly_payment_frequency', _monthly_payment_frequency
  );
END;
$$;

-- Auto-create profile and wallet on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-assign admin role to admin@gmail.com
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

-- Create auth triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_admin_role();

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert default interest settings
INSERT INTO public.interest_settings (week1_rate, week2_rate, week3_rate, week4_rate, week5_plus_rate)
VALUES (5, 10, 14, 17, 19)
ON CONFLICT DO NOTHING;

-- Disable email confirmation for development
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT 'DATABASE SETUP COMPLETE!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
    'profiles', 'wallets', 'loans', 'transactions', 'kyc', 'user_roles', 'interest_settings', 'admin_logs'
);

SELECT 'Functions created:' as info;
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN (
    'update_updated_at_column', 'handle_new_user', 'assign_admin_role', 'has_role', 'calculate_micro_credit_limit'
);

SELECT 'Enums created:' as info;
SELECT typname FROM pg_type WHERE typname IN (
    'kyc_status', 'loan_status', 'transaction_type', 'app_role'
);
