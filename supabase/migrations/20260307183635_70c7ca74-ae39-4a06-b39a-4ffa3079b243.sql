
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
  -- 1. Total transaction count
  SELECT COUNT(*) INTO _transaction_count
  FROM transactions WHERE user_id = _user_id;

  -- 2. Repayment success rate (paid / total loans * 100)
  SELECT CASE
    WHEN COUNT(*) = 0 THEN 100
    ELSE ROUND((COUNT(*) FILTER (WHERE status = 'paid')::NUMERIC / COUNT(*)) * 100, 2)
  END INTO _repayment_success_rate
  FROM loans WHERE user_id = _user_id;

  -- 3. Monthly payment frequency (transactions in last 30 days)
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
