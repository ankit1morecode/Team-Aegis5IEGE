# Database Setup Instructions for MicroCreditUPI

## Summary
Your project has been successfully updated with the new Supabase credentials. The application requires 8 database tables with proper relationships and security policies.

## Required Tables

### 1. **profiles**
- User profile information with credit scores
- Links to auth.users table
- Includes blocking functionality

### 2. **wallets** 
- User wallet balances and credit limits
- Default credit limit: ₹5000
- Tracks credit usage

### 3. **loans**
- Micro-loan records with interest calculations
- Status tracking (active/paid/overdue)
- Dynamic interest rates based on duration

### 4. **transactions**
- All financial transactions
- Types: payment, add_money, loan_disbursement, loan_repayment
- Links to loans for repayments

### 5. **kyc**
- KYC verification documents and status
- Required for loan eligibility
- Status: pending/submitted/verified/rejected

### 6. **user_roles**
- Role management (admin/user)
- Auto-assigns admin role to admin@gmail.com

### 7. **interest_settings**
- Global interest rate configuration
- Tiered rates by loan duration
- Admin-managed

### 8. **admin_logs**
- Admin activity tracking
- Audit trail for all admin actions

## Database Functions

### 1. **handle_new_user()**
- Auto-creates profile and wallet on user signup

### 2. **has_role(user_id, role)**
- Checks if user has specific role
- Used for security policies

### 3. **calculate_micro_credit_limit(user_id)**
- Calculates dynamic credit limits based on:
  - Transaction history
  - Repayment success rate
  - Payment frequency

## Security Features
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have full access for management
- Service role key for admin operations

## Setup Steps

### Step 1: Run Migration Scripts
Execute all migration files in order from the `supabase/migrations/` folder:

```sql
-- Run these in your Supabase SQL editor in order:

-- 1. Core tables and functions
-- (20260306174544_140aec8e-9f3d-440f-89bd-8e41ccdb0c64.sql)

-- 2. Add credit limit to wallets  
-- (20260306181103_b9948bb4-6a96-4669-810f-54476c2ae334.sql)

-- 3. KYC table
-- (20260306183701_e7a8391d-ccb7-41e2-8be9-e96d754c473f.sql)

-- 4. User roles and interest settings
-- (20260307070109_ff68bc99-3696-4624-8197-01069cb8711e.sql)

-- 5. Auto admin assignment
-- (20260307070523_a0d4372e-99a7-4f6f-90d1-62e7b68946a4.sql)

-- 6. Admin transaction access
-- (20260307071352_8379add5-13a8-426b-bb7f-097a14e9ec95.sql)

-- 7. Admin logs and blocking
-- (20260307092912_dfca5d51-ffb1-4612-9cec-7a36b5f36b79.sql)

-- 8. Credit limit calculation
-- (20260307183635_70c7ca74-ae39-4a06-b39a-4ffa3079b243.sql)
```

### Step 2: Configure Authentication
- Enable email/password authentication in Supabase
- Set site URL and redirect URLs properly
- Test admin account creation with admin@gmail.com

### Step 3: Environment Variables
Your `.env` file is already configured with:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon key for client-side
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Service role key (if needed)

### Step 4: Test Connection
Start your application and test:
```bash
npm run dev
```

## Important Notes

### Security Keys
- **Anon Key**: Safe for client-side use (already configured)
- **Service Role Key**: Use only on server-side for admin operations
- Never expose service role key in client code

### Default Admin
- Email: `admin@gmail.com` 
- Auto-assigned admin role on signup
- Can manage all users, loans, and system settings

### Credit System
- Base credit limit: ₹5000
- Dynamic increases based on good behavior
- Interest rates: 5% (1 week) to 19% (5+ weeks)

### Required Secrets
Only the environment variables in `.env` are needed. No additional secrets required for basic functionality.

## Testing Checklist
- [ ] User registration works
- [ ] Profile auto-creation 
- [ ] Wallet initialization
- [ ] Admin role assignment for admin@gmail.com
- [ ] KYC form submission
- [ ] Loan creation and repayment
- [ ] Transaction recording
- [ ] Admin dashboard functionality

The database schema is comprehensive and ready for your microcredit application!