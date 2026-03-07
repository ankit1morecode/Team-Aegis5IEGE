import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { calculateWeeklyInterest, fetchInterestTiers } from "@/lib/interestConfig";

export const useLoans = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const loansQuery = useQuery({
    queryKey: ["loans", user?.id],
    queryFn: async () => {
      // Ensure interest tiers are loaded from DB
      await fetchInterestTiers();
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Dynamically calculate current interest for active loans
      return data.map((loan) => {
        if (loan.status !== "active") return loan;
        const daysPassed = Math.floor(
          (Date.now() - new Date(loan.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const weeksPassed = Math.max(1, Math.floor(daysPassed / 7) + 1);
        const calc = calculateWeeklyInterest(loan.loan_amount, weeksPassed);
        return {
          ...loan,
          interest_rate: calc.rate,
          interest_amount: calc.interest,
          total_repayment: calc.total,
        };
      });
    },
    enabled: !!user,
  });

  const repayLoan = useMutation({
    mutationFn: async (loanId: string) => {
      const loan = loansQuery.data?.find((l) => l.id === loanId);
      if (!loan) throw new Error("Loan not found");

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance, credit_used")
        .eq("user_id", user!.id)
        .single();
      if (!wallet || wallet.balance < loan.total_repayment)
        throw new Error("Insufficient balance to repay loan");

      // Update wallet balance and reduce credit_used
      const { error: walletErr } = await supabase
        .from("wallets")
        .update({
          balance: wallet.balance - loan.total_repayment,
          credit_used: Math.max(0, wallet.credit_used - loan.loan_amount),
        })
        .eq("user_id", user!.id);
      if (walletErr) throw walletErr;

      const { error: loanErr } = await supabase
        .from("loans")
        .update({ status: "paid" })
        .eq("id", loanId);
      if (loanErr) throw loanErr;

      const { error: txErr } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "loan_repayment" as const,
        amount: loan.total_repayment,
        description: `Repaid loan of ₹${loan.loan_amount} + ₹${loan.interest_amount} interest (${loan.interest_rate}%)`,
        loan_id: loanId,
      });
      if (txErr) throw txErr;

      // Behavioral Credit Scoring: reward good repayment
      const { data: profile } = await supabase
        .from("profiles")
        .select("credit_score")
        .eq("user_id", user!.id)
        .single();

      if (profile) {
        const isOnTime = new Date() <= new Date(loan.repayment_deadline);
        const scoreBoost = isOnTime ? 15 : 5;
        const newScore = Math.min(900, profile.credit_score + scoreBoost);

        await supabase
          .from("profiles")
          .update({ credit_score: newScore })
          .eq("user_id", user!.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["credit-profile"] });
    },
  });

  return { loans: loansQuery.data ?? [], isLoading: loansQuery.isLoading, repayLoan };
};
