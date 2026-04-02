-- Fix KYC Table - Run This in Supabase SQL Editor

-- First, create the kyc_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE public.kyc_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');
    END IF;
END $$;

-- Drop the table if it exists to recreate properly
DROP TABLE IF EXISTS public.kyc CASCADE;

-- Create the KYC table with correct structure
CREATE TABLE public.kyc (
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

-- Enable Row Level Security
ALTER TABLE public.kyc ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own kyc" ON public.kyc FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kyc" ON public.kyc FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kyc" ON public.kyc FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON public.kyc FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verify table was created
SELECT 'kyc table created successfully' as status;
