
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles
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

-- 4. RLS on user_roles: only admins can read
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 5. Create interest_settings table (single row, global config)
CREATE TABLE public.interest_settings (
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

-- Everyone can read interest settings
CREATE POLICY "Anyone can read interest settings"
  ON public.interest_settings FOR SELECT TO authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update interest settings"
  ON public.interest_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert interest settings"
  ON public.interest_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default row
INSERT INTO public.interest_settings (week1_rate, week2_rate, week3_rate, week4_rate, week5_plus_rate)
VALUES (5, 10, 14, 17, 19);

-- 6. Allow admins to read all profiles and wallets
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all wallets"
  ON public.wallets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all loans"
  ON public.loans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
