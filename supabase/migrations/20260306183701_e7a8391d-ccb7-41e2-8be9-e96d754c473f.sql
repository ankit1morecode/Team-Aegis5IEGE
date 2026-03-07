
-- Create KYC status enum
CREATE TYPE public.kyc_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');

-- Create KYC table
CREATE TABLE public.kyc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
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

-- Enable RLS
ALTER TABLE public.kyc ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own kyc" ON public.kyc FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kyc" ON public.kyc FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kyc" ON public.kyc FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON public.kyc FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
