import { supabase } from "@/integrations/supabase/client";

export interface RiskAssessment {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  flags: string[];
  approved: boolean;
}

const RISK_THRESHOLD = 70;

export const assessTransactionRisk = async (
  userId: string,
  amount: number
): Promise<RiskAssessment> => {
  const flags: string[] = [];
  let riskScore = 0;

  // 1. Check transaction history for average spend
  const { data: recentTx } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", userId)
    .eq("type", "payment")
    .order("created_at", { ascending: false })
    .limit(20);

  if (recentTx && recentTx.length > 0) {
    const avgSpend = recentTx.reduce((sum, t) => sum + t.amount, 0) / recentTx.length;

    // Abnormal transaction size (>4x average)
    if (amount > avgSpend * 4) {
      riskScore += 30;
      flags.push(`Amount is ${(amount / avgSpend).toFixed(1)}x your average spend`);
    }

    // Large transaction relative to history
    if (amount > avgSpend * 2) {
      riskScore += 10;
      flags.push("Transaction is significantly above average");
    }
  } else {
    // New user with no history — moderate risk
    riskScore += 15;
    flags.push("Limited transaction history");
  }

  // 2. Check credit score
  const { data: profile } = await supabase
    .from("profiles")
    .select("credit_score")
    .eq("user_id", userId)
    .single();

  if (profile) {
    if (profile.credit_score < 300) {
      riskScore += 30;
      flags.push("Very low credit score");
    } else if (profile.credit_score < 400) {
      riskScore += 15;
      flags.push("Low credit score");
    }
  }

  // 3. Check for multiple active loans
  const { data: activeLoans } = await supabase
    .from("loans")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active");

  if (activeLoans && activeLoans.length >= 3) {
    riskScore += 20;
    flags.push("Multiple active loans");
  } else if (activeLoans && activeLoans.length >= 2) {
    riskScore += 10;
    flags.push("Existing active loans");
  }

  // 4. Check for overdue loans
  const { data: overdueLoans } = await supabase
    .from("loans")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "overdue");

  if (overdueLoans && overdueLoans.length > 0) {
    riskScore += 25;
    flags.push("Overdue loan(s) detected");
  }

  // Cap at 100
  riskScore = Math.min(100, riskScore);

  const riskLevel: "LOW" | "MEDIUM" | "HIGH" =
    riskScore >= 60 ? "HIGH" : riskScore >= 30 ? "MEDIUM" : "LOW";

  return {
    riskScore,
    riskLevel,
    flags,
    approved: riskScore < RISK_THRESHOLD,
  };
};
