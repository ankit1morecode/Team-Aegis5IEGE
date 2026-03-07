import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMoney = useMutation({
    mutationFn: async (amount: number) => {
      const currentBalance = walletQuery.data?.balance ?? 0;
      const newBalance = currentBalance + amount;

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: "add_money" as const,
        amount,
        description: `Added ₹${amount} to wallet`,
      });
      if (txError) throw txError;

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", user!.id);
      if (walletError) throw walletError;

      return { repaidCount: 0 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return { wallet: walletQuery.data, isLoading: walletQuery.isLoading, addMoney };
};
