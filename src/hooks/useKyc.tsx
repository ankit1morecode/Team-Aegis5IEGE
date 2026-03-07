import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface KycData {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string | null;
  pan_number: string;
  aadhaar_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  employment_type: string;
  monthly_income: number;
  status: "pending" | "submitted" | "verified" | "rejected";
  submitted_at: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycFormData {
  full_name: string;
  date_of_birth: string;
  pan_number: string;
  aadhaar_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  employment_type: string;
  monthly_income: number;
}

export const useKyc = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: kyc, isLoading } = useQuery({
    queryKey: ["kyc", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("kyc")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as KycData | null;
    },
    enabled: !!user,
  });

  const submitKyc = useMutation({
    mutationFn: async (formData: KycFormData) => {
      if (!user) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        ...formData,
        status: "submitted" as const,
        submitted_at: new Date().toISOString(),
      };

      // Check if KYC record exists
      const { data: existing } = await supabase
        .from("kyc")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("kyc")
          .update(payload)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("kyc").insert(payload);
        if (error) throw error;
      }

      // Auto-verify after 3 seconds (simulating verification)
      setTimeout(async () => {
        await supabase
          .from("kyc")
          .update({ status: "verified", verified_at: new Date().toISOString() })
          .eq("user_id", user.id);
        queryClient.invalidateQueries({ queryKey: ["kyc", user.id] });
      }, 3000);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", user?.id] });
    },
  });

  const isKycVerified = kyc?.status === "verified";
  const isKycSubmitted = kyc?.status === "submitted";
  const isKycPending = !kyc || kyc.status === "pending";
  const isKycRejected = kyc?.status === "rejected";

  return {
    kyc,
    isLoading,
    submitKyc,
    isKycVerified,
    isKycSubmitted,
    isKycPending,
    isKycRejected,
  };
};
