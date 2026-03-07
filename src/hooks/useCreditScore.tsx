import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CreditProfile {
  creditScore: number;
  creditLimit: number;
  creditUsed: number;
  availableCredit: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

// Dynamic credit limit based on credit score
export const getCreditLimitFromScore = (score: number): number => {
  if (score >= 800) return 10000;
  if (score >= 700) return 6000;
  if (score >= 600) return 3000;
  if (score >= 500) return 2000;
  if (score >= 300) return 1000;
  return 0; // Too risky
};

export const getRiskLevel = (score: number): "LOW" | "MEDIUM" | "HIGH" => {
  if (score >= 600) return "LOW";
  if (score >= 400) return "MEDIUM";
  return "HIGH";
};

export const useCreditScore = () => {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["credit-profile", user?.id],
    queryFn: async (): Promise<CreditProfile> => {
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("credit_score")
        .eq("user_id", user!.id)
        .single();
      if (pErr) throw pErr;

      const { data: wallet, error: wErr } = await supabase
        .from("wallets")
        .select("credit_limit, credit_used")
        .eq("user_id", user!.id)
        .single();
      if (wErr) throw wErr;

      const score = profile.credit_score;
      const dynamicLimit = getCreditLimitFromScore(score);
      const creditUsed = wallet.credit_used;

      return {
        creditScore: score,
        creditLimit: dynamicLimit,
        creditUsed,
        availableCredit: Math.max(0, dynamicLimit - creditUsed),
        riskLevel: getRiskLevel(score),
      };
    },
    enabled: !!user,
  });

  return {
    creditProfile: profileQuery.data,
    isLoading: profileQuery.isLoading,
  };
};
