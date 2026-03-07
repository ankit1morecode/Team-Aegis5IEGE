# FastCred 💳⚡

FastCred is a smart micro-credit UPI payment platform that allows users to complete transactions even with insufficient balance.  
If a user’s balance is not enough to complete a payment, the system automatically provides instant micro-credit and applies a time-based interest model.

This ensures seamless payments while enabling flexible short-term credit for users.

---

## 🚀 Features

- 💳 **Instant Micro-Credit Payments**
  - Complete payments even with insufficient balance.

- ⏱ **Grace Period System**
  - No interest if repayment is done within 7 days.

- 📈 **Dynamic Interest Model**
  - Interest increases by **5% each week** after the grace period.

- 📊 **Transaction Tracking**
  - View all payments, credit usage, and repayment history.

- 🔐 **Secure Authentication**
  - User login and authentication system.

- 📉 **Analytics Dashboard**
  - Visualize transactions and credit usage using charts.

- ⚡ **Real-time Data Fetching**
  - Optimized data fetching with caching.

---

## 🏗 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- Lovable Cloud
- PostgreSQL
- Authentication
- Edge Functions
- Cloud Storage

### Libraries
- React Query
- React Router
- Recharts
- Zod
- React Hook Form
- Framer Motion
- lucide-react

---

## 🧠 How It Works

1. User initiates a payment.
2. System checks available wallet balance.
3. If balance is insufficient:
   - Remaining amount is automatically provided as **micro-credit**.
4. User gets **7 days interest-free repayment period**.
5. After 7 days, interest increases **5% every week**.
6. All transactions are stored securely in the database.

---

## 📊 Example Scenario

User Balance: **₹10**  
Purchase Amount: **₹50**

System will:
- Pay **₹50** to merchant
- Provide **₹40 as instant credit**

Repayment conditions:
- **0% interest for first 7 days**
- **+5% interest added each week after that**

---

## 📂 Project Structure
