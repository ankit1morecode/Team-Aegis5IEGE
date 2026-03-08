<<<<<<< HEAD
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
=======
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
>>>>>>> b84163ed7bb548c36ebab1d94325627280b2a0bd
