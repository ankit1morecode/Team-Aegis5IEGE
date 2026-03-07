import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { assessTransactionRisk, RiskAssessment } from "./useRiskEngine";
import { getCreditLimitFromScore } from "./useCreditScore";
import { calculateWeeklyInterest } from "@/components/CreditOfferModal";

interface PaymentResult {
  success: boolean;
  loanCreated: boolean;
  loanAmount?: number;
  interestAmount?: number;
  totalRepayment?: number;
  riskAssessment?: RiskAssessment;
}

export const usePayment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendPayment = useMutation({
    mutationFn: async ({
      recipient,
      amount,
      acceptedLoan = false,
    }: {
      recipient: string;
      amount: number;
      acceptedLoan?: boolean;
    }): Promise<PaymentResult> => {
      // Check if user is blocked
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("user_id", user!.id)
        .single();
      if (profile?.is_blocked) {
        throw new Error("Your account has been blocked by the administrator. You cannot make payments.");
      }

      // Step 1: Risk Assessment
      const risk = await assessTransactionRisk(user!.id, amount);

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance, credit_limit, credit_used")
        .eq("user_id", user!.id)
        .single();
      if (!wallet) throw new Error("Wallet not found");

      const balance = wallet.balance;
      let loanCreated = false;
      let loanAmount = 0;
      let interestAmount = 0;
      let totalRepayment = 0;

      if (balance >= amount) {
        // Sufficient balance — direct payment
        const { error } = await supabase
          .from("wallets")
          .update({ balance: balance - amount })
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        // Need micro-loan — must have been accepted via modal
        if (!acceptedLoan) {
          throw new Error("CREDIT_OFFER_REQUIRED");
        }

        loanAmount = amount - balance;

        // Get dynamic credit limit from credit score
        const { data: profile } = await supabase
          .from("profiles")
          .select("credit_score")
          .eq("user_id", user!.id)
          .single();

        const dynamicLimit = profile ? getCreditLimitFromScore(profile.credit_score) : 5000;
        const creditUsed = wallet.credit_used;
        const availableCredit = Math.max(0, dynamicLimit - creditUsed);

        // Risk check — deny if HIGH risk
        if (!risk.approved) {
          throw new Error(
            `Transaction denied: High risk detected (score: ${risk.riskScore}/100). ${risk.flags.join(". ")}`
          );
        }

        // Credit limit check
        if (loanAmount > availableCredit) {
          throw new Error(
            `Insufficient credit. Required: ₹${loanAmount.toFixed(2)}, Available: ₹${availableCredit.toFixed(2)}`
          );
        }

        // Use the new weekly interest policy: 0% if repaid within 7 days
        // Store initial interest as 0 (first week free), max potential at 4 weeks for display
        const initialCalc = calculateWeeklyInterest(loanAmount, 1); // Week 1 = 0%
        interestAmount = initialCalc.interest; // 0 at creation
        totalRepayment = initialCalc.total; // Just the loan amount
        loanCreated = true;

        // Deduct balance to 0 and update credit_used
        const { error: walletErr } = await supabase
          .from("wallets")
          .update({
            balance: 0,
            credit_used: creditUsed + loanAmount,
            credit_limit: dynamicLimit,
          })
          .eq("user_id", user!.id);
        if (walletErr) throw walletErr;

        // Create loan with 30-day deadline
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);

        const { error: loanErr } = await supabase.from("loans").insert({
          user_id: user!.id,
          loan_amount: loanAmount,
          interest_rate: 0, // Starts at 0%, increases weekly
          interest_amount: interestAmount,
          total_repayment: totalRepayment,
          repayment_deadline: deadline.toISOString(),
        });
        if (loanErr) throw loanErr;

        // Transaction for loan disbursement
        const { error: loanTxErr } = await supabase.from("transactions").insert({
          user_id: user!.id,
          type: "loan_disbursement" as const,
          amount: loanAmount,
          description: `Micro-loan of ₹${loanAmount} for payment to ${recipient}. 0% interest if repaid within 7 days.`,
        });
        if (loanTxErr) throw loanTxErr;
      }

      // Record payment transaction
      const { error: payTxErr } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "payment" as const,
        amount,
        recipient,
        description: `Payment of ₹${amount} to ${recipient}`,
      });
      if (payTxErr) throw payTxErr;

      return { success: true, loanCreated, loanAmount, interestAmount, totalRepayment, riskAssessment: risk };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["credit-profile"] });
    },
  });

  return { sendPayment };
};
