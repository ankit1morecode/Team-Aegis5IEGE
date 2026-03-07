
-- Add is_blocked column to profiles
ALTER TABLE public.profiles ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;

-- Create admin_logs table for activity tracking
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read/insert admin logs
CREATE POLICY "Admins can view admin logs" ON public.admin_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert admin logs" ON public.admin_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can update profiles (block/unblock)
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can update loans (mark repaid, cancel)
CREATE POLICY "Admins can update all loans" ON public.loans
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can update wallets (reset, add/deduct)
CREATE POLICY "Admins can update all wallets" ON public.wallets
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can insert transactions (for admin-initiated actions)
CREATE POLICY "Admins can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for admin_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_logs;
