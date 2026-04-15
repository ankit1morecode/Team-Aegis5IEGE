-- CREATE SIMULATED DATA WITH REAL USERS
-- This script creates data using existing users or creates a workaround

-- Step 1: Check if we have any real users first
SELECT '=== CHECKING EXISTING USERS ===' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Step 2: If no users exist, create test users by signing up first
-- You need to sign up these users in the app:
-- test1@local.dev / test1234
-- test2@local.dev / test1234
-- test3@local.dev / test1234
-- test4@local.dev / test1234
-- test5@local.dev / test1234

-- Step 3: Create profiles for existing users (if they don't have profiles)
INSERT INTO public.profiles (user_id, full_name, email, credit_score, is_blocked)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 
    CASE 
      WHEN u.email = 'test1@local.dev' THEN 'Rahul Sharma'
      WHEN u.email = 'test2@local.dev' THEN 'Priya Patel'  
      WHEN u.email = 'test3@local.dev' THEN 'Amit Kumar'
      WHEN u.email = 'test4@local.dev' THEN 'Sneha Reddy'
      WHEN u.email = 'test5@local.dev' THEN 'Vikram Singh'
      ELSE 'Test User'
    END
  ) as full_name,
  u.email,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 750
    WHEN u.email = 'test2@local.dev' THEN 680
    WHEN u.email = 'test3@local.dev' THEN 520
    WHEN u.email = 'test4@local.dev' THEN 810
    WHEN u.email = 'test5@local.dev' THEN 450
    ELSE 600
  END as credit_score,
  CASE 
    WHEN u.email = 'test3@local.dev' THEN true  -- Block one user for testing
    ELSE false
  END as is_blocked
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Step 4: Create wallets for users (if they don't have wallets)
INSERT INTO public.wallets (user_id, balance, credit_limit, credit_used)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 12500.50
    WHEN u.email = 'test2@local.dev' THEN 8750.25
    WHEN u.email = 'test3@local.dev' THEN 2100.75
    WHEN u.email = 'test4@local.dev' THEN 25400.00
    WHEN u.email = 'test5@local.dev' THEN 3200.00
    ELSE 5000.00
  END as balance,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 15000.00
    WHEN u.email = 'test2@local.dev' THEN 12000.00
    WHEN u.email = 'test3@local.dev' THEN 8000.00
    WHEN u.email = 'test4@local.dev' THEN 20000.00
    WHEN u.email = 'test5@local.dev' THEN 6000.00
    ELSE 10000.00
  END as credit_limit,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 2500.00
    WHEN u.email = 'test2@local.dev' THEN 3250.00
    WHEN u.email = 'test3@local.dev' THEN 5900.00
    WHEN u.email = 'test4@local.dev' THEN 0.00
    WHEN u.email = 'test5@local.dev' THEN 2800.00
    ELSE 2000.00
  END as credit_used
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.wallets w WHERE w.user_id = u.id
);

-- Step 5: Create sample loans for users
INSERT INTO public.loans (user_id, loan_amount, interest_rate, interest_amount, total_repayment, repayment_deadline, status)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 5000.00
    WHEN u.email = 'test2@local.dev' THEN 3000.00
    WHEN u.email = 'test3@local.dev' THEN 2000.00
    WHEN u.email = 'test4@local.dev' THEN 8000.00
    WHEN u.email = 'test5@local.dev' THEN 1500.00
    ELSE 2500.00
  END as loan_amount,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 10.00
    WHEN u.email = 'test2@local.dev' THEN 12.00
    WHEN u.email = 'test3@local.dev' THEN 15.00
    WHEN u.email = 'test4@local.dev' THEN 8.00
    WHEN u.email = 'test5@local.dev' THEN 18.00
    ELSE 11.00
  END as interest_rate,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 500.00
    WHEN u.email = 'test2@local.dev' THEN 360.00
    WHEN u.email = 'test3@local.dev' THEN 300.00
    WHEN u.email = 'test4@local.dev' THEN 640.00
    WHEN u.email = 'test5@local.dev' THEN 270.00
    ELSE 275.00
  END as interest_amount,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 5500.00
    WHEN u.email = 'test2@local.dev' THEN 3360.00
    WHEN u.email = 'test3@local.dev' THEN 2300.00
    WHEN u.email = 'test4@local.dev' THEN 8640.00
    WHEN u.email = 'test5@local.dev' THEN 1770.00
    ELSE 2775.00
  END as total_repayment,
  now() + (CASE 
    WHEN u.email = 'test1@local.dev' THEN interval '30 days'
    WHEN u.email = 'test2@local.dev' THEN interval '25 days'
    WHEN u.email = 'test3@local.dev' THEN interval '-5 days'  -- Overdue
    WHEN u.email = 'test4@local.dev' THEN interval '-10 days' -- Paid
    WHEN u.email = 'test5@local.dev' THEN interval '15 days'
    ELSE interval '20 days'
  END) as repayment_deadline,
  CASE 
    WHEN u.email = 'test3@local.dev' THEN 'overdue'::loan_status
    WHEN u.email = 'test4@local.dev' THEN 'paid'::loan_status
    ELSE 'active'::loan_status
  END as status
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.loans l WHERE l.user_id = u.id LIMIT 1
)
LIMIT 5;

-- Step 6: Create sample transactions
INSERT INTO public.transactions (user_id, type, amount, recipient, description)
SELECT 
  u.id,
  'add_money'::transaction_type,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 10000.00
    WHEN u.email = 'test2@local.dev' THEN 8000.00
    WHEN u.email = 'test3@local.dev' THEN 5000.00
    WHEN u.email = 'test4@local.dev' THEN 20000.00
    WHEN u.email = 'test5@local.dev' THEN 3000.00
    ELSE 6000.00
  END as amount,
  NULL,
  'Initial wallet funding'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.transactions t WHERE t.user_id = u.id LIMIT 1
)
LIMIT 5;

-- Step 7: Create KYC records
INSERT INTO public.kyc (user_id, full_name, date_of_birth, pan_number, aadhaar_number, address, city, state, pincode, employment_type, monthly_income, status)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 'Rahul Sharma'
    WHEN u.email = 'test2@local.dev' THEN 'Priya Patel'
    WHEN u.email = 'test3@local.dev' THEN 'Amit Kumar'
    WHEN u.email = 'test4@local.dev' THEN 'Sneha Reddy'
    WHEN u.email = 'test5@local.dev' THEN 'Vikram Singh'
    ELSE 'Test User'
  END as full_name,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN '1990-05-15'
    WHEN u.email = 'test2@local.dev' THEN '1988-08-22'
    WHEN u.email = 'test3@local.dev' THEN '1992-12-10'
    WHEN u.email = 'test4@local.dev' THEN '1985-03-18'
    WHEN u.email = 'test5@local.dev' THEN '1991-07-25'
    ELSE '1990-01-01'
  END as date_of_birth,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 'ABCDE1234F'
    WHEN u.email = 'test2@local.dev' THEN 'FGHIJ5678K'
    WHEN u.email = 'test3@local.dev' THEN 'KLMNO9012P'
    WHEN u.email = 'test4@local.dev' THEN 'QRSTU3456V'
    WHEN u.email = 'test5@local.dev' THEN 'WXYZA7890B'
    ELSE 'TEST1234X'
  END as pan_number,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN '123456789012'
    WHEN u.email = 'test2@local.dev' THEN '987654321098'
    WHEN u.email = 'test3@local.dev' THEN '456789012345'
    WHEN u.email = 'test4@local.dev' THEN '789012345678'
    WHEN u.email = 'test5@local.dev' THEN '234567890123'
    ELSE '123456789012'
  END as aadhaar_number,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN '123 Main Street, Koramangala'
    WHEN u.email = 'test2@local.dev' THEN '456 Park Avenue, Andheri'
    WHEN u.email = 'test3@local.dev' THEN '789 Gandhi Road, Connaught Place'
    WHEN u.email = 'test4@local.dev' THEN '321 Tech Park, HSR Layout'
    WHEN u.email = 'test5@local.dev' THEN '654 Market Street, Salt Lake'
    ELSE '123 Test Street'
  END as address,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 'Bangalore'
    WHEN u.email = 'test2@local.dev' THEN 'Mumbai'
    WHEN u.email = 'test3@local.dev' THEN 'New Delhi'
    WHEN u.email = 'test4@local.dev' THEN 'Bangalore'
    WHEN u.email = 'test5@local.dev' THEN 'Kolkata'
    ELSE 'Test City'
  END as city,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 'Karnataka'
    WHEN u.email = 'test2@local.dev' THEN 'Maharashtra'
    WHEN u.email = 'test3@local.dev' THEN 'Delhi'
    WHEN u.email = 'test4@local.dev' THEN 'Karnataka'
    WHEN u.email = 'test5@local.dev' THEN 'West Bengal'
    ELSE 'Test State'
  END as state,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN '560034'
    WHEN u.email = 'test2@local.dev' THEN '400053'
    WHEN u.email = 'test3@local.dev' THEN '110001'
    WHEN u.email = 'test4@local.dev' THEN '560102'
    WHEN u.email = 'test5@local.dev' THEN '700091'
    ELSE '123456'
  END as pincode,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 'Salaried'
    WHEN u.email = 'test2@local.dev' THEN 'Self-employed'
    WHEN u.email = 'test3@local.dev' THEN 'Salaried'
    WHEN u.email = 'test4@local.dev' THEN 'Business'
    WHEN u.email = 'test5@local.dev' THEN 'Salaried'
    ELSE 'Salaried'
  END as employment_type,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 75000
    WHEN u.email = 'test2@local.dev' THEN 120000
    WHEN u.email = 'test3@local.dev' THEN 45000
    WHEN u.email = 'test4@local.dev' THEN 250000
    WHEN u.email = 'test5@local.dev' THEN 35000
    ELSE 50000
  END as monthly_income,
  CASE 
    WHEN u.email = 'test1@local.dev' THEN 'verified'::kyc_status
    WHEN u.email = 'test2@local.dev' THEN 'verified'::kyc_status
    WHEN u.email = 'test3@local.dev' THEN 'submitted'::kyc_status
    WHEN u.email = 'test4@local.dev' THEN 'verified'::kyc_status
    WHEN u.email = 'test5@local.dev' THEN 'pending'::kyc_status
    ELSE 'pending'::kyc_status
  END as status
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.kyc k WHERE k.user_id = u.id
);

-- Step 8: Verification
SELECT '=== DATA CREATION COMPLETE ===' as info;
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM public.profiles;
SELECT 'Wallets:' as table_name, COUNT(*) as count FROM public.wallets;
SELECT 'Loans:' as table_name, COUNT(*) as count FROM public.loans;
SELECT 'Transactions:' as table_name, COUNT(*) as count FROM public.transactions;
SELECT 'KYC Records:' as table_name, COUNT(*) as count FROM public.kyc;

-- Step 9: Sample data preview
SELECT '=== ADMIN DASHBOARD DATA PREVIEW ===' as info;
SELECT full_name, email, credit_score, is_blocked 
FROM public.profiles 
ORDER BY created_at DESC;