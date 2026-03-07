
ALTER TABLE public.wallets ADD COLUMN credit_limit numeric NOT NULL DEFAULT 5000.00;
ALTER TABLE public.wallets ADD COLUMN credit_used numeric NOT NULL DEFAULT 0.00;
