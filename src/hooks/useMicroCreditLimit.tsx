import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MicroCreditResult {
  credit_limit: number;
  transaction_count: number;
  repayment_success_rate: number;
  monthly_payment_frequency: number;
}

export const useMicroCreditLimit = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["micro-credit-limit", user?.id],
    queryFn: async (): Promise<MicroCreditResult> => {
      const { data, error } = await supabase.rpc("calculate_micro_credit_limit", {
        _user_id: user!.id,
      });
      if (error) throw error;
      return data as unknown as MicroCreditResult;
    },
    enabled: !!user,
  });

  return {
    microCredit: query.data,
    isLoading: query.isLoading,
  };
};
