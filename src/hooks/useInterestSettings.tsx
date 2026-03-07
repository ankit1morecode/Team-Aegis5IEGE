import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface InterestSettings {
  id: string;
  week1_rate: number;
  week2_rate: number;
  week3_rate: number;
  week4_rate: number;
  week5_plus_rate: number;
}

export const useInterestSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["interest-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interest_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as InterestSettings;
    },
    enabled: !!user,
  });

  const updateSettings = useMutation({
    mutationFn: async (settings: Partial<InterestSettings>) => {
      const { id, ...updates } = settings;
      const { error } = await supabase
        .from("interest_settings")
        .update({ ...updates, updated_by: user!.id, updated_at: new Date().toISOString() })
        .eq("id", query.data!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interest-settings"] });
    },
  });

  return { settings: query.data, isLoading: query.isLoading, updateSettings };
};
