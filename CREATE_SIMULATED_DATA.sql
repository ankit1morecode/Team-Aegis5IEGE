-- CREATE SIMULATED ADMIN DASHBOARD DATA
-- Run this to populate your admin dashboard with realistic test data

-- Step 1: Create simulated users in auth.users (if they don't exist)
-- Note: In Supabase, we can't directly create auth.users, so we'll create profiles
-- and assume users exist, or you need to sign up these users first

-- Step 2: Create simulated profiles for test users
INSERT INTO public.profiles (user_id, full_name, email, credit_score, is_blocked)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Rahul Sharma', 'rahul.sharma@email.com', 750, false),
  ('00000000-0000-0000-0000-000000000002', 'Priya Patel', 'priya.patel@email.com', 680, false),
  ('00000000-0000-0000-0000-000000000003', 'Amit Kumar', 'amit.kumar@email.com', 520, true),
  ('00000000-0000-0000-0000-000000000004', 'Sneha Reddy', 'sneha.reddy@email.com', 810, false),
  ('00000000-0000-0000-0000-000000000005', 'Vikram Singh', 'vikram.singh@email.com', 450, false),
  ('00000000-0000-0000-0000-000000000006', 'Anjali Gupta', 'anjali.gupta@email.com', 720, false),
  ('00000000-0000-0000-0000-000000000007', 'Rohit Verma', 'rohit.verma@email.com', 590, false),
  ('00000000-0000-0000-0000-000000000008', 'Kavita Nair', 'kavita.nair@email.com', 780, false),
  ('00000000-0000-0000-0000-000000000009', 'Manoj Joshi', 'manoj.joshi@email.com', 410, true),
  ('00000000-0000-0000-0000-000000000010', 'Deepa Mehta', 'deepa.mehta@email.com', 690, false)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  credit_score = EXCLUDED.credit_score,
  is_blocked = EXCLUDED.is_blocked;

-- Step 3: Create simulated wallets
INSERT INTO public.wallets (user_id, balance, credit_limit, credit_used)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 12500.50, 15000.00, 2500.00),
  ('00000000-0000-0000-0000-000000000002', 8750.25, 12000.00, 3250.00),
  ('00000000-0000-0000-0000-000000000003', 2100.75, 8000.00, 5900.00),
  ('00000000-0000-0000-0000-000000000004', 25400.00, 20000.00, 0.00),
  ('00000000-0000-0000-0000-000000000005', 3200.00, 6000.00, 2800.00),
  ('00000000-0000-0000-0000-000000000006', 15600.80, 14000.00, 0.00),
  ('00000000-0000-0000-0000-000000000007', 5400.30, 10000.00, 4600.00),
  ('00000000-0000-0000-0000-000000000008', 18900.00, 18000.00, 0.00),
  ('00000000-0000-0000-0000-000000000009', 1500.00, 5000.00, 3500.00),
  ('00000000-0000-0000-0000-000000000010', 9800.60, 11000.00, 1200.00)
ON CONFLICT (user_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  credit_limit = EXCLUDED.credit_limit,
  credit_used = EXCLUDED.credit_used;

-- Step 4: Create simulated loans
INSERT INTO public.loans (user_id, loan_amount, interest_rate, interest_amount, total_repayment, repayment_deadline, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 5000.00, 10.00, 500.00, 5500.00, now() + interval '30 days', 'active'),
  ('00000000-0000-0000-0000-000000000002', 3000.00, 12.00, 360.00, 3360.00, now() + interval '25 days', 'active'),
  ('00000000-0000-0000-0000-000000000003', 2000.00, 15.00, 300.00, 2300.00, now() - interval '5 days', 'overdue'),
  ('00000000-0000-0000-0000-000000000004', 8000.00, 8.00, 640.00, 8640.00, now() - interval '10 days', 'paid'),
  ('00000000-0000-0000-0000-000000000005', 1500.00, 18.00, 270.00, 1770.00, now() + interval '15 days', 'active'),
  ('00000000-0000-0000-0000-000000000006', 4000.00, 10.00, 400.00, 4400.00, now() + interval '20 days', 'active'),
  ('00000000-0000-0000-0000-000000000007', 2500.00, 14.00, 350.00, 2850.00, now() - interval '2 days', 'overdue'),
  ('00000000-0000-0000-0000-000000000008', 6000.00, 9.00, 540.00, 6540.00, now() - interval '15 days', 'paid'),
  ('00000000-0000-0000-0000-000000000009', 1000.00, 20.00, 200.00, 1200.00, now() + interval '10 days', 'active'),
  ('00000000-0000-0000-0000-000000000010', 3500.00, 11.00, 385.00, 3885.00, now() + interval '35 days', 'active')
ON CONFLICT DO NOTHING;

-- Step 5: Create simulated transactions
INSERT INTO public.transactions (user_id, type, amount, recipient, description, loan_id)
VALUES 
  -- Rahul Sharma transactions
  ('00000000-0000-0000-0000-000000000001', 'add_money', 10000.00, NULL, 'Initial wallet funding', NULL),
  ('00000000-0000-0000-0000-000000000001', 'loan_disbursement', 5000.00, NULL, 'Loan amount credited', (SELECT id FROM public.loans WHERE user_id = '00000000-0000-0000-0000-000000000001' LIMIT 1)),
  ('00000000-0000-0000-0000-000000000001', 'payment', 2500.00, 'merchant123', 'Online shopping payment', NULL),
  
  -- Priya Patel transactions
  ('00000000-0000-0000-0000-000000000002', 'add_money', 8000.00, NULL, 'Salary credit', NULL),
  ('00000000-0000-0000-0000-000000000002', 'loan_disbursement', 3000.00, NULL, 'Emergency loan', (SELECT id FROM public.loans WHERE user_id = '00000000-0000-0000-0000-000000000002' LIMIT 1)),
  ('00000000-0000-0000-0000-000000000002', 'payment', 1200.00, 'restaurant456', 'Dinner payment', NULL),
  
  -- Amit Kumar transactions
  ('00000000-0000-0000-0000-000000000003', 'add_money', 5000.00, NULL, 'Wallet topup', NULL),
  ('00000000-0000-0000-0000-000000000003', 'loan_disbursement', 2000.00, NULL, 'Personal loan', (SELECT id FROM public.loans WHERE user_id = '00000000-0000-0000-0000-000000000003' LIMIT 1)),
  ('00000000-0000-0000-0000-000000000003', 'payment', 800.00, 'grocery789', 'Grocery shopping', NULL),
  
  -- Sneha Reddy transactions
  ('00000000-0000-0000-0000-000000000004', 'add_money', 20000.00, NULL, 'Business income', NULL),
  ('00000000-0000-0000-0000-000000000004', 'payment', 5000.00, 'supplier111', 'Supplier payment', NULL),
  ('00000000-0000-0000-0000-000000000004', 'payment', 3000.00, 'utility222', 'Utility bills', NULL),
  
  -- Additional transactions for other users
  ('00000000-0000-0000-0000-000000000005', 'add_money', 3000.00, NULL, 'Part-time job', NULL),
  ('00000000-0000-0000-0000-000000000006', 'add_money', 12000.00, NULL, 'Freelance payment', NULL),
  ('00000000-0000-0000-0000-000000000007', 'add_money', 6000.00, NULL, 'Monthly salary', NULL),
  ('00000000-0000-0000-0000-000000000008', 'add_money', 15000.00, NULL, 'Investment returns', NULL),
  ('00000000-0000-0000-0000-000000000009', 'add_money', 2000.00, NULL, 'Pocket money', NULL),
  ('00000000-0000-0000-0000-000000000010', 'add_money', 9000.00, NULL, 'Bonus payment', NULL)
ON CONFLICT DO NOTHING;

-- Step 6: Create simulated KYC records
INSERT INTO public.kyc (user_id, full_name, date_of_birth, pan_number, aadhaar_number, address, city, state, pincode, employment_type, monthly_income, status, submitted_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Rahul Sharma', '1990-05-15', 'ABCDE1234F', '123456789012', '123 Main Street, Koramangala', 'Bangalore', 'Karnataka', '560034', 'Salaried', 75000, 'verified', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000002', 'Priya Patel', '1988-08-22', 'FGHIJ5678K', '987654321098', '456 Park Avenue, Andheri', 'Mumbai', 'Maharashtra', '400053', 'Self-employed', 120000, 'verified', now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000003', 'Amit Kumar', '1992-12-10', 'KLMNO9012P', '456789012345', '789 Gandhi Road, Connaught Place', 'New Delhi', 'Delhi', '110001', 'Salaried', 45000, 'submitted', now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000004', 'Sneha Reddy', '1985-03-18', 'QRSTU3456V', '789012345678', '321 Tech Park, HSR Layout', 'Bangalore', 'Karnataka', '560102', 'Business', 250000, 'verified', now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000005', 'Vikram Singh', '1991-07-25', 'WXYZA7890B', '234567890123', '654 Market Street, Salt Lake', 'Kolkata', 'West Bengal', '700091', 'Salaried', 35000, 'pending', NULL),
  ('00000000-0000-0000-0000-000000000006', 'Anjali Gupta', '1989-11-30', 'BCDEF2345G', '567890123456', '987 Civil Lines, Lucknow', 'Lucknow', 'Uttar Pradesh', '226001', 'Salaried', 55000, 'verified', now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000007', 'Rohit Verma', '1993-02-14', 'HIJKL4567M', '890123456789', '147 Ring Road, Jaipur', 'Jaipur', 'Rajasthan', '302001', 'Salaried', 40000, 'submitted', now() - interval '12 hours'),
  ('00000000-0000-0000-0000-000000000008', 'Kavita Nair', '1987-09-08', 'MNOPA5678N', '345678901234', '258 Marine Drive, Kochi', 'Kochi', 'Kerala', '682020', 'Professional', 85000, 'verified', now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000009', 'Manoj Joshi', '1990-06-20', 'OPQRS6789O', '456789012345', '369 University Road, Pune', 'Pune', 'Maharashtra', '411016', 'Student', 15000, 'rejected', now() - interval '6 days'),
  ('00000000-0000-0000-0000-000000000010', 'Deepa Mehta', '1988-04-12', 'PQRST7890P', '567890123456', '741 Commercial Street, Chennai', 'Chennai', 'Tamil Nadu', '600003', 'Salaried', 65000, 'verified', now() - interval '1 day')
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  status = EXCLUDED.status,
  submitted_at = EXCLUDED.submitted_at;

-- Step 7: Create simulated admin logs
INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'user_blocked', '00000000-0000-0000-0000-000000000003', 'Blocked user due to suspicious activity'),
  ('00000000-0000-0000-0000-000000000001', 'user_unblocked', '00000000-0000-0000-0000-000000000009', 'Unblocked user after verification'),
  ('00000000-0000-0000-0000-000000000001', 'loan_approved', '00000000-0000-0000-0000-000000000006', 'Approved loan request'),
  ('00000000-0000-0000-0000-000000000001', 'kyc_verified', '00000000-0000-0000-0000-000000000002', 'KYC documents verified and approved'),
  ('00000000-0000-0000-0000-000000000001', 'interest_rate_updated', NULL, 'Updated interest rates for all loan tiers'),
  ('00000000-0000-0000-0000-000000000001', 'kyc_rejected', '00000000-0000-0000-0000-000000000009', 'KYC rejected due to insufficient documents'),
  ('00000000-0000-0000-0000-000000000001', 'loan_rejected', '00000000-0000-0000-0000-000000000005', 'Loan rejected due to low credit score'),
  ('00000000-0000-0000-0000-000000000001', 'user_blocked', '00000000-0000-0000-0000-000000000009', 'Blocked user for policy violation')
ON CONFLICT DO NOTHING;

-- Step 8: Verification - Show what data was created
SELECT '=== SIMULATED DATA CREATED ===' as info;
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM public.profiles;
SELECT 'Wallets:' as table_name, COUNT(*) as count FROM public.wallets;
SELECT 'Loans:' as table_name, COUNT(*) as count FROM public.loans;
SELECT 'Transactions:' as table_name, COUNT(*) as count FROM public.transactions;
SELECT 'KYC Records:' as table_name, COUNT(*) as count FROM public.kyc;
SELECT 'Admin Logs:' as table_name, COUNT(*) as count FROM public.admin_logs;

-- Step 9: Sample data preview
SELECT '=== SAMPLE ADMIN DASHBOARD DATA ===' as info;
SELECT 'Top 5 Users:' as section;
SELECT full_name, email, credit_score, is_blocked 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Recent Loans:' as section;
SELECT p.full_name, l.loan_amount, l.status, l.created_at
FROM public.loans l
JOIN public.profiles p ON l.user_id = p.user_id
ORDER BY l.created_at DESC 
LIMIT 5;

SELECT 'Recent Transactions:' as section;
SELECT p.full_name, t.type, t.amount, t.created_at
FROM public.transactions t
JOIN public.profiles p ON t.user_id = p.user_id
ORDER BY t.created_at DESC 
LIMIT 5;
